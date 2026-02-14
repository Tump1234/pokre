import { useState } from "react";
import DesktopSettings from "./tabItems/DesktopSettings";
import WallpaperSettings from "./tabItems/WallpaperSettings";
import SoundSettings from "./tabItems/SoundSettings";
import ChatSettings from "./tabItems/ChatSettings";
import SystemSettings from "./tabItems/SystemSettings";

interface SettingsInterface {
  isModalVisible: boolean;
  closeModal: () => void;
  isAuthenticated: boolean;
}

function SettingsModal({ closeModal, isAuthenticated }: SettingsInterface) {
  const [activeTab, setActiveTab] = useState<
    | "Ширээний тохиргоо"
    | "Ханшийн хэлбэлзэл"
    | "Бай-ин & Дахин орох"
    | "Ширээний дэвсгэр"
    | "Дууны тохиргоо"
    | "Чатын тохиргоо"
    | "Системийн тохиргоо"
  >("Ширээний тохиргоо");

  return (
    <div className="ufm-bottom-sheet">
      <div className="utf-header">
        <div className="utf-header-icon logo"></div>
        <div className="utf-header-name">Тохиргоо</div>
        <div className="utf-header-icon close" onClick={closeModal}></div>
      </div>
      <div className="bottom-wrapper">
        <div className="ufm-tabs">
          <div className={`ufm-tab ${activeTab === "Ширээний тохиргоо" ? "active" : ""}`} onClick={() => setActiveTab("Ширээний тохиргоо")}>
            Ширээний тохиргоо
          </div>

          {isAuthenticated && (
            <div className={`ufm-tab ${activeTab === "Ханшийн хэлбэлзэл" ? "active" : ""}`} onClick={() => setActiveTab("Ханшийн хэлбэлзэл")}>
              Ханшийн хэлбэлзэл
            </div>
          )}
          {isAuthenticated && (
            <div className={`ufm-tab ${activeTab === "Бай-ин & Дахин орох" ? "active" : ""}`} onClick={() => setActiveTab("Бай-ин & Дахин орох")}>
              Бай-ин & Дахин орох
            </div>
          )}
          <div className={`ufm-tab ${activeTab === "Ширээний дэвсгэр" ? "active" : ""}`} onClick={() => setActiveTab("Ширээний дэвсгэр")}>
            Ширээний дэвсгэр
          </div>
          <div className={`ufm-tab ${activeTab === "Дууны тохиргоо" ? "active" : ""}`} onClick={() => setActiveTab("Дууны тохиргоо")}>
            Дууны тохиргоо
          </div>
          <div className={`ufm-tab ${activeTab === "Чатын тохиргоо" ? "active" : ""}`} onClick={() => setActiveTab("Чатын тохиргоо")}>
            Чатын тохиргоо
          </div>
          <div className={`ufm-tab ${activeTab === "Системийн тохиргоо" ? "active" : ""}`} onClick={() => setActiveTab("Системийн тохиргоо")}>
            Системийн тохиргоо
          </div>
        </div>

        <div className="ufm-content-anim">
          {activeTab === "Ширээний тохиргоо" && <DesktopSettings closeModal={closeModal} />}
          {activeTab === "Ширээний дэвсгэр" && <WallpaperSettings closeModal={closeModal} />}
          {activeTab === "Дууны тохиргоо" && <SoundSettings closeModal={closeModal} />}
          {activeTab === "Чатын тохиргоо" && <ChatSettings closeModal={closeModal} />}
          {activeTab === "Системийн тохиргоо" && <SystemSettings closeModal={closeModal} />}
        </div>
      </div>
    </div>
  );
}

export default SettingsModal;
