import type { Habit } from "../types";
import { ICONS } from "../constants";

interface Props {
  habits: Habit[];
  open: boolean;
  onClose: () => void;
  onAdd: (routine: { name: string; icon: string; habitIds: string[] }) => void;
}

export default function AddRoutine({ habits, open, onClose, onAdd }: Props) {
  const selected = new Set<string>();

  const toggle = (id: string) => {
    if (selected.has(id)) selected.delete(id); else selected.add(id);
  };

  const handleAdd = () => {
    const nameInput = document.querySelector('.addform-input') as HTMLInputElement;
    const name = nameInput?.value || "";
    if (!name.trim() || selected.size === 0) return;
    onAdd({ name: name.trim(), icon: ICONS[0], habitIds: [...selected] });
    onClose();
  };

  if (!open) return null;

  const ungrouped = habits.filter(h => !h.routineId);

  return (
    <div className="addform">
      <div className="addform-title">new routine</div>
      <input
        className="addform-input"
        placeholder="$ routine name"
        maxLength={40}
        autoFocus
      />
      <div>
        <div className="addform-title" style={{ marginBottom: "0.25rem" }}>icon</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem" }}>
          {ICONS.slice(0, 16).map(i => (
            <button
              key={i}
              style={{
                background: "transparent",
                border: "1px solid transparent",
                borderRadius: "var(--radius)",
                padding: "0.125rem 0.25rem",
                fontSize: "0.875rem",
                cursor: "pointer",
              }}
            >
              {i}
            </button>
          ))}
        </div>
      </div>
      <div>
        <div className="addform-title" style={{ marginBottom: "0.25rem" }}>habits</div>
        {ungrouped.length === 0 ? (
          <div className="comment">no ungrouped habits</div>
        ) : (
          ungrouped.map(h => (
            <label key={h.id} style={{ display: "flex", alignItems: "center", gap: "0.375rem", padding: "0.25rem 0", fontSize: "0.6875rem", color: "var(--fg)", cursor: "pointer" }}>
              <input
                type="checkbox"
                onChange={() => toggle(h.id)}
                style={{ accentColor: "var(--accent)" }}
              />
              {h.icon} {h.name}
            </label>
          ))
        )}
      </div>
      <div className="addform-row" style={{ marginTop: "0.25rem" }}>
        <button className="addform-btn" onClick={handleAdd}>[enter] create</button>
        <button className="addform-btn addform-btn-secondary" onClick={onClose}>[esc] cancel</button>
      </div>
    </div>
  );
}
