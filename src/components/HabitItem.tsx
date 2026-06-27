import type { Habit } from "../types";

interface Props {
  habit: Habit;
  done: boolean;
  counter?: number;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function HabitItem({ habit, done, counter, onToggle, onEdit }: Props) {
  return (
    <div className={`habit ${done ? "habit-done" : ""}`}>
      <button
        className="habit-check"
        onClick={onToggle}
        aria-label={done ? `Undo ${habit.name}` : `Complete ${habit.name}`}
      >
        <span className="habit-check-mark">✓</span>
      </button>
      <span className="habit-icon" aria-hidden="true">{habit.icon}</span>
      <div className="habit-body">
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
      <button className="habit-edit-btn" onClick={onEdit} aria-label={`Edit ${habit.name}`}>
        ✎
      </button>
    </div>
  );
}
