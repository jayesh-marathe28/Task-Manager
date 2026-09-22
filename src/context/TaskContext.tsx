"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { initialTaskStore } from "@/data/sample-data";
import { loadTaskStore, saveTaskStore } from "@/lib/storage";
import {
  createActivity,
  enrichTask,
  getCategoryProgress,
  getDashboardMetrics,
  getMonthlyProgress,
  getTasksForDate,
  getYearlyProgress,
  sortTasks,
} from "@/lib/task-utils";
import { createId } from "@/lib/utils";
import type {
  ActivityLog,
  Category,
  EnrichedTask,
  ProgressPoint,
  Task,
  TaskFormValues,
  TaskStore,
} from "@/types/task";
import { useToast } from "@/context/ToastContext";

interface TaskContextValue {
  isReady: boolean;
  tasks: EnrichedTask[];
  categories: Category[];
  activities: ActivityLog[];
  metrics: ReturnType<typeof getDashboardMetrics>;
  todayTasks: EnrichedTask[];
  upcomingTasks: EnrichedTask[];
  overdueTasks: EnrichedTask[];
  categoryProgress: ProgressPoint[];
  monthlyProgress: ProgressPoint[];
  yearlyProgress: ProgressPoint[];
  createTask: (values: TaskFormValues) => void;
  updateTask: (taskId: string, values: TaskFormValues) => void;
  deleteTask: (taskId: string) => void;
  toggleTaskCompletion: (taskId: string) => void;
  addCategory: (name: string) => { ok: boolean; message?: string };
  updateCategory: (
    categoryId: string,
    name: string,
  ) => { ok: boolean; message?: string };
  deleteCategory: (categoryId: string) => { ok: boolean; message?: string };
  getTasksByDate: (value: Date) => EnrichedTask[];
  hasCategoryName: (name: string, excludeId?: string) => boolean;
}

const TaskContext = createContext<TaskContextValue | null>(null);

