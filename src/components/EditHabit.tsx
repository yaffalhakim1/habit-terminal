import { useState } from "react";
import type { Habit } from "../types";
import { ICONS, HABIT_COLORS } from "../constants";

interface Props {
  habit: Habit | null;
  onClose: () => void;
  onSave: (id: string, updates: Partial<Habit>) => void;
}

export default function EditHabit({ habit, onClose, onSave }: Props) {
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

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") onClose();
  };

  return (
    <div className="addform">
      <div className="addform-title">edit habit</div>
      <input
        className="addform-input"
        value={name}
        onChange={e => setName(e.target.value)}
        onKeyDown={handleKey}
        placeholder="$ habit name"
        maxLength={40}
        autoFocus
      />
      <input
        className="addform-input"
        value={schedule}
        onChange={e => setSchedule(e.target.value)}
        onKeyDown={handleKey}
        placeholder="$ schedule (e.g. mon · thu)"
      />
      <div>
        <div className="addform-title" style={{ marginBottom: "0.25rem" }}>icon</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem" }}>
          {ICONS.map(i => (
            <button
              key={i}
              style={{
                background: icon === i ? "var(--bg3)" : "transparent",
                border: icon === i ? "1px solid var(--accent)" : "1px solid transparent",
                borderRadius: "var(--radius)",
                padding: "0.125rem 0.25rem",
                fontSize: "0.875rem",
                cursor: "pointer",
              }}
              onClick={() => setIcon(i)}
            >
              {i}
            </button>
          ))}
        </div>
      </div>
      <div>
        <div className="addform-title" style={{ marginBottom: "0.25rem" }}>color</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem" }}>
          {HABIT_COLORS.map(c => (
            <button
              key={c}
              className={`colordot ${color === c ? "colordot-active" : ""}`}
              style={{ background: c, width: "1rem", height: "1rem", borderRadius: "50%", border: "none", cursor: "pointer" }}
              onClick={() => setColor(c)}
            />
          ))}
        </div>
      </div>
      <div className="addform-row" style={{ marginTop: "0.25rem" }}>
        <button className="addform-btn" onClick={handleSave}>[enter] save</button>
        <button className="addform-btn addform-btn-secondary" onClick={onClose}>[esc] cancel</button>
      </div>
    </div>
  );
}
