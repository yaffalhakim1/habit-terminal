export type Difficulty = "easy" | "medium" | "hard";
export type HabitType = "checkbox" | "counter";
export type Tab = "habits" | "stats" | "profile";
export type ThemeName =
  | "tokyo-night"
  | "light"
  | "dracula"
  | "nord"
  | "gruvbox"
  | "ayu-mirage"
  | "catppuccin-mocha"
  | "solarized-dark"
  | "github-dark"
  | "material-dark"
  | "everforest-dark"
  | "monokai"
  | "one-dark"
  | "kanagawa"
  | "nothing-orange"
  | "nothing-blue";

export interface Habit {
  id: string;
  name: string;
  icon: string;
  type: HabitType;
  difficulty: Difficulty;
  color: string;
  xp: number;
  routineId?: string;
  streak: number;
  goal?: number;
  schedule?: string;
  createdAt: number;
}

export type StoreState = AppState;

export interface Routine {
  id: string;
  name: string;
  icon: string;
  habitIds: string[];
  createdAt: number;
}

export interface DayLog {
  done: string[];
  counters: Record<string, number>;
}

export interface PlayerState {
  level: number;
  xp: number;
  hp: number;
  maxHp: number;
  bestStreak: number;
  totalCompletions: number;
  achievements: string[];
  createdAt: number;
}

export interface AppState {
  player: PlayerState;
  habits: Habit[];
  routines: Routine[];
  history: Record<string, DayLog>;
  theme: ThemeName;
}

export const DIFFICULTY_XP: Record<Difficulty, number> = {
  easy: 10,
  medium: 20,
  hard: 40,
};
