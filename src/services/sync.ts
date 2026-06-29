import type { Habit } from "../types";
import { loadHabiticaConfig, scoreTask } from "./habitica";

/**
 * Sync coordinator — bridges local state changes to Habitica API.
 * Fire-and-forget: local state is always source of truth.
 * If Habitica is down, local still works.
 */
export async function syncToggle(habit: Habit, direction: "up" | "down"): Promise<void> {
  if (!habit.habiticaId) return;
  const config = loadHabiticaConfig();
  if (!config) return;

  try {
    await scoreTask(habit.habiticaId, direction);
  } catch (err) {
    console.warn("[habitica sync] score failed:", err);
  }
}

export function isHabiticaConnected(): boolean {
  return loadHabiticaConfig() !== null;
}
