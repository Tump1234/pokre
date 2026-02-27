import { logger } from "../utils/logger";
import { createContext, useEffect, useRef, useCallback, useState } from "react";
import { store } from "../app/store";
import { setUserBalance } from "../providers/auth-slice";
import { useMeQuery, userApi } from "../api/user";
import { adminApi } from "../api/admin";

const backendURL = import.meta.env.VITE_BACKEND_URL;

const wsProtocol = backendURL.startsWith("https") ? "wss" : "ws";

const websocketURL = backendURL.replace(/^https?:\/\//, `${wsProtocol}://`) + "/ws/global";

const jackpotAPIURL = import.meta.env.VITE_BACKEND_URL + "/api/v1/jackpot/current";

interface GlobalWSContextType {
  ws: WebSocket | null;
  jackpotAmount: number;
  userInfo?: {
    userId: number;
    username: string;
    isAdmin?: boolean;
    balance?: number;
    role: string;
    avatar?: string;
  } | null;
  chatMessages: {
    id: number;
    username: string;
    message: string;
    createdAt: string;
  }[];
  sendChatMessage?: (text: string) => void;

  adminNotifications: number;
  resetAdminNotifications: () => void;
}

export const GlobalWebSocketContext = createContext<GlobalWSContextType>({
  ws: null,
  jackpotAmount: 0,
  chatMessages: [],
  adminNotifications: 0,
  resetAdminNotifications: () => {},
});

export function GlobalWebSocketProvider({ children }: { children: React.ReactNode }) {
  const ws = useRef<WebSocket | null>(null);
  const [wsState, setWsState] = useState<WebSocket | null>(null);
  const [jackpotAmount, setJackpotAmount] = useState<number>(0);
  const [chatMessages, setChatMessages] = useState<{ id: number; username: string; message: string; createdAt: string }[]>([]);

  const [adminNotifications, setAdminNotifications] = useState(0);

  const reconnectDelay = 2000;
  const maxReconnectAttempts = 5;
  const reconnectAttempts = useRef(0);

  const token = localStorage.getItem("accessToken");
  const { data: userInfo } = useMeQuery(undefined, { skip: !token });
  const userRef = useRef(userInfo);
  userRef.current = userInfo;

  // ----------------- Reset admin notifications -----------------
  const resetAdminNotifications = useCallback(() => {
    setAdminNotifications(0);
  }, []);

  // ----------------- Fetch initial jackpot -----------------
  useEffect(() => {
    async function fetchInitialJackpot() {
      try {
        const res = await fetch(jackpotAPIURL);
        if (!res.ok) throw new Error("Failed to fetch jackpot");
        const data = await res.json();
        setJackpotAmount(data.amount ?? 0);
      } catch (err) {
        logger.error("Failed to fetch initial jackpot:", err);
      }
    }
    fetchInitialJackpot();
  }, []);

  // ----------------- WebSocket connection -----------------
  const establishWebSocketConnection = useCallback((delay = 0) => {
    if (!userRef.current?.userId) return;
    if (ws.current && (ws.current.readyState === WebSocket.OPEN || ws.current.readyState === WebSocket.CONNECTING)) return;

    setTimeout(() => {
      const socket = new WebSocket(websocketURL);
      ws.current = socket;
      setWsState(socket);

      socket.onopen = () => {
        reconnectAttempts.current = 0;
        const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
        if (token) {
          socket.send(JSON.stringify({ type: "AUTH", token }));
        }
      };

      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);

          // ----------------- Balance update -----------------
          if (message.type === "BALANCE_UPDATE" && message.data?.balance) {
            if (message.data.userId === userRef.current?.userId) {
              store.dispatch(setUserBalance(message.data.balance));
            }
          }

          // ----------------- Jackpot update -----------------
          if (message.type === "GAME" && message.action === "JACKPOT_UPDATE") {
            setJackpotAmount(message.amount ?? 0);
          }

          // ----------------- Chat messages -----------------
          if (message.type === "CHAT_MESSAGE" && message.data) {
            setChatMessages((prev) => [
              ...prev,
              {
                id: message.data.id,
                username: message.data.username,
                message: message.data.message,
                createdAt: message.data.createdAt,
              },
            ]);
          }

          // ----------------- Admin deposit notifications -----------------
          if (message.type === "ADMIN_DEPOSIT_NOTIFICATION") {
            if (userRef.current?.role === "ADMIN") {
              setAdminNotifications((prev) => prev + 1);
              // Invalidate deposits cache to trigger refetch
              store.dispatch(adminApi.util.invalidateTags(["deposits"]));
            }
          }

          // ----------------- User deposit status update -----------------
          if (message.type === "DEPOSIT_STATUS_UPDATE") {
            // Invalidate both admin and user deposit caches
            store.dispatch(adminApi.util.invalidateTags(["deposits"]));
            store.dispatch(userApi.util.invalidateTags(["DepositList"]));
          }
        } catch (error) {
          logger.error("❌ Failed to parse WebSocket message", error);
        }
      };

      socket.onclose = () => {
        ws.current = null;
        setWsState(null);

        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++;
          const nextDelay = reconnectDelay * reconnectAttempts.current;
          setTimeout(() => establishWebSocketConnection(nextDelay), nextDelay);
        } else {
          logger.warn("⚠️ Max reconnection attempts reached.");
        }
      };
    }, delay);
  }, []);

  // ----------------- Send chat message -----------------
  const sendChatMessage = useCallback((text: string) => {
    if (!userRef.current || ws.current?.readyState !== WebSocket.OPEN) return;

    ws.current.send(
      JSON.stringify({
        type: "CHAT_MESSAGE",
        data: {
          username: userRef.current.username,
          message: text,
        },
      }),
    );
  }, []);

  // ----------------- Initialize WebSocket -----------------
  useEffect(() => {
    if (userInfo?.userId) {
      establishWebSocketConnection(0);
    }

    return () => {
      // Graceful cleanup to handle React Strict Mode
      if (ws.current) {
        const currentState = ws.current.readyState;
        const socketToClose = ws.current;
        ws.current = null;
        setWsState(null);

        try {
          if (currentState === WebSocket.CONNECTING) {
            // Wait for connection to establish or fail naturally
            setTimeout(() => {
              if (socketToClose.readyState === WebSocket.OPEN) {
                socketToClose.close(1000, "Component unmounting");
              }
            }, 10);
          } else if (currentState === WebSocket.OPEN) {
            socketToClose.close(1000, "Component unmounting");
          }
        } catch (error) {
          logger.error("Error closing global WebSocket:", error);
        }
      }
    };
  }, [userInfo, establishWebSocketConnection]);

  return (
    <GlobalWebSocketContext.Provider
      value={{
        ws: wsState,
        jackpotAmount,
        userInfo,
        chatMessages,
        sendChatMessage,
        adminNotifications,
        resetAdminNotifications,
      }}
    >
      {children}
    </GlobalWebSocketContext.Provider>
  );
}
