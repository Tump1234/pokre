import { type User } from "../../api/user";

interface MyRegisterInterface {
  isModalVisible: boolean;
  isAuthenticated: boolean;
  closeModal: () => void;
  userInfo?: User | undefined;
}

function MyRegisterModal({ closeModal, userInfo }: MyRegisterInterface) {
  console.log(userInfo);
  return (
    <div className="ufm-bottom-sheet">
      <div className="utf-header">
        <div className="utf-header-icon logo"></div>
        <div className="utf-header-name">Миний бүртгэл</div>
        <div className="utf-header-icon close" onClick={closeModal}></div>
      </div>
      <div className="profile-box">
        <div className="profile-item avatar">
          <span className="key"></span>
          <span className="value"></span>
        </div>
        <div className="profile-item username"></div>
        <div className="profile-item email"></div>
        <div className="profile-item accountNumber"></div>
        <div className="profile-item userId"></div>
      </div>
    </div>
  );
}

export default MyRegisterModal;
