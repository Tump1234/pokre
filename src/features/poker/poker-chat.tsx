import { useState, useEffect, useRef } from "react";
import type { GameCard, GamePlayer } from "../../api/game";
import PokerCard from "./poker-card";
import { IoSend } from "react-icons/io5";

interface Chat {
  id: number;
  username: string;
  message: string;
}

function PokerChat({
  messages = [],
  sendChat,
  destinedCommunityCards = [],

  player,
}: {
  messages?: Chat[];
  sendChat?: (message: string) => void;
  destinedCommunityCards?: GameCard[];
  subscribe?: () => void;
  player: GamePlayer | undefined;
}) {
  const [inputValue, setInputValue] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"chat" | "admin">("chat");
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleSendMessage = () => {
    if (inputValue.trim() === "") return;
    sendChat?.(inputValue);
    setInputValue("");
  };

  const isAdmin = player?.user?.role === "ADMIN";

  useEffect(() => {
    if (!isChatOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (chatBoxRef.current && !chatBoxRef.current.contains(event.target as Node)) {
        setIsChatOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isChatOpen]);

  return (
    <div className={`chat-box-toggle ${isChatOpen ? "open" : ""}`}>
      <div className="toggle-chat-btn" onClick={() => setIsChatOpen((prev) => !prev)} title="Chat" />

      <div ref={chatBoxRef} className="chat-box">
        <div className="tab-header">
          <button className={`tab-button ${activeTab === "chat" ? "active" : ""}`} onClick={() => setActiveTab("chat")}>
            Чат
          </button>
          {isAdmin && (
            <button className={`tab-button ${activeTab === "admin" ? "active" : ""}`} onClick={() => setActiveTab("admin")}>
              Админ
            </button>
          )}
        </div>

        <div className="tab-content">
          {activeTab === "chat" && (
            <div className="chat-messages">
              {messages.map((chat) => (
                <p key={chat.id} className="chat-message">
                  <span>{chat.username}:</span> {chat.message}
                </p>
              ))}
            </div>
          )}
          {activeTab === "admin" && isAdmin && (
            <div className="admin-cards">
              {destinedCommunityCards?.map((card, index) => (
                <div key={index} className="admin-card">
                  <PokerCard info={card} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="chat-input-row">
          <div className="chat-input-wrapper">
            <input
              className="chat-input"
              placeholder="Таны сэтгэгдэл..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <button className="send-button" onClick={handleSendMessage}>
              <IoSend size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PokerChat;
export type { Chat };
