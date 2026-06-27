import { useState } from "react";
import type { Habit } from "../types";
import { ICONS, HABIT_COLORS } from "../constants";

interface Props {
  habit: Habit | null;
  onClose: () => void;
  onSave: (id: string, updates: Partial<Habit>) => void;
  onDelete: (id: string) => void;
}

export default function EditHabit({ habit, onClose, onSave, onDelete }: Props) {
  const [name, setName] = useState(habit?.name || "");
  const [color, setColor] = useState(habit?.color || HABIT_COLORS[0]);
  const [icon, setIcon] = useState(habit?.icon || ICONS[0]);
  const [schedule, setSchedule] = useState(habit?.schedule || "");

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
    if (e.key === "Escape") onClose();
  };

  return (
    <div className="addform">
      <div className="addform-title">edit habit</div>
      <div className="addform-field">
        <label className="addform-label" htmlFor="edit-name">name</label>
        <input
          id="edit-name"
          className="addform-input"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={handleKey}
          placeholder="$ habit name"
          maxLength={40}
          autoFocus
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
      <div className="addform-actions">
        <div className="addform-row">
          <button className="addform-btn" onClick={handleSave}>[enter] save</button>
          <button className="addform-btn addform-btn-secondary" onClick={onClose}>[esc] cancel</button>
        </div>
        <button className="addform-btn addform-btn-danger" onClick={handleDelete}>[del] delete habit</button>
      </div>
    </div>
  );
}
