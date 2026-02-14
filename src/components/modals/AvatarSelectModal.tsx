import React, { useState } from "react";

interface AvatarSelectModalProps {
  currentAvatar: string | null;
  currentBorder: string | null;
  onClose: () => void;
  onSave: (data: { avatar: string | null; border: string | null }) => void;
}

const avatarOptions: string[] = [
  // AI-generated poker player avatars (not real people)
  "https://i.pravatar.cc/150?img=12",
  "https://i.pravatar.cc/150?img=13",
  "https://i.pravatar.cc/150?img=47",
  "https://i.pravatar.cc/150?img=15",
  "https://i.pravatar.cc/150?img=48",
  "https://i.pravatar.cc/150?img=51",
];

const borderOptions: (string | null)[] = [
  null,
  "https://ik.imagekit.io/5sdvi4wig/header-border.webp?tr=w-250,h-250,q-100,f-auto",
  "https://ik.imagekit.io/5sdvi4wig/avatar-border2.webp?tr=w-250,h-250,q-100,f-auto",
];

const AvatarSelectModal: React.FC<AvatarSelectModalProps> = ({ currentAvatar, currentBorder, onClose, onSave }) => {
  const [avatar, setAvatar] = useState<string | null>(currentAvatar);
  const [border, setBorder] = useState<string | null>(currentBorder);

  return (
    <div className="avatar-modal-overlay" onClick={onClose}>
      <div className="avatar-modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Сонголт хийх</h2>

        <h3>Аватар сонгох</h3>
        <div className="avatar-select-grid">
          {avatarOptions.map((img) => (
            <img key={img} src={img} className={`avatar-option ${avatar === img ? "active" : ""}`} onClick={() => setAvatar(img)} loading="lazy" />
          ))}
        </div>

        <h3>Хүрээ сонгох</h3>
        <div className="border-select-grid">
          <div className={`border-option no-border-box ${border === null ? "active" : ""}`} onClick={() => setBorder(null)}>
            No Border
          </div>

          {borderOptions
            .filter((b) => b !== null)
            .map((img) => (
              <img
                key={img!}
                src={img!}
                className={`border-option ${border === img ? "active" : ""}`}
                onClick={() => setBorder(img)}
                loading="lazy"
              />
            ))}
        </div>

        <button onClick={() => onSave({ avatar, border })} className="save-btn">
          Хадгалах
        </button>
      </div>
    </div>
  );
};

export default AvatarSelectModal;
