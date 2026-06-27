import React from "react";
import type { PlayerState, Habit, DayLog } from "../types";
import { calcStreak, todayKey, formatDay } from "../store";
import ProgressBar from "./ProgressBar";

interface Props {
  player: PlayerState;
  habits: Habit[];
  history: Record<string, DayLog>;
}

const StatsBar = React.memo(function StatsBar({ player, habits, history }: Props) {
  const today = todayKey();
  const hist = history[today] || { done: [], counters: {} };
  const done = hist.done.length;
  const total = habits.length;
  const streak = calcStreak(habits, history);

  return (
    <div className="statsbar">
      <div className="statsbar-prompt">you@term.habits $ daily</div>
      <div className="comment">{formatDay()}</div>
      <div className="statsbar-row">
        <span className="statsbar-stat">lv <strong>{player.level}</strong></span>
        <span className="statsbar-stat"><strong style={{ color: "var(--accent2)" }}>{player.xp}</strong> xp</span>
        <span className="statsbar-stat">
          <strong style={{ color: player.hp < player.maxHp * 0.3 ? "var(--red)" : "var(--warn)" }}>
            {player.hp}
          </strong>/{player.maxHp} hp
        </span>
        <span className="statsbar-stat">🔥 <strong>{streak}</strong></span>
        <span className="statsbar-stat"><strong>{done}</strong>/<strong>{total}</strong></span>
      </div>
      <div className="statsbar-bar">
        <ProgressBar done={done} total={total || 1} />
      </div>
    </div>
  );
});

export default StatsBar;
