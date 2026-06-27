import type { Habit, DayLog, PlayerState } from "../types";

const AI_STORAGE_KEY = "term-habits-ai";

export interface AIConfig {
  apiKey: string;
  provider: "mimo" | "openai" | "gemini";
  model: string;
}

const PROVIDER_DEFAULTS: Record<AIConfig["provider"], { endpoint: string; model: string }> = {
  mimo: { endpoint: "https://api.xiaomimimo.com/v1/chat/completions", model: "mimo-v2.5-pro" },
  openai: { endpoint: "https://api.openai.com/v1/chat/completions", model: "gpt-4o-mini" },
  gemini: { endpoint: "https://generativelanguage.googleapis.com/v1beta/openai/", model: "gemini-2.5-flash" },
};

export function loadAIConfig(): AIConfig | null {
  try {
    const raw = localStorage.getItem(AI_STORAGE_KEY);
    if (!raw) return null;
    const config = JSON.parse(raw);
    // Force correct model name for mimo (fix stale localStorage)
    if (config.provider === "mimo") {
      config.model = "mimo-v2.5-pro";
      config.endpoint = PROVIDER_DEFAULTS.mimo.endpoint;
    }
    return config;
  } catch {
    return null;
  }
}

export function saveAIConfig(config: AIConfig): void {
  localStorage.setItem(AI_STORAGE_KEY, JSON.stringify(config));
}

export function clearAIConfig(): void {
  localStorage.removeItem(AI_STORAGE_KEY);
}

function buildPlayerContext(player: PlayerState, habits: Habit[], history: Record<string, DayLog>): string {
  const last7: string[] = [];
  const d = new Date();
  const dayNames = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

  for (let i = 6; i >= 0; i--) {
    const dd = new Date(d);
    dd.setDate(dd.getDate() - i);
    const key = dd.toISOString().slice(0, 10);
    const h = history[key];
    const done = h ? h.done.length : 0;
    const total = habits.length;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    last7.push(`${dayNames[dd.getDay()]}: ${done}/${total} (${pct}%)`);
  }

  const habitLines = habits.map(h => {
    let completions = 0;
    for (let i = 6; i >= 0; i--) {
      const dd = new Date();
      dd.setDate(dd.getDate() - i);
      const key = dd.toISOString().slice(0, 10);
      if (history[key]?.done.includes(h.id)) completions++;
    }
    return `- ${h.name}: ${h.type}, ${h.difficulty}, streak ${h.streak}, ${completions}/7 days`;
  });

  return `Player: lv ${player.level}, ${player.xp}xp, ${player.hp}/${player.maxHp}hp, streak ${player.bestStreak}, ${player.totalCompletions} total completions

Habits (${habits.length}):
${habitLines.join("\n")}

Last 7 days:
${last7.join("\n")}`;
}

interface ChatMessage {
  role: "system" | "user";
  content: string;
}

async function callProvider(config: AIConfig, messages: ChatMessage[]): Promise<string> {
  const provider = PROVIDER_DEFAULTS[config.provider];

  if (config.provider === "gemini") {
    const res = await fetch(provider.endpoint + `${config.model}:generateContent?key=${config.apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: messages.map(m => `${m.role}: ${m.content}`).join("\n\n") }] }],
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || "AI request failed");
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  }

  const headers: Record<string, string> = { "Content-Type": "application/json", Authorization: `Bearer ${config.apiKey}` };

  const res = await fetch(provider.endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: config.model,
      messages,
    }),
  });

  const rawText = await res.text();
  let data: Record<string, unknown>;
  try { data = JSON.parse(rawText); } catch { data = { raw: rawText }; }
  if (!res.ok) throw new Error(`[${res.status}] ${JSON.stringify((data as Record<string, unknown>).error || data)}`);
  return (data as { choices?: Array<{ message?: { content?: string } }> }).choices?.[0]?.message?.content || "";
}

export async function reflect(
  systemPrompt: string,
  player: PlayerState,
  habits: Habit[],
  history: Record<string, DayLog>,
): Promise<string> {
  const config = loadAIConfig();
  if (!config) throw new Error("No API key configured");

  const userContent = buildPlayerContext(player, habits, history);
  return callProvider(config, [
    { role: "system", content: systemPrompt },
    { role: "user", content: userContent },
  ]);
}
