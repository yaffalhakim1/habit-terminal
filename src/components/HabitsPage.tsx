import { useState } from "react";
import type { Habit, DayLog, PlayerState } from "../types";
import { todayKey } from "../store";
import StatsBar from "./StatsBar";
import HabitItem from "./HabitItem";
import Heatmap from "./Heatmap";
import AddHabit from "./AddHabit";
import EditHabit from "./EditHabit";
import HabiticaImport from "./HabiticaImport";

interface Props {
  habits: Habit[];
  history: Record<string, DayLog>;
  player: PlayerState;
  onToggle: (id: string) => void;
  onEdit: (id: string, updates: Partial<Habit>) => void;
  onDelete: (id: string) => void;
  onAddHabit: (h: Omit<Habit, "id" | "streak" | "createdAt">) => void;
  onImportHabits: (habits: Omit<Habit, "id" | "createdAt">[]) => void;
  habiticaConnected: boolean;
  habiticaIds: Set<string>;
}

export default function HabitsPage({
  habits, history, player,
  onToggle, onEdit, onDelete, onAddHabit,
  onImportHabits, habiticaConnected, habiticaIds,
}: Props) {
  const [showAdd, setShowAdd] = useState(false);
  const [showImport, setShowImport] = useState(false);
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

      <div style={{ display: "flex", gap: "var(--sp-xs)", margin: "var(--sp-sm) 0" }}>
        <button className="addform-btn addform-btn-secondary" style={{ flex: 1 }} onClick={() => { setShowAdd(!showAdd); setShowImport(false); }}>
          {showAdd ? "[-] close" : "[+] new habit"}
        </button>
        {habiticaConnected && (
          <button className="addform-btn addform-btn-secondary" style={{ flex: 1 }} onClick={() => { setShowImport(!showImport); setShowAdd(false); }}>
            {showImport ? "[-] close" : "[↓] import"}
          </button>
        )}
      </div>

      <AddHabit open={showAdd} onClose={() => setShowAdd(false)} onAdd={onAddHabit} />
      <HabiticaImport
        open={showImport}
        onClose={() => setShowImport(false)}
        onImport={onImportHabits}
        existingHabitIds={habiticaIds}
      />

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
