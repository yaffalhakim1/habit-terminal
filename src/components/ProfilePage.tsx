import type { ThemeName, PlayerState } from "../types";
import { THEMES, ACHIEVEMENTS } from "../constants";
import AISettings from "./AISettings";
import HabiticaSettings from "./HabiticaSettings";

interface Props {
  theme: ThemeName;
  onThemeChange: (t: ThemeName) => void;
  player: PlayerState;
  onReset: () => void;
  onAIConfigChange: (config: boolean) => void;
  onHabiticaConnect: () => void;
  onHabiticaDisconnect: () => void;
  habiticaConnected: boolean;
}

export default function ProfilePage({
  theme, onThemeChange, player, onReset,
  onAIConfigChange, onHabiticaConnect, onHabiticaDisconnect, habiticaConnected,
}: Props) {
  const darkThemes = Object.values(THEMES).filter(t => t.dark);
  const lightThemes = Object.values(THEMES).filter(t => !t.dark);

  return (
    <div className="profilepage">
      <AISettings onConfigChange={(c) => onAIConfigChange(c !== null)} />
      <HabiticaSettings
        connected={habiticaConnected}
        onConnect={onHabiticaConnect}
        onDisconnect={onHabiticaDisconnect}
      />

      <div className="profilepage-section">
        <div className="profilepage-section-title">achievements</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          {ACHIEVEMENTS.map(a => {
            const earned = player.achievements.includes(a.id);
            return (
              <div key={a.id} className={`achievement ${earned ? "" : "achievement-locked"}`}>
                <span className="achievement-star">{earned ? "★" : "☆"}</span>
                <span className="achievement-name">{a.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="profilepage-section">
        <div className="profilepage-section-title">dark themes</div>
        <div className="profilepage-themes">
          {darkThemes.map(t => (
            <button
              key={t.name}
              className={`profilepage-theme ${theme === t.name ? "profilepage-theme-active" : ""}`}
              onClick={() => onThemeChange(t.name as ThemeName)}
            >
              <span style={{ display: "flex", gap: "2px" }}>
                {Object.values(t.colors).slice(0, 4).map((c, i) => (
                  <span key={i} className="colordot" style={{ background: c, width: "0.5rem", height: "0.5rem" }} />
                ))}
              </span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="profilepage-section">
        <div className="profilepage-section-title">light themes</div>
        <div className="profilepage-themes">
          {lightThemes.map(t => (
            <button
              key={t.name}
              className={`profilepage-theme ${theme === t.name ? "profilepage-theme-active" : ""}`}
              onClick={() => onThemeChange(t.name as ThemeName)}
            >
              <span style={{ display: "flex", gap: "2px" }}>
                {Object.values(t.colors).slice(0, 4).map((c, i) => (
                  <span key={i} className="colordot" style={{ background: c, width: "0.5rem", height: "0.5rem" }} />
                ))}
              </span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="profilepage-section">
        <div className="profilepage-section-title">account</div>
        <div className="statspage-card" style={{ textAlign: "left", padding: "0.75rem" }}>
          <div style={{ fontSize: "0.75rem", color: "var(--fg2)" }}>
            level <strong style={{ color: "var(--accent)" }}>{player.level}</strong> • {player.totalCompletions} completions • {player.achievements.length}/{ACHIEVEMENTS.length} achievements
          </div>
        </div>
        <button
          className="addform-btn addform-btn-danger"
          style={{ marginTop: "0.5rem", width: "100%" }}
          onClick={onReset}
        >
          [rst] reset all data
        </button>
      </div>
    </div>
  );
}
