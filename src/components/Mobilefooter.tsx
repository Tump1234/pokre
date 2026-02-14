import { useState, useEffect } from "react";
import { useFetchTablesQuery } from "../api/user";
import gif2 from "../assets/image/gifs/telegram-join.gif";
import { useSelector } from "react-redux";

interface MobilefooterProps {
  showLoginModal: () => void;
  navigateToCashier: () => void;
}

function Mobilefooter({ showLoginModal, navigateToCashier }: MobilefooterProps) {
  const { data: tableData } = useFetchTablesQuery(undefined, { skip: false });

  const [networkQuality, setNetworkQuality] = useState("good");
  const totalTables = tableData?.length ?? 0;
  const totalUsers = tableData?.reduce((acc, table) => acc + (table.activePlayers ?? 0), 0) ?? 0;
  const [gifSrc, setGifSrc] = useState(gif2);
  const isAuthenticated = useSelector((state: any) => state.auth.isAuthenticated);
  const rawBalance = useSelector((state: any) => state.auth.userBalance ?? 0);
  const userBalance = Number(rawBalance).toFixed(2);

  useEffect(() => {
    const qualities = ["good", "middle", "bad"];
    let i = 0;

    const interval = setInterval(() => {
      setNetworkQuality(qualities[i % qualities.length]);
      i++;
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setGifSrc(`${gif2}?t=${Date.now()}`), 7000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <div className="footer-bottom">
        <div className="footer-container">
          <div className="network-quality">
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

        <div className="footer-left" style={{ marginRight: "0.5em", gap: "0.5em" }}>
          <div className="footer-item language-select">
            <div className="icon language-icon" />
            <span>Монгол</span>
          </div>
          <div className={`quality-icon ${networkQuality}`} />
        </div>
      </div>
      {!isAuthenticated ? (
        <div className="mobile-auth-btn" onClick={showLoginModal}>
          Нэвтрэх
        </div>
      ) : (
        <div className="mobile-userInfo">
          <div className="blance-btn" onClick={navigateToCashier}>
            Касс
          </div>
          <div className="balnce-currency">MNT</div>
          <div className="mb-user-balance"> {userBalance}</div>
        </div>
      )}

      <div className="contact-admin">
        <a href="https://t.me/+7TOEB475f9EzM2Fl" target="_blank" rel="noopener noreferrer">
          <img src={gifSrc} alt="admin-gif-1" className="slide-gif" />
        </a>
      </div>
    </>
  );
}

export default Mobilefooter;
