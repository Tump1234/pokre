import { useEffect, useRef, useReducer, useCallback, useState } from "react";
import { websocketURL, type WebsocketEvent } from "../api/game";
import type { GameCard } from "../api/game";
import type { GameState, Chat } from "../types/gameTypes";
import { useFetchTableByIdQuery } from "../api/user";
import { gameReducer } from "../reducers/gameReducer";
import { logger } from "../utils/logger";

export function useTexasTable(initialTableId = "") {
  const initialGameState: GameState = {
    minBuyIn: 0,
    maxBuyIn: 0,
    smallBlind: 0,
    bigBlind: 0,
    maxPlayers: 8,
    dealerSeatIndex: 0,
    smallBlindSeatIndex: 0,
    bigBlindSeatIndex: 0,
    usableBalance: 0,
    isAuthenticated: false,
    turnPlayer: null,
    isFolded: false,
    isAllIn: false,
    isAuto: false,
    currentBets: {},
    currentPot: 0,
    seats: [],
    pots: [],
    currentPlayerSeat: 0,
    communityCards: [],
    state: "WAITING_FOR_PLAYERS",
    lastActions: {},
    callAmounts: {},
    revealedHoleCards: {},
  };

  const [gameState, dispatch] = useReducer(gameReducer, initialGameState);
  const [chats, setChats] = useState<Chat[]>([]);
  const chatRef = useRef<Chat[]>([]);
  const ws = useRef<WebSocket | null>(null);
  const messageBuffer = useRef<WebsocketEvent[]>([]);
  const flushTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const messageQueue = useRef<{ type: string; data: any }[]>([]);
  const [socketReady, setSocketReady] = useState(false);
  const [tableId, setTableId] = useState(initialTableId);
  const [destinedCommunityCards, setDestinedCommunityCards] = useState<GameCard[]>([]);
  const pushChatTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isConnecting = useRef(false);
  const shouldReconnect = useRef(true);

  const reconnectAttempts = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 10;
  const BASE_RECONNECT_DELAY = 1000;

  const reconnectTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeTableIdRef = useRef<string>("");
  const authenticateTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const tableNumericId = parseInt(initialTableId || "0");
  const { data: preloadTable } = useFetchTableByIdQuery(tableNumericId, {
    skip: !tableNumericId,
  });

  useEffect(() => {
    activeTableIdRef.current = tableId;
  }, [tableId]);

  useEffect(() => {
    if (preloadTable) {
      const seats = preloadTable.seats ?? {};
      const maxPlayers = preloadTable.maxPlayers ?? 8;
      dispatch({
        type: "UPDATE_TABLE",
        table: {
          ...preloadTable,
          seats,
          maxPlayers,
          isFolded: false,
          minBuyIn: preloadTable.minBuyIn ?? 0,
          maxBuyIn: preloadTable.maxBuyIn ?? 0,
          smallBlind: preloadTable.smallBlind ?? 0,
          bigBlind: preloadTable.bigBlind ?? 0,
        },
        session: { communityCards: [], currentBets: {}, currentPot: 0 },
      });
    }
  }, [preloadTable]);

  const pushChat = useCallback(
    (data: any) => {
      const newMessage: Chat = {
        id: Math.random(),
        username: data?.username || "Unknown",
        message: data?.content || "",
      };
      chatRef.current.push(newMessage);

      if (!pushChatTimeout.current) {
        pushChatTimeout.current = setTimeout(() => {
          setChats([...chatRef.current]);
          pushChatTimeout.current = null;
        }, 100);
      }

      if (data?.action === "SUBSCRIBE")
        sendMessage("TABLE", {
          tableId: parseInt(tableId || "0"),
          action: "SUBSCRIBE",
        });
    },
    [tableId],
  );

  const sendMessage = useCallback((type: string, data: any) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      try {
        ws.current.send(JSON.stringify({ type, data }));
        logger.log(`[WS] Sent message: ${type}`, data);
      } catch (error) {
        logger.error("[WS] Failed to send message:", error);
        messageQueue.current.push({ type, data });
      }
    } else {
      logger.log(`[WS] Queueing message: ${type} (socket not ready)`);
      messageQueue.current.push({ type, data });
    }
  }, []);

  const authenticateSocket = useCallback(() => {
    if (authenticateTimeout.current) {
      clearTimeout(authenticateTimeout.current);
      authenticateTimeout.current = null;
    }

    const token = localStorage.getItem("accessToken");

    if (!token) {
      return;
    }

    if (ws.current?.readyState === WebSocket.OPEN) {
      try {
        ws.current.send(JSON.stringify({ type: "AUTH", data: { accessToken: token } }));
        logger.log("[WS] Authentication sent");
      } catch (error) {
        logger.error("[WS] Failed to send auth:", error);
      }
    } else if (ws.current?.readyState === WebSocket.CONNECTING) {
      authenticateTimeout.current = setTimeout(authenticateSocket, 100);
    }
  }, []);

  const handleMessage = useCallback(
    (msg: WebsocketEvent) => {
      try {
        switch (msg.type) {
          case "AUTH":
            logger.log("[WS] Authenticated successfully");
            dispatch({
              type: "AUTH",
              data: {
                balance: msg.data?.balance ?? 0,
                user: msg.data?.user,
                isAuthenticated: true,
              },
            });

            reconnectAttempts.current = 0;

            if (tableId) {
              sendMessage("TABLE", {
                tableId: parseInt(tableId),
                action: "SUBSCRIBE",
              });
            }
            break;

          case "TABLE":
            dispatch({
              type: "UPDATE_TABLE",
              table: msg.data?.table,
              session: msg.data?.session,
            });

            if (msg.data?.session?.destinedCommunityCards) {
              setDestinedCommunityCards(
                msg.data.session.destinedCommunityCards.map((card: GameCard) => ({
                  suit: card.suit,
                  rank: card.rank,
                  secret: false,
                })),
              );
            }
            break;

          case "CHAT":
            pushChat(msg.data);
            break;

          case "GAME":
            switch (msg.data?.action) {
              case "PLAYER_ACTION_WITH_STATE":
                dispatch({
                  type: "PLAYER_ACTION",
                  data: {
                    ...msg.data.playerAction,
                    currentPot: msg.data.tableUpdate.session?.currentPot,
                    currentBets: msg.data.tableUpdate.session?.currentBets,
                  },
                });
                break;
              case "PLAYER_ACTION":
                dispatch({ type: "PLAYER_ACTION", data: msg.data });
                break;
              case "TURN_UPDATE":
                dispatch({ type: "TURN_UPDATE", data: msg.data });
                break;
              case "COMBINED_SPLIT_POT":
                dispatch({ type: "COMBINED_SPLIT_POT", data: msg.data });
                break;
              case "HOLE_CARDS":
                dispatch({ type: "HOLE_CARDS_UPDATE", payload: msg.data });
                break;
              default:
                dispatch({ type: "GAME_STATE_UPDATE", payload: msg.data });
            }
            break;

          case "ERROR":
            const token = localStorage.getItem("accessToken");
            if (token) {
              logger.error("[WS] Server error:", msg.data?.error);
            }
            break;
        }
      } catch (error) {
        logger.error("[WS] Error handling message:", error, msg);
      }
    },
    [pushChat, sendMessage, tableId],
  );

  const establishWebSocketConnection = useCallback(() => {
    if (isConnecting.current) {
      logger.log("[WS] Connection already in progress");
      return;
    }
    if (ws.current?.readyState === WebSocket.OPEN) {
      logger.log("[WS] Already connected");
      return;
    }
    if (ws.current?.readyState === WebSocket.CONNECTING) {
      logger.log("[WS] Connection in progress");
      return;
    }

    if (reconnectAttempts.current >= MAX_RECONNECT_ATTEMPTS) {
      logger.error("[WS] Max reconnection attempts reached");
      return;
    }

    if (!shouldReconnect.current) {
      logger.log("[WS] Reconnection disabled");
      return;
    }

    try {
      isConnecting.current = true;
      logger.log(`[WS] Attempting to connect (attempt ${reconnectAttempts.current + 1}/${MAX_RECONNECT_ATTEMPTS})`);

      if (ws.current) {
        const currentState = ws.current.readyState;
        if (currentState === WebSocket.OPEN || currentState === WebSocket.CLOSING) {
          try {
            ws.current.close();
          } catch (e) {
            logger.warn("[WS] Error closing existing connection:", e);
          }
        }
        ws.current = null;
      }

      ws.current = new WebSocket(websocketURL);

      ws.current.onopen = () => {
        logger.log("[WS] Connection established");
        isConnecting.current = false;
        setSocketReady(true);
        reconnectAttempts.current = 0;

        authenticateSocket();

        // Send queued messages
        if (messageQueue.current.length > 0) {
          logger.log(`[WS] Sending ${messageQueue.current.length} queued messages`);
          messageQueue.current.forEach((msg) => {
            try {
              ws.current?.send(JSON.stringify(msg));
            } catch (error) {
              logger.error("[WS] Failed to send queued message:", error);
            }
          });
          messageQueue.current = [];
        }
      };

      ws.current.onmessage = (e) => {
        try {
          const msg: WebsocketEvent = JSON.parse(e.data);
          messageBuffer.current.push(msg);

          if (flushTimeout.current) return;

          flushTimeout.current = setTimeout(() => {
            flushTimeout.current = null;
            const messages = messageBuffer.current;
            messageBuffer.current = [];
            if ("requestIdleCallback" in window && messages.length > 5) {
              requestIdleCallback(
                () => {
                  messages.forEach(handleMessage);
                },
                { timeout: 100 },
              );
            } else {
              messages.forEach(handleMessage);
            }
          }, 50);
        } catch (error) {
          logger.error("[WS] Error parsing message:", error);
        }
      };

      ws.current.onerror = (error) => {
        logger.error("[WS] WebSocket error:", error);
        isConnecting.current = false;
      };

      ws.current.onclose = (event) => {
        logger.log(`[WS] Connection closed (code: ${event.code}, reason: ${event.reason})`);
        isConnecting.current = false;
        setSocketReady(false);

        if (!shouldReconnect.current) {
          logger.log("[WS] Not reconnecting (intentional close)");
          return;
        }

        if (reconnectAttempts.current >= MAX_RECONNECT_ATTEMPTS) {
          logger.error("[WS] Max reconnection attempts reached");
          return;
        }

        const delay = Math.min(BASE_RECONNECT_DELAY * Math.pow(2, reconnectAttempts.current), 30000);

        reconnectAttempts.current++;

        if (reconnectTimeout.current) {
          clearTimeout(reconnectTimeout.current);
        }

        logger.log(`[WS] Reconnecting in ${delay}ms (attempt ${reconnectAttempts.current})`);

        reconnectTimeout.current = setTimeout(() => {
          reconnectTimeout.current = null;
          establishWebSocketConnection();
        }, delay);
      };
    } catch (error) {
      logger.error("[WS] Failed to establish connection:", error);
      isConnecting.current = false;
    }
  }, [authenticateSocket, handleMessage]);

  useEffect(() => {
    if (tableId) {
      shouldReconnect.current = true;
      establishWebSocketConnection();
    }

    return () => {
      logger.log("[WS] Cleaning up WebSocket connection");
      shouldReconnect.current = false;
      isConnecting.current = false;
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
        reconnectTimeout.current = null;
      }
      if (flushTimeout.current) {
        clearTimeout(flushTimeout.current);
        flushTimeout.current = null;
      }
      if (pushChatTimeout.current) {
        clearTimeout(pushChatTimeout.current);
        pushChatTimeout.current = null;
      }
      if (authenticateTimeout.current) {
        clearTimeout(authenticateTimeout.current);
        authenticateTimeout.current = null;
      }

      if (ws.current) {
        const currentState = ws.current.readyState;
        const socketToClose = ws.current;
        ws.current.onopen = null;
        ws.current.onclose = null;
        ws.current.onerror = null;
        ws.current.onmessage = null;
        ws.current = null;

        try {
          if (currentState === WebSocket.CONNECTING) {
            setTimeout(() => {
              if (socketToClose.readyState === WebSocket.OPEN) {
                socketToClose.close(1000, "Component unmounting");
              }
            }, 10);
          } else if (currentState === WebSocket.OPEN) {
            socketToClose.close(1000, "Component unmounting");
          }
        } catch (error) {
          logger.warn("[WS] Error closing WebSocket on cleanup:", error);
        }
      }
    };
  }, [tableId, establishWebSocketConnection]);

  const takeSeat = useCallback(
    (seatIndex: number, amount: number, isBot = false, botName?: string) =>
      sendMessage("TABLE", {
        tableId: parseInt(tableId || "0"),
        action: "TAKE_SEAT",
        seatIndex,
        amount,
        isBot,
        botName,
      }),
    [sendMessage, tableId],
  );

  const recharge = useCallback(
    (amount: number) =>
      sendMessage("TABLE", {
        tableId: parseInt(tableId || "0"),
        action: "RECHARGE",
        amount,
      }),
    [sendMessage, tableId],
  );

  const leaveSeat = useCallback(
    (seatIndex: number) =>
      sendMessage("TABLE", {
        tableId: parseInt(tableId || "0"),
        action: "LEAVE_SEAT",
        seatIndex,
      }),
    [sendMessage, tableId],
  );

  const sendGameAction = useCallback(
    (action: string, amount?: number) => {
      const actionId = Math.random().toString(36).substring(2, 12);

      dispatch({
        type: "PLAYER_ACTION",
        data: {
          actionType: action,
          seatId: gameState.currentPlayerSeat,
          amount: amount || 0,
          actionId,
          optimistic: true,
        },
      });

      sendMessage("GAME", {
        tableId: parseInt(tableId || "0"),
        action,
        amount,
        actionId,
      });
    },
    [sendMessage, tableId, gameState.currentPlayerSeat],
  );

  const sendChat = useCallback((msg: string) => sendMessage("CHAT", { tableId: parseInt(tableId || "0"), message: msg }), [sendMessage, tableId]);

  const rejoinTable = useCallback(
    () =>
      sendMessage("TABLE", {
        tableId: parseInt(tableId || "0"),
        action: "RECONNECT",
      }),
    [sendMessage, tableId],
  );

  const isReady = gameState.isAuthenticated;

  return {
    gameState,
    chats,
    ws,
    socketReady,
    tableId,
    setTableId,
    destinedCommunityCards,
    takeSeat,
    leaveSeat,
    sendGameAction,
    sendChat,
    rejoinTable,
    recharge,
    isReady,
  };
}
