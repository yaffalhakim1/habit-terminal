import { useState, useEffect } from "react";
import {
  loadHabiticaConfig,
  saveHabiticaConfig,
  clearHabiticaConfig,
} from "../services/habitica";
import { useHabiticaUser } from "../services/habitica-hooks";

interface Props {
  onConnect: () => void;
  onDisconnect: () => void;
  connected: boolean;
}

export default function HabiticaSettings({ onConnect, onDisconnect, connected }: Props) {
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [saved, setSaved] = useState(false);

  const { data: user } = useHabiticaUser();

  useEffect(() => {
    const config = loadHabiticaConfig();
    if (config) {
      setUserId(config.userId);
      setApiKey(config.apiKey);
    }
  }, []);

  const handleSave = () => {
    if (!userId.trim() || !apiKey.trim()) return;
    saveHabiticaConfig({ userId: userId.trim(), apiKey: apiKey.trim() });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    onConnect();
  };

  const handleDisconnect = () => {
    clearHabiticaConfig();
    setUserId("");
    setApiKey("");
    onDisconnect();
  };

  return (
    <div className="profilepage-section">
      <button className="sectionlabel-btn" onClick={() => setOpen(!open)}>
        <span className="sectionlabel">
          <span className="sectionlabel-text">
            Habitica sync {connected ? "●" : ""}
          </span>
          <span className="sectionlabel-line" />
        </span>
      </button>

      {!open && (
        <div className="comment">
          {connected
            ? `synced — ${user?.profile?.name || "loading..."}`
            : "two-way sync with Habitica"}
        </div>
      )}

      {open && (
        <div className="addform">
          <div className="ai-notice">
            <span className="ai-notice-icon">⚔️</span>
            <div>
              <div className="ai-notice-title">
                {connected ? `connected as ${user?.profile?.name || "..."}` : "connect your Habitica account"}
              </div>
              <div className="ai-notice-text">
                {connected
                  ? "toggle habits in term.habits → syncs to Habitica automatically"
                  : "get your User ID and API Key from habitica.com → Settings → API"}
              </div>
            </div>
          </div>

          {!connected ? (
            <>
              <div className="addform-field">
                <label className="addform-label" htmlFor="hab-user">user id</label>
                <input
                  id="hab-user"
                  className="addform-input"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  autoComplete="off"
                />
              </div>
              <div className="addform-field">
                <label className="addform-label" htmlFor="hab-key">api key</label>
                <input
                  id="hab-key"
                  className="addform-input"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="paste your API key"
                  autoComplete="off"
                />
              </div>
              <button className="addform-btn" onClick={handleSave}>
                {saved ? "[ok] saved" : "[enter] connect"}
              </button>
            </>
          ) : (
            <>
              <div className="ai-notice" style={{ marginBottom: "var(--sp-sm)" }}>
                <span className="ai-notice-icon">🔒</span>
                <div>
                  <div className="ai-notice-text">
                    your key stays in this browser only — never sent to any server, never included in the codebase
                  </div>
                </div>
              </div>
              <button className="addform-btn addform-btn-danger" onClick={handleDisconnect}>
                [del] disconnect
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
