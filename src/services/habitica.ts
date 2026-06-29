const HABITICA_STORAGE_KEY = "term-habits-habitica";
const BASE_URL = "https://habitica.com/api/v3";
const CLIENT_NAME = "term.habits";

export interface HabiticaConfig {
  userId: string;
  apiKey: string;
}

export interface HabiticaTask {
  _id: string;
  text: string;
  type: "habit" | "daily" | "todo" | "reward";
  up: boolean;
  down: boolean;
  priority: number;
  value: number;
  streak: number;
  counterUp?: number;
  counterDown?: number;
  frequency?: string;
  everyX?: number;
  repeat?: Record<string, boolean>;
  startDate?: string;
  completed?: boolean;
  checklist?: Array<{ text: string; completed: boolean; id: string }>;
  tags: string[];
  history?: Array<{ date: string; value: number; scoredUp?: boolean; scoredDown?: boolean }>;
}

export interface HabiticaUser {
  _id: string;
  stats: {
    hp: number;
    maxHealth: number;
    exp: number;
    toNextLevel: number;
    lvl: number;
    gp: number;
    mp: number;
    class: string;
  };
  profile: {
    name: string;
  };
}

export function loadHabiticaConfig(): HabiticaConfig | null {
  try {
    const raw = localStorage.getItem(HABITICA_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveHabiticaConfig(config: HabiticaConfig): void {
  localStorage.setItem(HABITICA_STORAGE_KEY, JSON.stringify(config));
}

export function clearHabiticaConfig(): void {
  localStorage.removeItem(HABITICA_STORAGE_KEY);
}

async function habiticaFetch(path: string, method: string = "GET", body?: unknown): Promise<unknown> {
  const config = loadHabiticaConfig();
  if (!config) throw new Error("Habitica not configured");

  const headers: Record<string, string> = {
    "x-api-user": config.userId,
    "x-api-key": config.apiKey,
    "x-client": `${config.userId}-${CLIENT_NAME}`,
    "Content-Type": "application/json",
  };

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || `Habitica API error: ${res.status}`);
  return data.data;
}

export async function fetchTasks(type?: "habits" | "dailys" | "todos"): Promise<HabiticaTask[]> {
  const params = new URLSearchParams();
  if (type) params.set("type", type);
  params.set("history", "true");
  return habiticaFetch(`/tasks/user?${params}`) as Promise<HabiticaTask[]>;
}

export async function scoreTask(taskId: string, direction: "up" | "down"): Promise<{ hp: number; exp: number; lvl: number; gp: number; delta: number }> {
  return habiticaFetch(`/tasks/${taskId}/score/${direction}`, "POST") as Promise<{ hp: number; exp: number; lvl: number; gp: number; delta: number }>;
}

export async function fetchUser(): Promise<HabiticaUser> {
  return habiticaFetch("/user") as Promise<HabiticaUser>;
}

export function mapHabiticaTask(task: HabiticaTask): {
  name: string;
  type: "checkbox";
  difficulty: "easy" | "medium" | "hard";
  streak: number;
  schedule?: string;
  habiticaId: string;
} {
  const diffMap: Record<number, "easy" | "medium" | "hard"> = {
    0.1: "easy",
    1: "medium",
    1.5: "hard",
    2: "hard",
  };

  let schedule: string | undefined;
  if (task.type === "daily" && task.frequency === "weekly" && task.repeat) {
    const dayMap: Record<string, string> = {
      m: "mon", t: "tue", w: "wed", th: "thu", f: "fri", s: "sat", su: "sun",
    };
    const activeDays = Object.entries(task.repeat)
      .filter(([, v]) => v)
      .map(([k]) => dayMap[k])
      .filter(Boolean);
    if (activeDays.length > 0 && activeDays.length < 7) {
      schedule = activeDays.join(" · ");
    }
  }

  return {
    name: task.text,
    type: "checkbox",
    difficulty: diffMap[task.priority] || "medium",
    streak: task.streak || 0,
    schedule,
    habiticaId: task._id,
  };
}

export function mapHabiticaHistory(history: HabiticaTask["history"]): Record<string, { done: boolean }> {
  if (!history) return {};
  const result: Record<string, { done: boolean }> = {};
  for (const entry of history) {
    if (entry.scoredUp) {
      const date = entry.date.slice(0, 10);
      result[date] = { done: true };
    }
  }
  return result;
}
