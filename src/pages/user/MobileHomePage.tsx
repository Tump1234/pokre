import MobileMiddleSwiper from "../../components/MobileMiddleSwiper";
import Mobilefooter from "../../components/Mobilefooter";

interface MobileHomePageProps {
  showLoginModal: () => void;
  navigateToCashier: () => void;
  showTables: () => void;
  showTournaments: () => void;
  showGames: () => void;
}

const MobileHomePage = ({
  showLoginModal,
  navigateToCashier,
  showTables,
  showTournaments,
  showGames,
}: MobileHomePageProps) => {
  return (
    <div className="mobile-home-page">
      <Mobilefooter showLoginModal={showLoginModal} navigateToCashier={navigateToCashier} />
      <div className="mobile-home-swiper-bottom">
        <MobileMiddleSwiper onShowTables={showTables} onShowTournaments={showTournaments} onShowGames={showGames} />
      </div>
    </div>
  );
};

export default MobileHomePage;
