import { useState, useEffect, useRef } from "react";
import type { Habit } from "../types";

interface Props {
  habit: Habit;
  done: boolean;
  counter?: number;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function HabitItem({ habit, done, counter, onToggle, onEdit, onDelete }: Props) {
  const [menu, setMenu] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menu) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setMenu(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [menu]);

  return (
    <div
      ref={ref}
      className={`habit ${done ? "habit-done" : ""} ${menu ? "habit-menu-open" : ""}`}
      onClick={() => { if (!menu) onToggle(); }}
      onContextMenu={e => { e.preventDefault(); setMenu(!menu); }}
    >
      <button className="habit-check" aria-label={done ? "Undo" : "Complete"}>
        <span className="habit-check-mark">✓</span>
      </button>
      <span className="habit-icon">{habit.icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <span className="habit-name" style={{ color: done ? undefined : habit.color }}>{habit.name}</span>
        {habit.schedule && <div className="habit-schedule">{habit.schedule}</div>}
      </div>
      {habit.type === "counter" && (
        <span className="habit-counter">
          <span className="habit-counter-val">[{counter || 0}/{habit.goal || 10}]</span>
        </span>
      )}
      <span className={`habit-streak ${habit.streak >= 7 ? "habit-streak-hot" : ""}`}>
        🔥{habit.streak}
      </span>
      <span className="habit-xp">+{habit.xp}xp</span>
      <button
        className="habit-menu-btn"
        onClick={e => { e.stopPropagation(); setMenu(!menu); }}
        aria-label="Habit menu"
      >⋮</button>
      {menu && (
        <div className="habit-menu" onClick={e => e.stopPropagation()}>
          <button className="habit-menu-item" onClick={() => { onEdit(); setMenu(false); }}>[edit]</button>
          <button className="habit-menu-item habit-menu-danger" onClick={() => { onDelete(); setMenu(false); }}>[delete]</button>
          <button className="habit-menu-item" onClick={() => setMenu(false)}>[close]</button>
        </div>
      )}
    </div>
  );
}
