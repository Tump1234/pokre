import { useDesktopSettings } from "../../context/DesktopSettingsContext";

interface DesktopSettingsProps {
  closeModal: () => void;
}

function DesktopSettings({ closeModal }: DesktopSettingsProps) {
  const { localSettings, setLocalSetting, saveSettings, resetLocalSettings } = useDesktopSettings();

  const options = [
    { id: "showTurnIndicator", label: "Ээлж болоход ширээг харуулах" },
    { id: "autoPayBlind", label: "Автоматаар Blind төлөх" },
    { id: "acceptBBAutomatically", label: "BB-г хүлээнэ үү" },
    { id: "hideHoleCardsAutomatically", label: "Автоматаар хөзрөө нууж хаях" },
    { id: "autoStraddle", label: "Автомат straddle хийх" },
    { id: "cancelStraddle", label: "Автомат straddle цуцлалт" },
    { id: "showBetAmount", label: "Бэт хийсэн хэмжээг харуулах" },
    { id: "autoRunItTwice", label: "Run it twice-ийг автоматаар идэвхижүүлэх" },
    { id: "offerInsurance", label: "Даатгал санал болгох" },
    { id: "showCashInBB", label: "Бэлэн мөнгийг BB хэлбэрээр харуулах" },
    { id: "showTournamentStackInBB", label: "Тэмцээний чип стекийг BB хэлбэрээр харуулах" },
    { id: "streamMode", label: "Стримийн горим" },
    { id: "confirmCheckFold", label: "Чек боломжтой үед хаяхаа баталгаажуулна уу" },
    { id: "allowEmoji", label: "Эможиг зөвшөөрөх" },
    { id: "allowThrowables", label: "Шидэх зүйлсийг зөвшөөрөх" },
    { id: "animateChipsCards", label: "Чип, хөзрийн хөдөлгөөнт дүрс" },
    { id: "showFlagOnSeat", label: "Тоглогчийн суудал дээр улсын тугийг харуул" },
    { id: "squeezeHoleCards", label: "Squeeze hole cards" },
    { id: "highlightBestHand", label: "Highlight Best Hand" },
  ];

  return (
    <div className="settings-modal-tabs">
      <div className="modal-title">Ширээний тохиргоо</div>

      <div className="checkbox-group">
        {options.map((option) => (
          <label key={option.id} className="checkbox-item">
            <input type="checkbox" checked={!!localSettings[option.id]} onChange={(e) => setLocalSetting(option.id, e.target.checked)} />
            <span className="custom-checkbox" />
            <span className="checkbox-label">{option.label}</span>
          </label>
        ))}
      </div>

      <div className="desktop-settings-button-group">
        <div className="btn">
          <div className="btn-gradient" onClick={resetLocalSettings}>
            Тохиргоо дахин эхлүүлэх
          </div>
        </div>

        <div className="btn">
          <div className="btn-gradient" onClick={closeModal}>
            Цуцлах
          </div>
        </div>

        <div className="btn">
          <div
            className="btn-gradient"
            onClick={() => {
              saveSettings();
              closeModal();
            }}
          >
            Хадгалах
          </div>
        </div>
      </div>
    </div>
  );
}

export default DesktopSettings;
