import React from "react";

interface Props {
  title: string;
  body: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal = React.memo(function ConfirmModal({ title, body, onConfirm, onCancel }: Props) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-title">{title}</div>
        <div className="comment">{body}</div>
        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
          <button className="addform-btn" style={{ background: "var(--red)" }} onClick={onConfirm}>[enter] confirm</button>
          <button className="addform-btn addform-btn-secondary" onClick={onCancel}>[esc] cancel</button>
        </div>
      </div>
    </div>
  );
});

export default ConfirmModal;
