import React from "react";
import type { ThemeName } from "../types";
import { THEMES } from "../constants";

interface Props {
  theme: ThemeName;
  onThemeChange: (t: ThemeName) => void;
  onReset: () => void;
}

const TopBar = React.memo(function TopBar({ theme, onThemeChange, onReset }: Props) {
  return (
    <header className="topbar">
      <span className="topbar-brand">
        term.habits<span className="topbar-cursor" />
      </span>
      <span className="topbar-spacer" />
      <select
        className="topbar-theme"
        value={theme}
        onChange={e => onThemeChange(e.target.value as ThemeName)}
        aria-label="Theme"
      >
        {Object.values(THEMES).map(t => (
          <option key={t.name} value={t.name}>{t.label}</option>
        ))}
      </select>
      <button className="topbar-reset" onClick={onReset}>[rst]</button>
    </header>
  );
});

export default TopBar;
