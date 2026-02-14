import React from "react";

interface ConfirmFoldModalProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  confirmText?: string;
  cancelText?: string;
}

const ConfirmFoldModal: React.FC<ConfirmFoldModalProps> = ({
  open,
  onConfirm,
  onCancel,
  title = "Хийхдээ итгэлтэй байна уу?",
  confirmText = "Тийм",
  cancelText = "Үргэлжлүүлэх",
}) => {
  if (!open) return null;

  return (
    <div className="foldmodal-overlay" onClick={onCancel}>
      <div className="foldmodal-box" onClick={(e) => e.stopPropagation()}>
        <div className="foldmodal-icon"></div>

        <h2 className="foldmodal-title">{title}</h2>

        <div className="foldmodal-actions">
          <button className="foldmodal-btn foldmodal-cancel" onClick={onCancel}>
            {cancelText}
          </button>

          <button className="foldmodal-btn foldmodal-confirm" onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ConfirmFoldModal);
