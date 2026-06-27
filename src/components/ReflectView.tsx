import { useState } from "react";
import type { PlayerState, Habit, DayLog } from "../types";
import { reflect } from "../services/ai";
import { AI_PROMPTS } from "../constants";

interface Props {
  player: PlayerState;
  habits: Habit[];
  history: Record<string, DayLog>;
}

type ViewState = "idle" | "loading" | "result" | "error";

export default function ReflectView({ player, habits, history }: Props) {
  const [state, setState] = useState<ViewState>("idle");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const handleReflect = async () => {
    setState("loading");
    setError("");
    try {
      const result = await reflect(AI_PROMPTS.reflect, player, habits, history);
      setOutput(result);
      setState("result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "unknown error");
      setState("error");
    }
  };

  return (
    <div className="reflect">
      {state === "idle" && (
        <button className="addform-btn reflect-btn" onClick={handleReflect}>
          🤖 reflect this week
        </button>
      )}

      {state === "loading" && (
        <div className="reflect-loading">
          <span className="reflect-loading-text">// querying AI...</span>
          <span className="reflect-loading-cursor" />
        </div>
      )}

      {state === "error" && (
        <div className="reflect-error">
          <div className="reflect-error-text">[ERROR] {error}</div>
          <button className="addform-btn addform-btn-secondary" onClick={handleReflect}>
            [enter] retry
          </button>
        </div>
      )}

      {state === "result" && (
        <div className="reflect-result">
          <div className="reflect-result-header">
            <span className="reflect-result-label">AI response</span>
            <button className="addform-btn addform-btn-secondary reflect-result-close" onClick={() => setState("idle")}>
              [x]
            </button>
          </div>
          <pre className="reflect-output">{output}</pre>
        </div>
      )}
    </div>
  );
}
