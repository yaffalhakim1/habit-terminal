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
  level: 1,
  xp: 0,
  hp: 50,
  maxHp: 50,
  bestStreak: 0,
  totalCompletions: 0,
  achievements: [],
  createdAt: Date.now(),
};

function defaultData(): StoreState {
  return {
    player: DEFAULT_PLAYER,
    habits: [],
    routines: [],
    history: {},
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
