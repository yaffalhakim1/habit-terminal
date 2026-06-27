import React, { useState, useCallback } from "react";
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
      <input
        className="addform-input"
        value={name}
        onChange={e => setName(e.target.value)}
        onKeyDown={handleKey}
        placeholder="$ habit name"
        maxLength={40}
        autoFocus
      />
      <div className="addform-row">
        <select className="addform-select" value={type} onChange={e => setType(e.target.value as HabitType)}>
          <option value="checkbox">checkbox</option>
          <option value="counter">counter (0/10)</option>
        </select>
        <select className="addform-select" value={difficulty} onChange={e => setDifficulty(e.target.value as Difficulty)}>
          {Object.entries(DIFFICULTY_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>
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
        <button className="addform-btn" onClick={handleAdd}>[enter] add</button>
        <button className="addform-btn addform-btn-secondary" onClick={onClose}>[esc] cancel</button>
      </div>
    </div>
  );
}
