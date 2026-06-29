import { useState, useCallback, useEffect } from "react";
import type { Tab, ThemeName, Habit, StoreState } from "./types";
import { THEMES, ACHIEVEMENTS } from "./constants";
import { loadState, saveState, resetState, todayKey, xpToNext, calcStreak } from "./store";
import { loadAIConfig } from "./services/ai";
import { isHabiticaConnected } from "./services/sync";
import { syncToggle } from "./services/sync";
import { fetchUser } from "./services/habitica";
import TopBar from "./components/TopBar";
import TabNav from "./components/TabNav";
import HabitsPage from "./components/HabitsPage";
import StatsPage from "./components/StatsPage";
import ProfilePage from "./components/ProfilePage";
import Toast from "./components/Toast";
import ConfirmModal from "./components/ConfirmModal";

function applyTheme(theme: ThemeName) {
  const t = THEMES[theme];
  if (!t) return;
  const root = document.documentElement;
  Object.entries(t.colors).forEach(([k, v]) => root.style.setProperty(k, v));
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", t.colors["--bg"]);
}

export default function App() {
  const [state, setState] = useState<StoreState>(() => {
    const s = loadState();
    applyTheme(s.theme);
    return s;
  });
  const [tab, setTab] = useState<Tab>("habits");
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" | "info" } | null>(null);
  const [modal, setModal] = useState<{ title: string; body: string; onConfirm: () => void } | null>(null);
  const [hasAI, setHasAI] = useState<boolean>(() => loadAIConfig() !== null);
  const [habiticaConnected, setHabiticaConnected] = useState<boolean>(() => isHabiticaConnected());

  const persist = useCallback((next: StoreState) => {
    setState(next);
    saveState(next);
  }, []);

  const showToast = useCallback((msg: string, type: "success" | "error" | "info" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2000);
  }, []);

  const handleThemeChange = useCallback((t: ThemeName) => {
    const next = { ...state, theme: t };
    persist(next);
    applyTheme(t);
  }, [state, persist]);

  const handleToggle = useCallback((id: string) => {
    setState((prev: StoreState): StoreState => {
      const t = todayKey();
      const h = { ...prev.history };
      const day = { done: [...(h[t]?.done || [])], counters: { ...(h[t]?.counters || {}) } };
      let habit = prev.habits.find((x: Habit) => x.id === id);
      if (!habit) return prev;

      const idx = day.done.indexOf(id);
      let player = { ...prev.player };

      if (habit.type === "counter") {
        const cnt = day.counters[id] || 0;
        const goal = habit.goal || 10;
        if (cnt >= goal) {
          day.counters[id] = 0;
          if (idx === -1) {
            day.done.push(id);
            habit = { ...habit, streak: habit.streak + 1 };
            player.xp += habit.xp;
            player.totalCompletions++;
            while (player.xp >= xpToNext(player.level)) {
              player.xp -= xpToNext(player.level);
              player.level++;
              player.maxHp = 50 + player.level * 5;
              player.hp = player.maxHp;
            }
          }
        } else {
          day.counters[id] = cnt + 1;
        }
      } else {
        if (idx === -1) {
          day.done.push(id);
          habit = { ...habit, streak: habit.streak + 1 };
          player.xp += habit.xp;
          player.totalCompletions++;
          while (player.xp >= xpToNext(player.level)) {
            player.xp -= xpToNext(player.level);
            player.level++;
            player.maxHp = 50 + player.level * 5;
            player.hp = player.maxHp;
          }
          // Fire-and-forget sync to Habitica
          syncToggle(habit, "up");
        } else {
          day.done.splice(idx, 1);
          habit = { ...habit, streak: Math.max(0, habit.streak - 1) };
          player.xp = Math.max(0, player.xp - habit.xp);
          player.totalCompletions = Math.max(0, player.totalCompletions - 1);
          // Fire-and-forget sync undo to Habitica
          syncToggle(habit, "down");
        }
      }

      const habits = prev.habits.map((h: Habit) => h.id === id ? habit! : h);
      const newStreak = calcStreak(habits, { ...h, [t]: day });
      if (newStreak > player.bestStreak) player.bestStreak = newStreak;

      const newAchievements = [...player.achievements];
      ACHIEVEMENTS.forEach(a => {
        if (!newAchievements.includes(a.id) && a.check(player.level, player.bestStreak, player.totalCompletions, habits.length)) {
          newAchievements.push(a.id);
        }
      });
      player.achievements = newAchievements;

      const next: StoreState = { ...prev, player, habits, history: { ...h, [t]: day } };
      saveState(next);
      return next;
    });
  }, []);

  const handleHabiticaSync = useCallback(async () => {
    try {
      const user = await fetchUser();
      setState(prev => {
        const next = {
          ...prev,
          player: {
            ...prev.player,
            level: user.stats.lvl,
            xp: Math.round(user.stats.exp),
            hp: Math.round(user.stats.hp),
            maxHp: user.stats.maxHealth,
          },
        };
        saveState(next);
        return next;
      });
    } catch (err) {
      console.warn("Habitica stats sync failed:", err);
    }
  }, []);

  const handleAddHabit = useCallback((h: Omit<Habit, "id" | "streak" | "createdAt">) => {
    const newH: Habit = { ...h, id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), streak: 0, createdAt: Date.now() };
    const next = { ...state, habits: [...state.habits, newH] };
    persist(next);
    showToast(`[ok] "${h.name}" added`);
  }, [state, persist, showToast]);

  const handleImportHabits = useCallback((habits: Omit<Habit, "id" | "createdAt">[]) => {
    const newHabits = habits.map((h) => ({
      ...h,
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      createdAt: Date.now(),
    }));
    const next = { ...state, habits: [...state.habits, ...newHabits] };
    persist(next);
    showToast(`[ok] imported ${newHabits.length} habits from Habitica`);
    handleHabiticaSync();
  }, [state, persist, showToast, handleHabiticaSync]);

  const handleDeleteHabit = useCallback((id: string) => {
    setModal({
      title: "delete habit?",
      body: "this cannot be undone.",
      onConfirm: () => {
        const next = {
          ...state,
          habits: state.habits.filter((h: Habit) => h.id !== id),
          routines: state.routines.map(r => ({ ...r, habitIds: r.habitIds.filter((hid: string) => hid !== id) })),
        };
        persist(next);
        setModal(null);
        showToast("[ok] habit deleted", "info");
      },
    });
  }, [state, persist, showToast]);

  const handleEditHabit = useCallback((id: string, updates: Partial<Habit>) => {
    const next = {
      ...state,
      habits: state.habits.map((h: Habit) => h.id === id ? { ...h, ...updates } : h),
    };
    persist(next);
    showToast("[ok] habit updated");
  }, [state, persist, showToast]);

  const handleReset = useCallback(() => {
    setModal({
      title: "reset all data?",
      body: "this will delete all habits, progress, and achievements.",
      onConfirm: () => {
        const next = resetState();
        setState(next);
        setModal(null);
        showToast("[ok] data reset", "info");
      },
    });
  }, [showToast]);

  const habiticaIds = new Set(state.habits.filter(h => h.habiticaId).map(h => h.habiticaId!));

  // Sync Habitica stats on app load if connected
  useEffect(() => {
    if (!isHabiticaConnected()) return;
    fetchUser().then(user => {
      setState(prev => {
        const next = {
          ...prev,
          player: {
            ...prev.player,
            level: user.stats.lvl,
            xp: Math.round(user.stats.exp),
            hp: Math.round(user.stats.hp),
            maxHp: user.stats.maxHealth,
          },
        };
        saveState(next);
        return next;
      });
    }).catch(() => {});
  }, []);

  return (
    <div className="app">
      <TopBar theme={state.theme} onThemeChange={handleThemeChange} onReset={handleReset} />
      <TabNav active={tab} onChange={setTab} />

      {tab === "habits" && (
        <HabitsPage
          habits={state.habits}
          history={state.history}
          player={state.player}
          onToggle={handleToggle}
          onEdit={handleEditHabit}
          onDelete={handleDeleteHabit}
          onAddHabit={handleAddHabit}
          onImportHabits={handleImportHabits}
          habiticaConnected={habiticaConnected}
          habiticaIds={habiticaIds}
        />
      )}
      {tab === "stats" && <StatsPage player={state.player} habits={state.habits} history={state.history} hasAI={hasAI} />}
      {tab === "profile" && (
        <ProfilePage
          theme={state.theme}
          onThemeChange={handleThemeChange}
          player={state.player}
          onReset={handleReset}
          onAIConfigChange={(c) => setHasAI(c !== null)}
          onHabiticaConnect={() => { setHabiticaConnected(true); handleHabiticaSync(); }}
          onHabiticaDisconnect={() => setHabiticaConnected(false)}
          habiticaConnected={habiticaConnected}
        />
      )}

      <Toast show={!!toast} msg={toast?.msg || ""} type={toast?.type || "info"} />
      {modal && <ConfirmModal title={modal.title} body={modal.body} onConfirm={modal.onConfirm} onCancel={() => setModal(null)} />}
    </div>
  );
}
