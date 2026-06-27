import { useEffect, useRef } from "react";

interface Props {
  title: string;
  body: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
}

export default function ConfirmModal({ title, body, onConfirm, onCancel, confirmLabel }: Props) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    confirmRef.current?.focus();
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
      if (e.key === "Enter") onConfirm();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onCancel, onConfirm]);

  return (
    <div className="modal-overlay" onClick={onCancel} role="dialog" aria-modal="true" aria-label={title}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-title">{title}</div>
        <div className="comment">{body}</div>
        <div className="modal-actions">
          <button ref={confirmRef} className="addform-btn modal-confirm" onClick={onConfirm}>
            {confirmLabel || "[enter] confirm"}
          </button>
          <button className="addform-btn addform-btn-secondary" onClick={onCancel}>[esc] cancel</button>
        </div>
      </div>
    </div>
  );
}
