import React, { useMemo } from "react";

interface Props {
  done: number;
  total: number;
}

const BAR_LEN = 20;

const ProgressBar = React.memo(function ProgressBar({ done, total }: Props) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const filled = total > 0 ? Math.round((done / total) * BAR_LEN) : 0;

  const bar = useMemo(() => {
    const parts: string[] = [];
    for (let i = 0; i < BAR_LEN; i++) {
      parts.push(i < filled ? "█" : "░");
    }
    return parts.join("");
  }, [filled]);

  return (
    <div className="progressbar">
      <span className="progressbar-on">{bar.slice(0, filled)}</span>
      <span className="progressbar-off">{bar.slice(filled)}</span>
      <span className="progressbar-label">{pct}% [{done}/{total}]</span>
    </div>
  );
});

export default ProgressBar;
