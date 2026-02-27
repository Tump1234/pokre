import React, { useEffect, useState, useMemo, Suspense } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useMeQuery } from "../api/user";
import { setAuthenticated, setUserInfo, setUserBalance } from "../providers/auth-slice";
import useLogout from "../hooks/useLogout";
import JackpotText from "./JackpotText";

import Avatar from "../assets/image/avatar/6820.png";
import { useIsMobile } from "../hooks/useIsMobile";
import Menu from "./Menu";

const UserFinanceModal = React.lazy(() => import("../components/UserFinanceModal"));
const AdminChat = React.lazy(() => import("../components/AdminChat"));
const BonusModal = React.lazy(() => import("./modals/BonusModal"));
const MyRegisterModal = React.lazy(() => import("./modals/MyRegisterModal"));
const SettingsModal = React.lazy(() => import("./modals/SettingsModal"));
const InfoModal = React.lazy(() => import("./modals/InfoModal"));

interface MainHeaderProps {
  showLoginModal?: (type: "login" | "register") => void;
  totalUsers?: number;
  totalTables?: number;
  isMenuOpen?: boolean;
  onToggleMenu?: () => void;
  closeMenu?: () => void;
  hideHeaderContent?: boolean;
}

const MainHeader: React.FC<MainHeaderProps> = ({
  showLoginModal,
  totalUsers,
  totalTables,
  isMenuOpen,
  onToggleMenu,
  closeMenu,
  hideHeaderContent = false,
}) => {
  const dispatch = useDispatch();
  const handleLogout = useLogout();

  const [activeModal, setActiveModal] = useState<"finance" | "bonus" | "myRegister" | "settings" | "info" | null>(null);
  const isModal = activeModal === "finance" || activeModal === "bonus" || activeModal === "myRegister" || activeModal === "settings";

  const [isAdminChatOpen, setIsAdminChatOpen] = useState(false);

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
  const token = localStorage.getItem("accessToken");
  const { data: userInfo, refetch } = useMeQuery(undefined, { skip: !token });
  const userBalance = useSelector((state: any) => state.auth.userBalance);
  const isAuthenticated = useSelector((state: any) => state.auth.isAuthenticated);
  const isMobile = useIsMobile();
  const username = useMemo(() => {
    const name = userInfo?.username ?? "";
    return name.charAt(0).toUpperCase() + name.slice(1);
  }, [userInfo]);

  const userRole = useMemo(() => {
    const role = userInfo?.role ?? "";
    return role ? role.charAt(0).toUpperCase() + role.slice(1).toLowerCase() : "";
  }, [userInfo]);

  const [isProfileExpanded, setIsProfileExpanded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement
        .requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch((err) => {
          console.error(`Error attempting to enable full-screen mode: ${err.message}`);
        });
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  };

  const isAdmin = userInfo?.role === "ADMIN";

  useEffect(() => {
    if (userInfo) {
      dispatch(setAuthenticated(true));
      dispatch(setUserInfo(userInfo));
      dispatch(setUserBalance(userInfo.userBalance?.balance ?? 0));
    }
  }, [userInfo, dispatch]);

  useEffect(() => {
    if (!token) {
      dispatch(setAuthenticated(false));
      dispatch(setUserInfo(null));
      dispatch(setUserBalance(0));
      setActiveModal(null);
    }
  }, [token, dispatch]);

  useEffect(() => {
    if (!isAuthenticated) setActiveModal(null);
  }, [isAuthenticated]);

  const openFinanceModal = () => {
    if (!isAuthenticated) return;
    closeMenu?.();
    refetch();
    setActiveModal("finance");
  };

  const openSettingsModal = () => {
    closeMenu?.();
    setActiveModal("settings");
  };
  const openInfoModal = () => {
    closeMenu?.();
    setActiveModal("info");
  };

  const openBonusModal = () => {
    if (!isAuthenticated) return;
    closeMenu?.();
    refetch();
    setActiveModal("bonus");
  };

  const closeModal = () => setActiveModal(null);

  return (
    <header className="main-header">
      {!hideHeaderContent && (
        <>
          <div className="header-top">
            <div className="header-top-left">
              <div className="left-side time">
                <div className="left-sideIcon"></div>
                <div className="left-sideText">{currentTime}</div>
              </div>

              <div className="left-side users">
                <div className="left-sideIcon"></div>
                <div className="left-sideText">{totalUsers?.toLocaleString("mn-MN") ?? 0}</div>
              </div>

              <div className="left-side tables">
                <div className="left-sideIcon"></div>
                <div className="left-sideText">{totalTables?.toLocaleString("mn-MN") ?? 0}</div>
              </div>
            </div>
          </div>
        </>
      )}

      <Menu
        isMenuOpen={isMenuOpen}
        closeMenu={closeMenu}
        openSettingsModal={openSettingsModal}
        isAuthenticated={isAuthenticated}
        isProfileExpanded={isProfileExpanded}
        setIsProfileExpanded={setIsProfileExpanded}
        openBonusModal={openBonusModal}
        openInfoModal={openInfoModal}
        handleLogout={handleLogout}
        isAdmin={isAdmin}
      />

      {!hideHeaderContent && (
        <div className="user-section-wrapper">
          <div className="user-header">
            {!isMobile && <div className="header-menu" onClick={onToggleMenu} />}
            <div className="header-menu-logo">
              <div className="logo-svg">
                <div className="icon-box" />
              </div>

              {isAuthenticated ? (
                <div className="user-header-inner">
                  <div className="profile-text-wrapper">
                    <span className="username-text">{username}</span>
                    <div className="user-role-wrapper">
                      <div className="user-role-status" />
                      <span className="user-role"> {userRole}</span>
                    </div>
                    <div className="user-star" />
                  </div>
                  <div className="user-picture">
                    <img src={Avatar} alt="User Avatar" className="user-avatar-image" loading="lazy" />
                  </div>
                </div>
              ) : (
                <div className="user-header-inner-login">
                  <div onClick={() => showLoginModal?.("login")} className="login-btn">
                    <div className="login-icon" />
                    <span>Нэвтрэх</span>
                  </div>
                </div>
              )}
              <div onClick={openFinanceModal} className="cashier-btn">
                <span>Касс</span>
                <div className="user-balance">{(userBalance ?? 0).toLocaleString("mn-MN")}</div>
              </div>

              <div className="jackpot-box">
                <div className="jackpot-text">
                  <span>MonteCarlo</span>
                  <span>Jackpot</span>
                </div>
                <JackpotText />
              </div>

              <div className="header-top-right">
                <div className="right-side settings" onClick={openSettingsModal}>
                  <div className="right-sideIcon"></div>
                </div>
                <div className="right-side fullscreen">
                  <div className={`right-sideIcon ${isFullscreen ? "is-fullscreen" : ""}`} onClick={toggleFullscreen} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isModal && (
        <div className="modal-overlay">
          <div className="finance-modal-container" onClick={(e) => e.stopPropagation()}>
            <Suspense
              fallback={
                <div className="modal-spinner-wrapper">
                  <div className="modal-spinner" />
                </div>
              }
            >
              {activeModal === "finance" && (
                <UserFinanceModal isModalVisible isAuthenticated={isAuthenticated} closeModal={closeModal} userBalance={userBalance} />
              )}

              {activeModal === "bonus" && (
                <BonusModal isModalVisible isAuthenticated={isAuthenticated} closeModal={closeModal} userInfo={userInfo} refetch={refetch} />
              )}

              {activeModal === "myRegister" && (
                <MyRegisterModal isModalVisible isAuthenticated={isAuthenticated} closeModal={closeModal} userInfo={userInfo} />
              )}

              {activeModal === "settings" && <SettingsModal isAuthenticated={isAuthenticated} isModalVisible closeModal={closeModal} />}
            </Suspense>
          </div>
        </div>
      )}
      <Suspense fallback={null}>{activeModal === "info" && <InfoModal isModalVisible closeModal={closeModal} />}</Suspense>

      {isAdminChatOpen && isAuthenticated && (
        <Suspense fallback={null}>
          <AdminChat onClose={() => setIsAdminChatOpen(false)} />
        </Suspense>
      )}
    </header>
  );
};

export default React.memo(MainHeader);
