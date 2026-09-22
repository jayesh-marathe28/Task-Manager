import type { TaskStore } from "@/types/task";

export const TASK_STORE_KEY = "taskflow-store-v1";

export function loadTaskStore() {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(TASK_STORE_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as TaskStore;
  } catch {
    return null;
  }
}

export function saveTaskStore(value: TaskStore) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(TASK_STORE_KEY, JSON.stringify(value));
}
