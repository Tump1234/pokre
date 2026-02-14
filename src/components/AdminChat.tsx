import { logger } from "../utils/logger";
import { useContext, useState, useRef } from "react";
import { GlobalWebSocketContext } from "../providers/GlobalWebSocketProvider";

interface AdminChatProps {
  onClose?: () => void;
}

export default function AdminChat({ onClose }: AdminChatProps) {
  const { chatMessages, sendChatMessage, userInfo } = useContext(GlobalWebSocketContext);
  const [text, setText] = useState("");
  const isAdmin = userInfo?.role === "ADMIN";
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const handleSendMessage = () => {
    if (!text.trim()) return;
    logger.log("Sending chat message:", text);
    sendChatMessage?.(text.trim());
    setText("");
  };

  return (
    <div className="admin-chat">
      <div className="utf-header admin-chat">
        <div className="utf-header-icon logo"></div>
        <div className="utf-header-name">Админ чат</div>
        <div className="utf-header-icon close" onClick={onClose}></div>
      </div>

      <div className="admin-chat-messages">
        {chatMessages.length === 0 && <div className="admin-chat-empty">No messages yet</div>}

        {chatMessages.map((msg, index) => {
          return (
            <div key={`${msg.id}-${index}`} className="admin-chat-message">
              <img
                src={userInfo?.avatar || "/default-avatar.png"} // get avatar from current userInfo
                alt={userInfo?.username}
                className="admin-chat-avatar"
              />

              <div className="admin-chat-user">
                <div className="admin-chat-user-info">
                  <div className="admin-chat-username">{msg.username}</div>
                  <div className="admin-chat-time">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })}
                  </div>
                </div>
                <div className="admin-chat-text">{msg.message}</div>
              </div>
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {isAdmin && (
        <div className="admin-chat-input">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type message..."
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSendMessage();
              }
            }}
          />
          <button onClick={handleSendMessage}>Send</button>
        </div>
      )}
    </div>
  );
}
