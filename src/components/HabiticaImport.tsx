import { useState, useCallback } from "react";
import type { Habit } from "../types";
import { useHabiticaTasks } from "../services/habitica-hooks";
import { mapHabiticaTask } from "../services/habitica";
import { ICONS, HABIT_COLORS } from "../constants";

interface Props {
  existingHabitIds: Set<string>;
  onImport: (habits: Omit<Habit, "id" | "createdAt">[]) => void;
  onClose: () => void;
  open: boolean;
}

export default function HabiticaImport({ existingHabitIds, onImport, onClose, open }: Props) {
  const { data: habits, isLoading: habitsLoading } = useHabiticaTasks("habits");
  const { data: dailys, isLoading: dailysLoading } = useHabiticaTasks("dailys");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [imported, setImported] = useState(false);

  const loading = habitsLoading || dailysLoading;
  const allTasks = [...(habits || []), ...(dailys || [])];
  const unimported = allTasks.filter((t) => !existingHabitIds.has(t._id));

  const toggle = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleImport = useCallback(() => {
    const toImport = unimported
      .filter((t) => selected.has(t._id))
      .map((t, i) => ({
        ...mapHabiticaTask(t),
        icon: ICONS[i % ICONS.length],
        color: HABIT_COLORS[i % HABIT_COLORS.length],
        xp: { easy: 10, medium: 20, hard: 40 }[mapHabiticaTask(t).difficulty] || 20,
        createdAt: Date.now(),
      }));
    if (toImport.length > 0) {
      onImport(toImport);
      setImported(true);
      setTimeout(() => {
        setImported(false);
        onClose();
      }, 1500);
    }
  }, [selected, unimported, onImport, onClose]);

  const selectAll = useCallback(() => {
    setSelected(new Set(unimported.map((t) => t._id)));
  }, [unimported]);

  if (!open) return null;

  return (
    <div className="addform">
      <div className="addform-title">import from Habitica</div>

      {loading && (
        <div className="comment">// loading tasks from Habitica...</div>
      )}

      {!loading && unimported.length === 0 && (
        <div className="comment">// all Habitica tasks already imported</div>
      )}

      {!loading && unimported.length > 0 && (
        <>
          <div style={{ display: "flex", gap: "var(--sp-sm)", marginBottom: "var(--sp-sm)" }}>
            <button className="addform-btn addform-btn-secondary" onClick={selectAll}>
              select all ({unimported.length})
            </button>
            <button className="addform-btn addform-btn-secondary" onClick={() => setSelected(new Set())}>
              clear
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-xs)" }}>
            {unimported.map((t) => (
              <label
                key={t._id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--sp-xs)",
                  padding: "var(--sp-xs) var(--sp-sm)",
                  background: selected.has(t._id) ? "var(--bg3)" : "transparent",
                  borderRadius: "var(--radius)",
                  border: "1px solid " + (selected.has(t._id) ? "var(--accent)" : "var(--border)"),
                  cursor: "pointer",
                  fontSize: "var(--fs-2xs)",
                  color: "var(--fg)",
                }}
              >
                <input
                  type="checkbox"
                  checked={selected.has(t._id)}
                  onChange={() => toggle(t._id)}
                  style={{ accentColor: "var(--accent)" }}
                />
                <span>{t.text}</span>
                <span style={{ color: "var(--fg3)", marginLeft: "auto" }}>
                  {t.type} · {t.streak > 0 ? `🔥${t.streak}` : ""}
                </span>
              </label>
            ))}
          </div>
          <button className="addform-btn" onClick={handleImport} style={{ marginTop: "var(--sp-sm)" }}>
            {imported
              ? `[ok] imported ${selected.size} tasks`
              : `[enter] import ${selected.size} selected`}
          </button>
        </>
      )}

      <button
        className="addform-btn addform-btn-secondary"
        onClick={onClose}
        style={{ marginTop: "var(--sp-xs)" }}
      >
        [esc] close
      </button>
    </div>
  );
}
