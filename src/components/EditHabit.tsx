import { useState, useEffect, useRef } from "react";
import type { Habit } from "../types";
import { ICONS, HABIT_COLORS } from "../constants";

interface Props {
  habit: Habit | null;
  onClose: () => void;
  onSave: (id: string, updates: Partial<Habit>) => void;
  onDelete: (id: string) => void;
}

export default function EditHabit({ habit, onClose, onSave, onDelete }: Props) {
  const [name, setName] = useState("");
  const [color, setColor] = useState("");
  const [icon, setIcon] = useState("");
  const [schedule, setSchedule] = useState("");
  const overlayRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (habit) {
      setName(habit.name);
      setColor(habit.color);
      setIcon(habit.icon);
      setSchedule(habit.schedule || "");
      setTimeout(() => nameRef.current?.focus(), 50);
    }
  }, [habit]);

  useEffect(() => {
    if (!habit) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [habit, onClose]);

  if (!habit) return null;

  const handleSave = () => {
    if (!name.trim()) return;
    onSave(habit.id, { name: name.trim(), color, icon, schedule: schedule.trim() || undefined });
    onClose();
  };

  const handleDelete = () => {
    onDelete(habit.id);
    onClose();
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSave();
  };

  return (
    <div className="modal-overlay" ref={overlayRef} onClick={onClose} role="dialog" aria-modal="true" aria-label={`Edit ${habit.name}`}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="addform-title">edit habit</div>

        <div className="addform-field">
          <label className="addform-label" htmlFor="edit-name">name</label>
          <input
            id="edit-name"
            ref={nameRef}
            className="addform-input"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={handleKey}
            maxLength={40}
          />
        </div>

        <div className="addform-field">
          <label className="addform-label" htmlFor="edit-schedule">schedule</label>
          <input
            id="edit-schedule"
            className="addform-input"
            value={schedule}
            onChange={e => setSchedule(e.target.value)}
            onKeyDown={handleKey}
            placeholder="$ e.g. mon · thu"
          />
        </div>

        <fieldset className="addform-fieldset">
          <legend className="addform-label">icon</legend>
          <div className="addform-grid">
            {ICONS.map(i => (
              <button
                key={i}
                type="button"
                className={`addform-icon-btn ${icon === i ? "addform-icon-btn-active" : ""}`}
                onClick={() => setIcon(i)}
                aria-label={`Icon ${i}`}
                aria-pressed={icon === i}
              >
                {i}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="addform-fieldset">
          <legend className="addform-label">color</legend>
          <div className="addform-grid">
            {HABIT_COLORS.map(c => (
              <button
                key={c}
                type="button"
                className={`colordot ${color === c ? "colordot-active" : ""}`}
                style={{ background: c }}
                onClick={() => setColor(c)}
                aria-label={`Color ${c}`}
                aria-pressed={color === c}
              />
            ))}
          </div>
        </fieldset>

        <div className="edit-dialog-actions">
          <div className="edit-dialog-row">
            <button className="addform-btn" onClick={handleSave}>[enter] save</button>
            <button className="addform-btn addform-btn-secondary" onClick={onClose}>[esc] cancel</button>
          </div>
          <button className="addform-btn addform-btn-danger" onClick={handleDelete}>[del] delete habit</button>
        </div>
      </div>
    </div>
  );
}
