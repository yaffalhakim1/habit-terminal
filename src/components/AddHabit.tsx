import { useState, useCallback } from "react";
import type { Habit, HabitType, Difficulty } from "../types";
import { ICONS, HABIT_COLORS, DIFFICULTY_LABELS } from "../constants";

interface Props {
  open: boolean;
  onClose: () => void;
  onAdd: (habit: Omit<Habit, "id" | "streak" | "createdAt">) => void;
}

export default function AddHabit({ open, onClose, onAdd }: Props) {
  const [name, setName] = useState("");
  const [type, setType] = useState<HabitType>("checkbox");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [color, setColor] = useState(HABIT_COLORS[0]);
  const [icon, setIcon] = useState(ICONS[0]);

  const handleAdd = useCallback(() => {
    if (!name.trim()) return;
    const xpMap: Record<Difficulty, number> = { easy: 10, medium: 20, hard: 40 };
    onAdd({
      name: name.trim(),
      type,
      difficulty,
      icon,
      color,
      xp: xpMap[difficulty],
      goal: type === "counter" ? 10 : undefined,
    });
    setName("");
    setType("checkbox");
    setDifficulty("medium");
    onClose();
  }, [name, type, difficulty, color, icon, onAdd, onClose]);

  const handleKey = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleAdd();
    if (e.key === "Escape") onClose();
  }, [handleAdd, onClose]);

  if (!open) return null;

  return (
    <div className="addform">
      <div className="addform-title">new habit</div>
      <div className="addform-field">
        <label className="addform-label" htmlFor="add-name">name</label>
        <input
          id="add-name"
          className="addform-input"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={handleKey}
          placeholder="$ habit name"
          maxLength={40}
          autoFocus
        />
      </div>
      <div className="addform-row">
        <div className="addform-field">
          <label className="addform-label" htmlFor="add-type">type</label>
          <select id="add-type" className="addform-select" value={type} onChange={e => setType(e.target.value as HabitType)}>
            <option value="checkbox">checkbox</option>
            <option value="counter">counter (0/10)</option>
          </select>
        </div>
        <div className="addform-field">
          <label className="addform-label" htmlFor="add-diff">difficulty</label>
          <select id="add-diff" className="addform-select" value={difficulty} onChange={e => setDifficulty(e.target.value as Difficulty)}>
            {Object.entries(DIFFICULTY_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
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
      <div className="addform-row" style={{ marginTop: "0.25rem" }}>
        <button className="addform-btn" onClick={handleAdd}>[enter] add</button>
        <button className="addform-btn addform-btn-secondary" onClick={onClose}>[esc] cancel</button>
      </div>
    </div>
  );
}
