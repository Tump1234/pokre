import { useState, useEffect } from "react";
import AdminChat from "./AdminChat";

interface MainFooterProps {
  totalUsers?: number;
  totalTables?: number;
}

export default function MainFooter({ totalUsers, totalTables }: MainFooterProps) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [networkQuality, setNetworkQuality] = useState("good");

  const handleChatClick = () => {
    setIsChatOpen((prev) => !prev);
  };

  useEffect(() => {
    const qualities = ["good", "middle", "bad"];
    let i = 0;

    const interval = setInterval(() => {
      setNetworkQuality(qualities[i % qualities.length]);
      i++;
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const [currentTime, setCurrentTime] = useState(() =>
    new Date().toLocaleTimeString("mn-MN", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  );
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(
        new Date().toLocaleTimeString("mn-MN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className="footer-bottom">
        <div className="footer-container">
          <div className="network-quality">
            <div className={`quality-icon ${networkQuality}`} />
            <div className="left-side time">
              <div className="left-sideIcon"></div>
              <div className="left-sideText">{currentTime}</div>
            </div>
            <div className="left-side users">
              <div className="left-sideIcon" />
              <div className="left-sideText">{totalUsers?.toLocaleString("mn-MN") ?? 0}</div>
            </div>

            <div className="left-side tables">
              <div className="left-sideIcon"></div>
              <div className="left-sideText">{totalTables?.toLocaleString("mn-MN") ?? 0}</div>
            </div>
          </div>
        </div>
        <div className="android-icon">
          {/* <div className="icon-svg" /> */}
          <p className="copyright">v 25.12.1.h3962036-s93170b9-b44ba7c3</p>
        </div>
        <div className="footer-left">
          <div className="footer-item language-select">
            <div className="icon language-icon" />
            <span>Монгол</span>
          </div>

          <div className="footer-item active-tables">
            <div className="icon tables-icon"></div>
            <span>0</span>
          </div>

          <div className="footer-item lobby-chat" onClick={handleChatClick}>
            <div className="icon chat-icon"></div>
            <span>0</span>
          </div>
        </div>
        <div className={`admin-chat-overlay ${isChatOpen ? "show" : ""}`} onClick={() => setIsChatOpen(false)}>
          <div className="admin-chat-wrapper" onClick={(e) => e.stopPropagation()}>
            <AdminChat onClose={() => setIsChatOpen(false)} />
          </div>
        </div>
      </div>
    </>
  );
}
