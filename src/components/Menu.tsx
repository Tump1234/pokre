import { useNavigate } from "react-router";

interface MenuProps {
  isMenuOpen?: boolean;
  closeMenu?: () => void;
  openSettingsModal: () => void;
  isAuthenticated?: boolean;
  isProfileExpanded?: boolean;
  setIsProfileExpanded: React.Dispatch<React.SetStateAction<boolean>>;
  openBonusModal: () => void;
  openInfoModal: () => void;
  handleLogout: () => void;
  isAdmin?: boolean;
}

function Menu({
  isMenuOpen,
  closeMenu,
  openSettingsModal,
  isAuthenticated,
  isProfileExpanded,
  setIsProfileExpanded,
  openBonusModal,
  openInfoModal,
  handleLogout,
  isAdmin,
}: MenuProps) {
  const navigate = useNavigate();
  return (
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
  );
}

export default Menu;
