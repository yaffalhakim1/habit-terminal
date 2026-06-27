import { useState, useCallback } from "react";
import type { Habit, Routine, DayLog, PlayerState } from "../types";
import { todayKey } from "../store";
import StatsBar from "./StatsBar";
import HabitItem from "./HabitItem";
import Heatmap from "./Heatmap";
import AddHabit from "./AddHabit";
import AddRoutine from "./AddRoutine";
import EditHabit from "./EditHabit";

interface Props {
  habits: Habit[];
  routines: Routine[];
  history: Record<string, DayLog>;
  player: PlayerState;
  onToggle: (id: string) => void;
  onEdit: (id: string, updates: Partial<Habit>) => void;
  onDelete: (id: string) => void;
  onAddHabit: (h: Omit<Habit, "id" | "streak" | "createdAt">) => void;
  onAddRoutine: (r: { name: string; icon: string; habitIds: string[] }) => void;
}

export default function HabitsPage({ habits, routines, history, player, onToggle, onEdit, onDelete, onAddHabit, onAddRoutine }: Props) {
  const [showAdd, setShowAdd] = useState(false);
  const [showRoutine, setShowRoutine] = useState(false);
  const [editing, setEditing] = useState<Habit | null>(null);
  const [openRoutines, setOpenRoutines] = useState<Set<string>>(new Set());
  const today = todayKey();
  const hist = history[today] || { done: [], counters: {} };

  const toggleRoutine = useCallback((id: string) => {
    setOpenRoutines(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const ungrouped = habits.filter(h => !h.routineId);
  const grouped = routines.map(r => ({
    ...r,
    habits: habits.filter(h => h.routineId === r.id),
  }));

  return (
    <>
      <StatsBar player={player} habits={habits} history={history} />

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
            onDelete={() => onDelete(h.id)}
          />
        ))}
      </div>

      {grouped.map(g => (
        <div key={g.id} className={`routine ${openRoutines.has(g.id) ? "routine-open" : ""}`}>
          <div className="routine-header" onClick={() => toggleRoutine(g.id)}>
            <span className="routine-icon">{g.icon}</span>
            <span className="routine-name">{g.name}</span>
            <span className="routine-chevron">▸</span>
          </div>
          <div className="routine-habits">
            {g.habits.map(h => (
              <HabitItem
                key={h.id}
                habit={h}
                done={hist.done.includes(h.id)}
                counter={hist.counters?.[h.id]}
                onToggle={() => onToggle(h.id)}
                onEdit={() => setEditing(h)}
                onDelete={() => onDelete(h.id)}
              />
            ))}
          </div>
        </div>
      ))}

      <div style={{ display: "flex", gap: "0.5rem", margin: "0.5rem 0" }}>
        <button className="addform-btn addform-btn-secondary" style={{ flex: 1 }} onClick={() => { setShowAdd(!showAdd); setShowRoutine(false); }}>
          + habit
        </button>
        <button className="addform-btn addform-btn-secondary" style={{ flex: 1 }} onClick={() => { setShowRoutine(!showRoutine); setShowAdd(false); }}>
          + routine
        </button>
      </div>

      <AddHabit open={showAdd} onClose={() => setShowAdd(false)} onAdd={onAddHabit} />
      <AddRoutine habits={habits} open={showRoutine} onClose={() => setShowRoutine(false)} onAdd={onAddRoutine} />
      <EditHabit habit={editing} onClose={() => setEditing(null)} onSave={onEdit} />

      <div className="sectionlabel">
        <span className="sectionlabel-text">last 12 weeks</span>
        <span className="sectionlabel-line" />
      </div>
      <Heatmap habits={habits} history={history} />
    </>
  );
}
