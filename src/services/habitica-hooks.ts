import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  loadHabiticaConfig,
  fetchTasks,
  fetchUser,
  scoreTask,
  mapHabiticaTask,
  type HabiticaTask,
} from "./habitica";

export function useHabiticaConnected() {
  const config = loadHabiticaConfig();
  return config !== null;
}

export function useHabiticaUser() {
  const config = loadHabiticaConfig();
  return useQuery({
    queryKey: ["habitica", "user"],
    queryFn: fetchUser,
    enabled: !!config,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

export function useHabiticaTasks(type?: "habits" | "dailys") {
  const config = loadHabiticaConfig();
  return useQuery({
    queryKey: ["habitica", "tasks", type],
    queryFn: () => fetchTasks(type),
    enabled: !!config,
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });
}

export function useScoreHabiticaTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, direction }: { taskId: string; direction: "up" | "down" }) =>
      scoreTask(taskId, direction),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habitica", "user"] });
    },
  });
}

export function mapTasksToHabits(tasks: HabiticaTask[], localHabitIds: Set<string>) {
  return tasks
    .filter((t) => !localHabitIds.has(t._id))
    .map((t) => mapHabiticaTask(t));
}
