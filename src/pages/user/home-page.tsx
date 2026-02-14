import { useState, Suspense, lazy, useCallback, memo, useEffect } from "react";
import { useSelector } from "react-redux";
import { useIsMobile } from "../../hooks/useIsMobile";
import { useFetchTablesQuery } from "../../api/user";
import gif2 from "../../assets/image/gifs/telegram-join.gif";
import tablesIcon from "../../assets/image/icons/cash-game-tab-icon-blue.svg";
import tournamentIcon from "../../assets/image/icons/tournaments-game-tab-icon-blue.svg";
import sitgoIcon from "../../assets/image/icons/sit-and-go-game-tab-icon-blue.svg";
import { type TableCategory } from "../../types/gameTypes";
import MainHeader from "../../components/MainHeader";
import MobileCategory from "../../components/MobileCategory";
import AdminChat from "../../components/AdminChat";

const TableList = lazy(() => import("../../features/poker/table-list"));
const TablePreview = lazy(() => import("../../features/poker/table-preview"));
const MainFooter = lazy(() => import("../../components/MainFooter"));
const RegisterForm = lazy(() => import("../../features/user/register-form"));
const LoginForm = lazy(() => import("../../features/user/login-form"));
const MobileHomePage = lazy(() => import("./MobileHomePage"));
const UserFinanceModal = lazy(() => import("../../components/UserFinanceModal"));

const HomePage = memo(function HomePage() {
  const [modalType, setModalType] = useState<string>("");
  const [selectedTableSecureId, setSelectedTableSecureId] = useState<string | null>(null);
  const [hasSetDefaultTable, setHasSetDefaultTable] = useState(false);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [category, setCategory] = useState<TableCategory>("Home");
  const handleNavigateToCashier = () => setCategory("Cashier");

  const isAuthenticated = useSelector((state: any) => state.auth.isAuthenticated);
  const isMobile = useIsMobile();
  const { data: tableData, refetch } = useFetchTablesQuery(undefined, { skip: false });
  const [gifSrc, setGifSrc] = useState(gif2);
  const selectedTable = tableData?.find((t) => t.secureId === selectedTableSecureId) || null;
  const totalTables = tableData?.length ?? 0;
  const totalUsers = tableData?.reduce((acc, table) => acc + (table.activePlayers ?? 0), 0) ?? 0;

  const handleTablesLoaded = useCallback(() => {
    if (!isMobile && !hasSetDefaultTable && tableData && tableData.length > 0) {
      setSelectedTableSecureId(tableData[0].secureId);
      setHasSetDefaultTable(true);
    }
  }, [isMobile, hasSetDefaultTable, tableData]);

  const handleTableClick = useCallback((table: any) => {
    setSelectedTableSecureId(table.secureId);
  }, []);

  const handleLoginModal = useCallback(() => setModalType("login"), []);
  const handleClosePreview = useCallback(() => setSelectedTableSecureId(null), []);
  const toggleMenu = () => setIsCategoryMenuOpen((prev) => !prev);
  const closeMenu = () => setIsCategoryMenuOpen(false);

  useEffect(() => {
    const timer = setInterval(() => setGifSrc(`${gif2}?t=${Date.now()}`), 7000);
    return () => clearInterval(timer);
  }, []);

  const renderMobileContent = () => {
    switch (category) {
      case "Home":
        return <MobileHomePage showLoginModal={handleLoginModal} navigateToCashier={handleNavigateToCashier} />;
      case "Cashier":
        return <UserFinanceModal isModalVisible={true} isAuthenticated={isAuthenticated} />;
      case "Games":
        return <AdminChat />;
      case "Ширээнүүд":
      case "Тэмцээнүүд":
      case "Sit & Go":
      default:
        return (
          <TableList
            isAuthenticated={isAuthenticated}
            showLoginModal={handleLoginModal}
            onTableClick={handleTableClick}
            onTablesLoaded={handleTablesLoaded}
            mobileView={isMobile}
            refetch={refetch}
          />
        );
    }
  };

  return (
    <div className="home-page-layout">
      {!(isMobile && category !== "Home") && (
        <MainHeader
          showLoginModal={setModalType}
          totalUsers={totalUsers}
          isMenuOpen={isCategoryMenuOpen}
          totalTables={totalTables}
          onToggleMenu={toggleMenu}
          closeMenu={closeMenu}
        />
      )}

      <div className="home-page-container">
        <div className="homepage-grid-layout">
          <div className="main-content">
            <div className="table-categories">
              {[
                { key: "Ширээнүүд", label: "Ширээнүүд", icon: tablesIcon },
                { key: "Тэмцээнүүд", label: "Тэмцээнүүд", icon: tournamentIcon },
                { key: "Sit & Go", label: "Sit & Go", icon: sitgoIcon },
              ].map((c) => (
                <button key={c.key} className={`category-btn ${category === c.key ? "active" : ""}`} onClick={() => setCategory(c.key as any)}>
                  <img src={c.icon} alt="" className="category-icon" />
                  <span>{c.label}</span>
                </button>
              ))}
            </div>

            <Suspense fallback={null}>
              {isMobile ? (
                renderMobileContent()
              ) : (
                <TableList
                  isAuthenticated={isAuthenticated}
                  showLoginModal={handleLoginModal}
                  onTableClick={handleTableClick}
                  onTablesLoaded={handleTablesLoaded}
                  mobileView={isMobile}
                  refetch={refetch}
                />
              )}
            </Suspense>
          </div>

          {selectedTable && !isMobile && (
            <div className="right-column">
              <div className="contact-admin">
                <a href="https://t.me/+7TOEB475f9EzM2Fl" target="_blank" rel="noopener noreferrer">
                  <img src={gifSrc} alt="admin-gif-1" className="slide-gif" />
                </a>
              </div>
              <div className="hero-table-preview-container">
                <Suspense fallback={null}>
                  <TablePreview
                    table={selectedTable}
                    onClose={handleClosePreview}
                    isAuthenticated={isAuthenticated}
                    onRequireLogin={handleLoginModal}
                  />
                </Suspense>
              </div>
            </div>
          )}
        </div>

        {isMobile ? (
          <MobileCategory category={category} onChange={setCategory} isMenuOpen={isCategoryMenuOpen} onToggleMenu={toggleMenu} />
        ) : (
          <MainFooter />
        )}
      </div>

      {modalType && (
        <div className="auth-modal-overlay" onClick={() => setModalType("")}>
          <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
            <Suspense fallback={null}>
              {modalType === "login" && <LoginForm setModalType={setModalType} />}
              {modalType === "register" && <RegisterForm setModalType={setModalType} />}
            </Suspense>
          </div>
        </div>
      )}
    </div>
  );
});

export default HomePage;
