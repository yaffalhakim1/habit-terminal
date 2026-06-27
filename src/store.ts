import type { DayLog, Habit, PlayerState, Routine, ThemeName } from "./types";
import { XP_PER_LEVEL } from "./constants";

const STORAGE_KEY = "term-habits-v2";

export function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function xpToNext(level: number): number {
  return level * XP_PER_LEVEL;
}

export function calcStreak(
  habits: Habit[],
  history: Record<string, DayLog>
): number {
  if (habits.length === 0) return 0;
  let streak = 0;
  const d = new Date();
  const today = todayKey();
  const todayHist = history[today];
  const allDoneToday =
    todayHist && todayHist.done.length >= habits.length;

  if (!allDoneToday) d.setDate(d.getDate() - 1);

  while (true) {
    const key = d.toISOString().slice(0, 10);
    const h = history[key];
    if (!h) break;
    if (h.done.length >= habits.length) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else break;
  }
  return streak;
}

export function calcDayOfWeekStats(
  habits: Habit[],
  history: Record<string, DayLog>
): { day: string; rate: number }[] {
  const dayNames = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  const totals: number[] = [0, 0, 0, 0, 0, 0, 0];
  const counts: number[] = [0, 0, 0, 0, 0, 0, 0];

  Object.entries(history).forEach(([key, log]) => {
    const dow = new Date(key + "T12:00:00").getDay();
    totals[dow] += log.done.length;
    counts[dow] += habits.length;
  });

  return dayNames.map((day, i) => ({
    day,
    rate: counts[i] > 0 ? Math.round((totals[i] / counts[i]) * 100) : 0,
  }));
}

export function formatDay(
  date: Date = new Date()
): string {
  const days = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  const months = [
    "january",
    "february",
    "march",
    "april",
    "may",
    "june",
    "july",
    "august",
    "september",
    "october",
    "november",
    "december",
  ];
  return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()} ${date.getFullYear()}`;
}

export function formatShortDay(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  const days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  return days[d.getDay()];
}

export interface StoreState {
  player: PlayerState;
  habits: Habit[];
  routines: Routine[];
  history: Record<string, DayLog>;
  theme: ThemeName;
}

const DEFAULT_PLAYER: PlayerState = {
  level: 5,
  xp: 32,
  hp: 50,
  maxHp: 75,
  bestStreak: 0,
  totalCompletions: 52,
  achievements: ["init"],
  createdAt: new Date("2024-10-01").getTime(),
};

function h(id: string, name: string, icon: string, diff: "easy"|"medium"|"hard", color: string, schedule?: string, streak?: number): Habit {
  const xpMap = { easy: 10, medium: 20, hard: 40 };
  return { id, name, icon, type: "checkbox", difficulty: diff, color, xp: xpMap[diff], streak: streak || 0, schedule, createdAt: Date.now() };
}

function defaultData(): StoreState {
  const habits: Habit[] = [
    h("w", "Walking", "🚶", "easy", "#9ece6a", undefined, 7),
    h("s", "Solat 5 Waktu", "🕌", "medium", "#7aa2f7", undefined, 1),
    h("ls", "Learn something", "📚", "medium", "#7dcfff", undefined, 5),
    h("cc", "Dumbbell chest press", "🏋️", "medium", "#9ece6a", "mon · thu", 10),
    h("br", "Dumbbell bent-over rows", "🏋️", "medium", "#9ece6a", "mon · thu", 10),
    h("sp", "Dumbbell shoulder press", "🏋️", "medium", "#e0af68", "mon · thu", 5),
    h("bc", "Dumbbell bicep curls", "💪", "easy", "#e0af68", "mon · thu", 4),
    h("gs", "Dumbbell goblet squats", "🦵", "medium", "#e0af68", "wed", 3),
    h("fp", "Dumbbell floor press", "🏋️", "medium", "#e0af68", "wed", 2),
    h("pl", "Plank hold: 3 sets of 45 seconds", "⏱️", "hard", "#e0af68", "wed", 2),
    h("dt", "Dumbbell thrusters", "🏋️", "hard", "#e0af68", "tue · fri", 3),
    h("dr", "Dumbbell renegade rows", "💪", "hard", "#e0af68", "tue · fri", 2),
    h("rt", "Russians twist", "🔄", "medium", "#e0af68", "tue · fri", 2),
    h("pu", "Push-ups", "💪", "medium", "#e0af68", "tue · fri", 0),
  ];

  // Seeded from real Habitica history
  const history: Record<string, DayLog> = {
    "2025-12-10": { done: ["ls", "gs"], counters: {} },
    "2025-12-11": { done: ["cc", "br"], counters: {} },
    "2025-12-15": { done: ["cc", "br", "w"], counters: {} },
    "2025-12-16": { done: ["gs", "fp", "pl", "w"], counters: {} },
    "2025-12-17": { done: ["dt", "dr", "rt"], counters: {} },
    "2025-12-18": { done: ["cc", "br"], counters: {} },
    "2025-12-19": { done: ["dt", "dr", "rt"], counters: {} },
    "2025-12-20": { done: ["cc", "br", "w"], counters: {} },
    "2025-12-22": { done: ["cc", "br", "sp", "bc"], counters: {} },
    "2025-12-23": { done: ["w"], counters: {} },
    "2025-12-24": { done: ["gs", "fp", "pl"], counters: {} },
    "2025-12-25": { done: ["cc", "br", "sp", "bc"], counters: {} },
    "2025-12-29": { done: ["cc", "br", "sp", "bc", "w"], counters: {} },
    "2025-12-30": { done: ["dt", "w"], counters: {} },
    "2026-01-01": { done: ["cc", "br", "sp", "ls"], counters: {} },
    "2026-01-05": { done: ["cc", "br", "sp", "bc"], counters: {} },
    "2026-01-26": { done: ["ls"], counters: {} },
    "2026-01-30": { done: ["ls", "w"], counters: {} },
    "2026-06-27": { done: ["cc", "br", "ls"], counters: {} },
  };

  return {
    player: DEFAULT_PLAYER,
    habits,
    routines: [],
    history,
    theme: "nothing-orange",
  };
}

export function loadState(): StoreState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* fallthrough */
  }
  return defaultData();
}

export function saveState(state: StoreState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function resetState(): StoreState {
  const fresh = defaultData();
  saveState(fresh);
  return fresh;
}
