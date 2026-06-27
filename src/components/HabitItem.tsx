import type { Habit } from "../types";

interface Props {
  habit: Habit;
  done: boolean;
  counter?: number;
  onToggle: () => void;
  onDelete: () => void;
}

export default function HabitItem({ habit, done, counter, onToggle, onDelete }: Props) {
  return (
    <div
      className={`habit ${done ? "habit-done" : ""}`}
      onClick={onToggle}
      onContextMenu={e => { e.preventDefault(); onDelete(); }}
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
    </div>
  );
}
