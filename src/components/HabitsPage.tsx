import { useState } from "react";
import type { Habit, DayLog, PlayerState } from "../types";
import { todayKey } from "../store";
import StatsBar from "./StatsBar";
import HabitItem from "./HabitItem";
import Heatmap from "./Heatmap";
import AddHabit from "./AddHabit";
import EditHabit from "./EditHabit";

interface Props {
  habits: Habit[];
  history: Record<string, DayLog>;
  player: PlayerState;
  onToggle: (id: string) => void;
  onEdit: (id: string, updates: Partial<Habit>) => void;
  onDelete: (id: string) => void;
  onAddHabit: (h: Omit<Habit, "id" | "streak" | "createdAt">) => void;
}

export default function HabitsPage({ habits, history, player, onToggle, onEdit, onDelete, onAddHabit }: Props) {
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<Habit | null>(null);
  const today = todayKey();
  const hist = history[today] || { done: [], counters: {} };

  const ungrouped = habits.filter(h => !h.routineId);

  return (
    <>
      <StatsBar player={player} habits={habits} history={history} />

      <div className="sectionlabel">
        <span className="sectionlabel-text">last 12 weeks</span>
        <span className="sectionlabel-line" />
      </div>
      <Heatmap habits={habits} history={history} />

      <button className="addform-btn addform-btn-secondary" style={{ width: "100%" }} onClick={() => setShowAdd(!showAdd)}>
        {showAdd ? "[-] close" : "[+] new habit"}
      </button>

      <AddHabit open={showAdd} onClose={() => setShowAdd(false)} onAdd={onAddHabit} />

      <div className="sectionlabel">
        <span className="sectionlabel-text">habits</span>
        <span className="sectionlabel-line" />
      </div>

      {habits.length === 0 && <div className="habitlist-empty">no habits yet — tap + to add one</div>}

      <div className="habitlist">
        {ungrouped.map(h => (
          <HabitItem
            key={h.id}
            habit={h}
            done={hist.done.includes(h.id)}
            counter={hist.counters?.[h.id]}
            onToggle={() => onToggle(h.id)}
            onEdit={() => setEditing(h)}
          />
        ))}
      </div>

      <EditHabit habit={editing} onClose={() => setEditing(null)} onSave={onEdit} onDelete={onDelete} />
    </>
  );
}
