import React, { useMemo } from "react";
import type { Habit, DayLog } from "../types";

interface Props {
  habits: Habit[];
  history: Record<string, DayLog>;
}

const Heatmap = React.memo(function Heatmap({ habits, history }: Props) {
  const { cells, perfectDays } = useMemo(() => {
    const cells: { key: string; level: number; title: string }[] = [];
    let perfectDays = 0;
    const d = new Date();
    d.setDate(d.getDate() - (12 * 7 - 1));
    for (let i = 0; i < 12 * 7; i++) {
      const key = d.toISOString().slice(0, 10);
      const h = history[key];
      let level = 0;
      if (h && habits.length > 0) {
        const ratio = h.done.length / habits.length;
        if (ratio >= 1) { level = 4; perfectDays++; }
        else if (ratio >= 0.75) level = 3;
        else if (ratio >= 0.5) level = 2;
        else if (ratio > 0) level = 1;
      }
      cells.push({ key, level, title: `${key}: ${h ? h.done.length : 0}/${habits.length}` });
      d.setDate(d.getDate() + 1);
    }
    return { cells, perfectDays };
  }, [habits, history]);

  return (
    <div className="heatmap">
      <div className="heatmap-grid">
        {cells.map(c => (
          <div
            key={c.key}
            className={`heatmap-cell ${c.level > 0 ? `heatmap-cell-l${c.level}` : ""}`}
            title={c.title}
          />
        ))}
      </div>
      <div className="heatmap-label">{perfectDays} perfect days in last 12 weeks</div>
    </div>
  );
});

export default Heatmap;
