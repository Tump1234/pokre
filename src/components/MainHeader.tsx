import React, { useEffect, useState, useMemo, Suspense } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useMeQuery } from "../api/user";
import { setAuthenticated, setUserInfo, setUserBalance } from "../providers/auth-slice";
import { useNavigate } from "react-router-dom";
import useLogout from "../hooks/useLogout";
import JackpotText from "./JackpotText";

import Avatar from "../assets/image/avatar/6820.png";
import { useIsMobile } from "../hooks/useIsMobile";

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
}

const MainHeader: React.FC<MainHeaderProps> = ({ showLoginModal, totalUsers, totalTables, isMenuOpen, onToggleMenu, closeMenu }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
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

      <div className={`mobile-menu-overlay ${isMenuOpen ? "active" : ""}`} onClick={closeMenu}>
        <div className="mobile-menu-content" onClick={(e) => e.stopPropagation()}>
          <div className="container">
            <div className="menu-close-container" onClick={closeMenu}>
              <div className="close-icon" />
              <div className="close-title">Буцах</div>
            </div>
            <div className="menu-options">
              <div className="options-box settings" onClick={openSettingsModal}>
                <div className="options-icon settings"></div>
                <div className="profile-text">Тохиргоо</div>
              </div>
              {isAuthenticated && (
                <>
                  <div className={`options-box profile ${isProfileExpanded ? "expanded" : ""}`} onClick={() => setIsProfileExpanded((prev) => !prev)}>
                    <div className="options-icon user"></div>
                    <div className="profile-text">Бүртгэл</div>
                    <div className="dropdown-arrow"></div>
                  </div>

                  {isProfileExpanded && (
                    <div className="options-submenu">
                      <div className="options-subitem">Дансны мэдээлэл</div>
                      <div className="options-subitem">Нууц үг солих</div>
                      <div className="options-subitem">Имэйлийг өөрчлөх</div>
                      <div className="options-subitem">Хаяг өөрчлөх</div>
                      <div className="options-subitem">Утасны дугаар солих</div>
                      <div className="options-subitem">Лавлах хөтөлбөр</div>
                    </div>
                  )}

                  <div className="options-box history">
                    <div className="options-icon history"></div>
                    <div className="profile-text">Тоглолтын түүх</div>
                  </div>
                  <div className="options-box tournaments">
                    <div className="options-icon tournaments"></div>
                    <div className="profile-text">Миний тэмцээнүүд</div>
                  </div>
                  <div className="options-box tables">
                    <div className="options-icon tables"></div>
                    <div className="profile-text">Миний ширээнүүд</div>
                  </div>

                  <div className="options-box bonus" onClick={openBonusModal}>
                    <div className="options-icon bonus"></div>
                    <div className="profile-text">Бонус</div>
                  </div>
                </>
              )}

              {isAdmin && (
                <div
                  className="options-box admin"
                  onClick={() => {
                    navigate("/admin");
                  }}
                >
                  <div className="options-icon admin"></div>
                  <div className="profile-text">Админ Панел</div>
                </div>
              )}
              <div className="options-box info" onClick={openInfoModal}>
                <div className="options-icon info"></div>
                <div className="profile-text">Тухай</div>
              </div>
              {isAuthenticated && (
                <>
                  <div className="options-box telegram" onClick={handleLogout}>
                    <div className="options-icon telegram"></div>
                    <div className="profile-text">Телеграммаар холбогдох</div>
                  </div>
                  <div className="options-box facebook" onClick={handleLogout}>
                    <div className="options-icon facebook"></div>
                    <div className="profile-text">Фэйсбүүкээр холбогдох</div>
                  </div>
                  <div className="options-box logout" onClick={handleLogout}>
                    <div className="options-icon logout"></div>
                    <div className="profile-text">Системээс гарах</div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
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
