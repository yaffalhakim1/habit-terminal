import { useState, useEffect } from "react";
import type { AIConfig } from "../services/ai";
import { loadAIConfig, saveAIConfig, clearAIConfig } from "../services/ai";

interface Props {
  onConfigChange: (config: AIConfig | null) => void;
}

const PROVIDERS: { id: AIConfig["provider"]; label: string; models: string[] }[] = [
  { id: "mimo", label: "Xiaomi MiMo", models: ["mimo-v2-flash"] },
  { id: "openai", label: "OpenAI", models: ["gpt-4o-mini", "gpt-4o"] },
  { id: "gemini", label: "Google Gemini", models: ["gemini-2.5-flash"] },
];

export default function AISettings({ onConfigChange }: Props) {
  const [open, setOpen] = useState(false);
  const [provider, setProvider] = useState<AIConfig["provider"]>("mimo");
  const [model, setModel] = useState("mimo-v2-flash");
  const [apiKey, setApiKey] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const config = loadAIConfig();
    if (config) {
      setProvider(config.provider);
      setModel(config.model);
      setApiKey(config.apiKey);
    }
  }, []);

  const handleProviderChange = (p: AIConfig["provider"]) => {
    setProvider(p);
    const prov = PROVIDERS.find(x => x.id === p);
    if (prov) setModel(prov.models[0]);
  };

  const handleSave = () => {
    if (!apiKey.trim()) return;
    const config: AIConfig = { apiKey: apiKey.trim(), provider, model };
    saveAIConfig(config);
    onConfigChange(config);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClear = () => {
    clearAIConfig();
    setApiKey("");
    onConfigChange(null);
  };

  const currentProvider = PROVIDERS.find(p => p.id === provider);

  return (
    <div className="profilepage-section">
      <button className="sectionlabel-btn" onClick={() => setOpen(!open)}>
        <span className="sectionlabel">
          <span className="sectionlabel-text">AI assistant</span>
          <span className="sectionlabel-line" />
        </span>
      </button>

      {!open && <div className="comment">BYOK — optional, not required</div>}

      {open && (
        <div className="addform">
          <div className="ai-notice">
            <span className="ai-notice-icon">🔒</span>
            <div>
              <div className="ai-notice-title">your key stays in this browser</div>
              <div className="ai-notice-text">
                stored in localStorage only, never sent anywhere except the AI provider.
                safe to enter — it never leaves your device.
              </div>
            </div>
          </div>

          <div className="addform-field">
            <label className="addform-label" htmlFor="ai-provider">provider</label>
            <select
              id="ai-provider"
              className="addform-select"
              value={provider}
              onChange={e => handleProviderChange(e.target.value as AIConfig["provider"])}
            >
              {PROVIDERS.map(p => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
          </div>

          {currentProvider && currentProvider.models.length > 1 && (
            <div className="addform-field">
              <label className="addform-label" htmlFor="ai-model">model</label>
              <select
                id="ai-model"
                className="addform-select"
                value={model}
                onChange={e => setModel(e.target.value)}
              >
                {currentProvider.models.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          )}

          <div className="addform-field">
            <label className="addform-label" htmlFor="ai-key">API key</label>
            <input
              id="ai-key"
              className="addform-input"
              type="password"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="paste your API key here"
              autoComplete="off"
            />
          </div>

          <div className="addform-row">
            <button className="addform-btn" onClick={handleSave}>
              {saved ? "[ok] saved" : "[enter] save"}
            </button>
            {apiKey && (
              <button className="addform-btn addform-btn-danger" onClick={handleClear}>
                [del] remove key
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
