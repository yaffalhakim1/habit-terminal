import { useMemo } from "react";
import type { PlayerState, Habit, DayLog } from "../types";
import { calcStreak, calcDayOfWeekStats } from "../store";
import DayChart from "./DayChart";

interface Props {
  player: PlayerState;
  habits: Habit[];
  history: Record<string, DayLog>;
}

export default function StatsPage({ player, habits, history }: Props) {
  const streak = useMemo(() => calcStreak(habits, history), [habits, history]);
  const dayStats = useMemo(() => calcDayOfWeekStats(habits, history), [habits, history]);

  const last7 = useMemo(() => {
    const d = new Date();
    let total = 0;
    let possible = 0;
    for (let i = 0; i < 7; i++) {
      const key = d.toISOString().slice(0, 10);
      const h = history[key];
      if (h) { total += h.done.length; possible += habits.length; }
      d.setDate(d.getDate() - 1);
    }
    return possible > 0 ? Math.round((total / possible) * 100) : 0;
  }, [history, habits]);

  const bestDay = dayStats.reduce((a, b) => b.rate > a.rate ? b : a, dayStats[0]);
  const worstDay = dayStats.reduce((a, b) => b.rate < a.rate ? b : a, dayStats[0]);

  const memberSince = useMemo(() => {
    const d = new Date(player.createdAt);
    return `${d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
  }, [player.createdAt]);

  const totalDays = Object.keys(history).length;

  return (
    <div className="statspage">
      <div className="statspage-section">
        <div className="statspage-section-title">lifetime overview</div>
        <div className="statspage-grid">
          <div className="statspage-card">
            <div className="statspage-card-value">{player.totalCompletions}</div>
            <div className="statspage-card-label">completions</div>
          </div>
          <div className="statspage-card">
            <div className="statspage-card-value">{habits.length}</div>
            <div className="statspage-card-label">active habits</div>
          </div>
          <div className="statspage-card">
            <div className="statspage-card-value">{totalDays}</div>
            <div className="statspage-card-label">days tracked</div>
          </div>
          <div className="statspage-card">
            <div className="statspage-card-value">{player.bestStreak}</div>
            <div className="statspage-card-label">best streak</div>
          </div>
        </div>
      </div>

      <div className="statspage-section">
        <div className="statspage-section-title">current streak</div>
        <div className="statspage-card" style={{ textAlign: "left", padding: "0.75rem" }}>
          <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--accent)" }}>
            {streak} <span style={{ fontSize: "0.6875rem", fontWeight: 400, color: "var(--fg2)" }}>days</span>
          </div>
          <div className="comment">consecutive days hitting daily goal</div>
        </div>
      </div>

      <div className="statspage-section">
        <div className="statspage-section-title">data window</div>
        <div className="statspage-card" style={{ textAlign: "left", padding: "0.75rem" }}>
          <div style={{ fontSize: "0.75rem", color: "var(--fg2)" }}>
            this 7d: <strong style={{ color: last7 >= 70 ? "var(--accent)" : last7 >= 40 ? "var(--warn)" : "var(--red)" }}>{last7}%</strong> completion
          </div>
          <div style={{ fontSize: "0.6875rem", color: "var(--fg2)", marginTop: "0.25rem" }}>
            member since {memberSince}
          </div>
        </div>
      </div>

      <div className="statspage-section">
        <div className="statspage-section-title">day of week</div>
        <div className="statspage-chart">
          <DayChart data={dayStats} />
          {bestDay && (
            <div className="comment" style={{ marginTop: "0.5rem" }}>
              best day: {bestDay.day} ({bestDay.rate}%) • worst: {worstDay.day} ({worstDay.rate}%)
            </div>
          )}
        </div>
      </div>

      {habits.length > 0 && (
        <div className="statspage-section">
          <div className="statspage-section-title">completion rates</div>
          {habits.map(h => {
            let done = 0;
            let total = 0;
            Object.values(history).forEach(day => {
              if (day.done.includes(h.id)) done++;
              total++;
            });
            const rate = total > 0 ? Math.round((done / total) * 100) : 0;
            return (
              <div key={h.id} className="daychart-row" style={{ padding: "0.25rem 0" }}>
                <span className="daychart-label" style={{ width: "auto", textAlign: "left", flex: 1, fontSize: "0.625rem" }}>
                  {h.icon} {h.name}
                </span>
                <div className="daychart-bar-wrap" style={{ maxWidth: "8rem" }}>
                  <div className="daychart-bar" style={{ width: `${rate}%` }} />
                </div>
                <span className="daychart-val">{rate}%</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
