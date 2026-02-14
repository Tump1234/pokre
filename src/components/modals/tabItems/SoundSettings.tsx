import { useState } from "react";

interface SoundSettingsProps {
  closeModal: () => void;
}

function SoundSettings({ closeModal }: SoundSettingsProps) {
  const options = [
    { id: "1", label: "Хаях" },
    { id: "2", label: "Чек" },
    { id: "3", label: "Дуудах" },
    { id: "4", label: "Бет" },
    { id: "5", label: "Чипүүдийг зөөх" },
    { id: "6", label: "Хөзөр тараасан" },
    { id: "7", label: "Хөзрүүдийг харуулах" },
    { id: "8", label: "Харуулахгүй" },
    { id: "9", label: "Хожлын хөзрөө нуух" },
    { id: "10", label: "Баяр хүргэе" },
    { id: "11", label: "Тоглоомын өөрчлөлт" },
    { id: "12", label: "Таны ээлж" },
    { id: "13", label: "Цагийн анхааруулга" },
    { id: "14", label: "Цагийн анхааруулга 2" },
  ];

  const [soundOn, setSoundOn] = useState(false);
  const [checkedItems, setCheckedItems] = useState<{ [key: string]: boolean }>(options.reduce((acc, option) => ({ ...acc, [option.id]: false }), {}));
  const [volume, setVolume] = useState(50);
  const handleSoundToggle = () => {
    setSoundOn((prev) => !prev);
  };

  const handleChange = (id: string) => {
    setCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="settings-modal-tabs">
      <div className="modal-title">Дууны тохиргоо</div>

      <div className="sound-slide-box">
        <label className="checkbox-item">
          <input type="checkbox" checked={soundOn} onChange={handleSoundToggle} />
          <span className="custom-checkbox" />
          <span className="checkbox-label">Дуугаралт</span>
        </label>

        <div className="volume-slider-container">
          <div className="volume-btn less" onClick={() => setVolume((v) => Math.max(0, v - 5))} />
          <input
            type="range"
            min={0}
            max={100}
            value={volume}
            disabled={!soundOn}
            className="volume-slider"
            onChange={(e) => setVolume(Number(e.target.value))}
            style={{ "--volume-percent": `${volume}%` } as React.CSSProperties}
          />

          <div className="volume-btn plus" onClick={() => setVolume((v) => Math.min(100, v + 5))} />
        </div>
      </div>

      <div className="modal-title">Хувь хүний ​​дууны тохиргоо:</div>

      <div className="checkbox-group">
        {options.map((option) => (
          <label key={option.id} className="checkbox-item">
            <input type="checkbox" checked={checkedItems[option.id]} onChange={() => handleChange(option.id)} disabled={!soundOn} />
            <span className="custom-checkbox" />
            <span className="checkbox-label">{option.label}</span>
          </label>
        ))}
      </div>

      <div className="desktop-settings-button-group">
        <div className="btn">
          <div className="btn-gradient">Тохиргоо дахин эхлүүлэх</div>
        </div>
        <div className="btn">
          <div className="btn-gradient" onClick={closeModal}>
            Цуцлах
          </div>
        </div>
        <div className="btn">
          <div className="btn-gradient">Хадгалах</div>
        </div>
      </div>
    </div>
  );
}

export default SoundSettings;
