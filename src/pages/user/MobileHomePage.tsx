import Mobilefooter from "../../components/Mobilefooter";

interface MobileHomePageProps {
  showLoginModal: () => void;
  navigateToCashier: () => void;
}

const MobileHomePage = ({ showLoginModal, navigateToCashier }: MobileHomePageProps) => {
  return (
    <div className="mobile-home-page">
      <Mobilefooter showLoginModal={showLoginModal} navigateToCashier={navigateToCashier} />
    </div>
  );
};

export default MobileHomePage;