function mergeStore(value: Partial<TaskStore>) {
  return {
    tasks: value.tasks ?? initialTaskStore.tasks,
    categories: value.categories ?? initialTaskStore.categories,
    activities: value.activities ?? initialTaskStore.activities,
  } satisfies TaskStore;
}

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [store, setStore] = useState<TaskStore>(initialTaskStore);
  const [isReady, setIsReady] = useState(false);
  const { notify } = useToast();

  useEffect(() => {
    const persisted = loadTaskStore();
    // The browser-only store must hydrate after the initial server render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStore(persisted ? mergeStore(persisted) : initialTaskStore);
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    saveTaskStore(store);
  }, [isReady, store]);

  const tasks = useMemo(
    () => sortTasks(store.tasks.map((task) => enrichTask(task, store.categories))),
    [store.categories, store.tasks],
  );

  const activities = useMemo(
    () =>
      [...store.activities].sort(
        (left, right) =>
          new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime(),
      ),
    [store.activities],
  );

  const metrics = useMemo(() => getDashboardMetrics(tasks), [tasks]);
  const todayTasks = useMemo(() => tasks.filter((task) => task.isDueToday), [tasks]);
  const upcomingTasks = useMemo(
    () =>
      tasks.filter(
        (task) =>
          !task.isDueToday &&
          !task.isOverdue &&
          task.resolvedStatus !== "Completed" &&
          task.daysLeft > 0 &&
          task.daysLeft <= 7,
      ),
    [tasks],
  );
  const overdueTasks = useMemo(
    () => tasks.filter((task) => task.resolvedStatus === "Overdue"),
    [tasks],
  );
  const categoryProgress = useMemo(() => getCategoryProgress(tasks), [tasks]);
  const monthlyProgress = useMemo(() => getMonthlyProgress(tasks), [tasks]);
  const yearlyProgress = useMemo(() => getYearlyProgress(tasks), [tasks]);

  const createTask = useCallback(
    (values: TaskFormValues) => {
      const now = new Date().toISOString();
      const nextTask: Task = {
        id: createId("task"),
        title: values.title.trim(),
        categoryId: values.categoryId,
        startDate: values.startDate,
        dueDate: values.dueDate,
        duration: values.duration,
        priority: values.priority,
        status: values.status,
        notes: values.notes.trim(),
        createdAt: now,
        updatedAt: now,
        completedAt: values.status === "Completed" ? now : undefined,
      };

      setStore((current) => ({
        ...current,
        tasks: [nextTask, ...current.tasks],
        activities: [
          createActivity({
            taskId: nextTask.id,
            taskTitle: nextTask.title,
            action: "created",
            description: "Created a new task.",
          }),
          ...current.activities,
        ],
      }));

      notify({
        tone: "success",
        title: "Task created",
        description: `${nextTask.title} is now part of the workspace.`,
      });
    },
    [notify],
  );

  const updateTask = useCallback(
    (taskId: string, values: TaskFormValues) => {
      let taskTitle = values.title.trim();

      setStore((current) => {
        const existingTask = current.tasks.find((task) => task.id === taskId);

        if (!existingTask) {
          return current;
        }

        const updatedAt = new Date().toISOString();
        const completedAt =
          values.status === "Completed"
            ? existingTask.completedAt ?? updatedAt
            : undefined;
        const updatedTask: Task = {
          ...existingTask,
          title: values.title.trim(),
          categoryId: values.categoryId,
          startDate: values.startDate,
          dueDate: values.dueDate,
          duration: values.duration,
          priority: values.priority,
          status: values.status,
          notes: values.notes.trim(),
          updatedAt,
          completedAt,
        };

        taskTitle = updatedTask.title;

        const nextActivities = [
          createActivity({
            taskId,
            taskTitle: updatedTask.title,
            action: "updated",
            description: "Updated task details.",
          }),
        ];

        if (existingTask.priority !== updatedTask.priority) {
          nextActivities.unshift(
            createActivity({
              taskId,
              taskTitle: updatedTask.title,
              action: "priority_changed",
              description: `Changed priority from ${existingTask.priority} to ${updatedTask.priority}.`,
            }),
          );
        }

        if (existingTask.status !== updatedTask.status) {
          nextActivities.unshift(
            createActivity({
              taskId,
              taskTitle: updatedTask.title,
              action:
                updatedTask.status === "Completed"
                  ? "completed"
                  : "status_changed",
              description:
                updatedTask.status === "Completed"
                  ? "Marked task as completed."
                  : `Changed status from ${existingTask.status} to ${updatedTask.status}.`,
            }),
          );
        }

        if (existingTask.dueDate !== updatedTask.dueDate) {
          nextActivities.unshift(
            createActivity({
              taskId,
              taskTitle: updatedTask.title,
              action: "due_date_changed",
              description: `Moved due date from ${existingTask.dueDate} to ${updatedTask.dueDate}.`,
            }),
          );
        }

        if (existingTask.categoryId !== updatedTask.categoryId) {
          const oldCategory =
            current.categories.find((item) => item.id === existingTask.categoryId)
              ?.name ?? "Other";
          const newCategory =
            current.categories.find((item) => item.id === updatedTask.categoryId)
              ?.name ?? "Other";

          nextActivities.unshift(
            createActivity({
              taskId,
              taskTitle: updatedTask.title,
              action: "category_changed",
              description: `Moved task from ${oldCategory} to ${newCategory}.`,
            }),
          );
        }

        return {
          ...current,
          tasks: current.tasks.map((task) => (task.id === taskId ? updatedTask : task)),
          activities: [...nextActivities, ...current.activities],
        };
      });

      notify({
        tone: "success",
        title: "Task updated",
        description: `${taskTitle} has been refreshed.`,
      });
    },
    [notify],
  );

  const deleteTask = useCallback(
    (taskId: string) => {
      let deletedTitle = "";

      setStore((current) => {
        const existingTask = current.tasks.find((task) => task.id === taskId);

        if (!existingTask) {
          return current;
        }

        deletedTitle = existingTask.title;

        return {
          ...current,
          tasks: current.tasks.filter((task) => task.id !== taskId),
          activities: [
            createActivity({
              taskId,
              taskTitle: existingTask.title,
              action: "deleted",
              description: "Deleted task from the workspace.",
            }),
            ...current.activities,
          ],
        };
      });

      notify({
        tone: "warning",
        title: "Task deleted",
        description: deletedTitle || "The task has been removed.",
      });
    },
    [notify],
  );

  const toggleTaskCompletion = useCallback(
    (taskId: string) => {
      let message = "Task updated";
      let description = "Task status changed.";

      setStore((current) => {
        const existingTask = current.tasks.find((task) => task.id === taskId);

        if (!existingTask) {
          return current;
        }

        const completed = existingTask.status !== "Completed";
        const updatedAt = new Date().toISOString();
        const updatedTask: Task = {
          ...existingTask,
          status: completed ? "Completed" : "Pending",
          completedAt: completed ? updatedAt : undefined,
          updatedAt,
        };

        message = completed ? "Task completed" : "Task reopened";
        description = updatedTask.title;

        return {
          ...current,
          tasks: current.tasks.map((task) => (task.id === taskId ? updatedTask : task)),
          activities: [
            createActivity({
              taskId,
              taskTitle: updatedTask.title,
              action: completed ? "completed" : "status_changed",
              description: completed
                ? "Marked task as completed."
                : "Moved task back to Pending.",
            }),
            ...current.activities,
          ],
        };
      });

      notify({
        tone: "success",
        title: message,
        description,
      });
    },
    [notify],
  );

  const hasCategoryName = useCallback(
    (name: string, excludeId?: string) =>
      store.categories.some(
        (category) =>
          category.id !== excludeId &&
          category.name.trim().toLowerCase() === name.trim().toLowerCase(),
      ),
    [store.categories],
  );

  const addCategory = useCallback(
    (name: string) => {
      if (!name.trim()) {
        return { ok: false, message: "Category name is required." };
      }

      if (hasCategoryName(name)) {
        return { ok: false, message: "That category already exists." };
      }

      const now = new Date().toISOString();
      const colors = [
        "bg-indigo-50 text-indigo-900 ring-indigo-300",
        "bg-teal-50 text-teal-900 ring-teal-300",
        "bg-fuchsia-50 text-fuchsia-900 ring-fuchsia-300",
        "bg-orange-50 text-orange-900 ring-orange-300",
      ];

      const nextCategory: Category = {
        id: createId("category"),
        name: name.trim(),
        color: colors[store.categories.length % colors.length],
        isDefault: false,
        createdAt: now,
        updatedAt: now,
      };

      setStore((current) => ({
        ...current,
        categories: [...current.categories, nextCategory],
      }));

      notify({
        tone: "success",
        title: "Category added",
        description: `${nextCategory.name} is ready to use.`,
      });

      return { ok: true };
    },
    [hasCategoryName, notify, store.categories.length],
  );

  const updateCategory = useCallback(
    (categoryId: string, name: string) => {
      if (!name.trim()) {
        return { ok: false, message: "Category name is required." };
      }

      if (hasCategoryName(name, categoryId)) {
        return { ok: false, message: "That category name is already in use." };
      }

      let categoryName = name.trim();

      setStore((current) => {
        const existingCategory = current.categories.find(
          (category) => category.id === categoryId,
        );

        if (!existingCategory) {
          return current;
        }

        categoryName = existingCategory.name;

        return {
          ...current,
          categories: current.categories.map((category) =>
            category.id === categoryId
              ? { ...category, name: name.trim(), updatedAt: new Date().toISOString() }
              : category,
          ),
        };
      });

      notify({
        tone: "success",
        title: "Category updated",
        description: `${name.trim()} is saved.`,
      });

      return { ok: true, message: categoryName };
    },
    [hasCategoryName, notify],
  );

  const deleteCategory = useCallback(
    (categoryId: string) => {
      const category = store.categories.find((item) => item.id === categoryId);

      if (!category) {
        return { ok: false, message: "Category not found." };
      }

      if (category.isDefault) {
        return {
          ok: false,
          message: "Default categories stay available for the whole workspace.",
        };
      }

      setStore((current) => ({
        ...current,
        categories: current.categories.filter((item) => item.id !== categoryId),
        tasks: current.tasks.map((task) =>
          task.categoryId === categoryId
            ? { ...task, categoryId: "category-other", updatedAt: new Date().toISOString() }
            : task,
        ),
      }));

      notify({
        tone: "warning",
        title: "Category deleted",
        description: `${category.name} was removed and related tasks were moved to Other.`,
      });

      return { ok: true };
    },
    [notify, store.categories],
  );

  const getTasksByDate = useCallback(
    (value: Date) => getTasksForDate(tasks, value),
    [tasks],
  );

  const value = useMemo(
    () => ({
      isReady,
      tasks,
      categories: store.categories,
      activities,
      metrics,
      todayTasks,
      upcomingTasks,
      overdueTasks,
      categoryProgress,
      monthlyProgress,
      yearlyProgress,
      createTask,
      updateTask,
      deleteTask,
      toggleTaskCompletion,
      addCategory,
      updateCategory,
      deleteCategory,
      getTasksByDate,
      hasCategoryName,
    }),
    [
      activities,
      addCategory,
      categoryProgress,
      createTask,
      deleteCategory,
      getTasksByDate,
      hasCategoryName,
      isReady,
      metrics,
      monthlyProgress,
      overdueTasks,
      store.categories,
      tasks,
      todayTasks,
      toggleTaskCompletion,
      upcomingTasks,
      updateCategory,
      updateTask,
      yearlyProgress,
      deleteTask,
    ],
  );

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

export function useTasks() {
  const context = useContext(TaskContext);

  if (!context) {
    throw new Error("useTasks must be used within TaskProvider");
  }

  return context;
}
