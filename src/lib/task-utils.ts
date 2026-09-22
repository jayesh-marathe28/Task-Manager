"use client";

import {
  addMonths,
  differenceInCalendarDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isToday,
  isTomorrow,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import type {
  ActivityLog,
  Category,
  DashboardMetrics,
  EnrichedTask,
  ProgressPoint,
  Task,
  TaskFilters,
  TaskStatus,
} from "@/types/task";

const FALLBACK_CATEGORY: Category = {
  id: "category-other",
  name: "Other",
  color: "bg-slate-100 text-slate-700 ring-slate-300",
  isDefault: true,
  createdAt: "",
  updatedAt: "",
};

export function parseDate(value: string) {
  return startOfDay(parseISO(value));
}

export function getResolvedStatus(task: Task) {
  if (task.status === "Completed") {
    return "Completed" satisfies TaskStatus;
  }

  if (parseDate(task.dueDate) < startOfDay(new Date())) {
    return "Overdue" satisfies TaskStatus;
  }

  return task.status === "Overdue" ? "Pending" : task.status;
}

export function enrichTask(task: Task, categories: Category[]): EnrichedTask {
  const category =
    categories.find((item) => item.id === task.categoryId) ?? FALLBACK_CATEGORY;
  const dueDate = parseDate(task.dueDate);
  const resolvedStatus = getResolvedStatus(task);
  const daysLeft = differenceInCalendarDays(dueDate, startOfDay(new Date()));

  return {
    ...task,
    category,
    resolvedStatus,
    daysLeft,
    isDueToday: resolvedStatus !== "Completed" && isToday(dueDate),
    isDueTomorrow: resolvedStatus !== "Completed" && isTomorrow(dueDate),
    isOverdue: resolvedStatus === "Overdue",
  };
}

export function sortTasks(tasks: EnrichedTask[]) {
  return [...tasks].sort((left, right) => {
    const leftDate = parseDate(left.dueDate).getTime();
    const rightDate = parseDate(right.dueDate).getTime();

    if (left.resolvedStatus === "Overdue" && right.resolvedStatus !== "Overdue") {
      return -1;
    }

    if (left.resolvedStatus !== "Overdue" && right.resolvedStatus === "Overdue") {
      return 1;
    }

    return leftDate - rightDate;
  });
}

export function getDashboardMetrics(tasks: EnrichedTask[]): DashboardMetrics {
  const total = tasks.length;
  const pending = tasks.filter((task) => task.resolvedStatus === "Pending").length;
  const inProgress = tasks.filter(
    (task) => task.resolvedStatus === "In Progress",
  ).length;
  const completed = tasks.filter(
    (task) => task.resolvedStatus === "Completed",
  ).length;
  const overdue = tasks.filter((task) => task.resolvedStatus === "Overdue").length;
  const today = tasks.filter((task) => task.isDueToday).length;
  const upcoming = tasks.filter(
    (task) =>
      !task.isDueToday &&
      !task.isOverdue &&
      task.resolvedStatus !== "Completed" &&
      task.daysLeft > 0 &&
      task.daysLeft <= 7,
  ).length;

  return {
    total,
    pending,
    inProgress,
    completed,
    overdue,
    today,
    upcoming,
    completionRate: total === 0 ? 0 : (completed / total) * 100,
  };
}

export function getCategoryProgress(tasks: EnrichedTask[]): ProgressPoint[] {
  const groups = new Map<
    string,
    { label: string; total: number; completed: number }
  >();

  tasks.forEach((task) => {
    const current = groups.get(task.category.id) ?? {
      label: task.category.name,
      total: 0,
      completed: 0,
    };

    current.total += 1;
    if (task.resolvedStatus === "Completed") {
      current.completed += 1;
    }

    groups.set(task.category.id, current);
  });

  return [...groups.values()]
    .map((item) => ({
      ...item,
      percentage: item.total === 0 ? 0 : (item.completed / item.total) * 100,
    }))
    .sort((left, right) => right.total - left.total);
}

export function getMonthlyProgress(tasks: EnrichedTask[]) {
  const months = Array.from({ length: 6 }, (_, index) =>
    subMonths(startOfMonth(new Date()), 5 - index),
  );

  return months.map((month) => {
    const nextMonth = addMonths(month, 1);
    const monthTasks = tasks.filter((task) => {
      const createdAt = parseISO(task.createdAt);
      return createdAt >= month && createdAt < nextMonth;
    });
    const completed = monthTasks.filter(
      (task) => task.resolvedStatus === "Completed",
    ).length;

    return {
      label: format(month, "MMM yyyy"),
      total: monthTasks.length,
      completed,
      percentage:
        monthTasks.length === 0 ? 0 : (completed / monthTasks.length) * 100,
    };
  });
}

export function getYearlyProgress(tasks: EnrichedTask[]) {
  const currentYear = new Date().getFullYear();
  const years = [currentYear - 2, currentYear - 1, currentYear];

  return years.map((year) => {
    const yearTasks = tasks.filter(
      (task) => parseISO(task.createdAt).getFullYear() === year,
    );
    const completed = yearTasks.filter(
      (task) => task.resolvedStatus === "Completed",
    ).length;

    return {
      label: String(year),
      total: yearTasks.length,
      completed,
      percentage: yearTasks.length === 0 ? 0 : (completed / yearTasks.length) * 100,
    };
  });
}

export function getTasksForDate(tasks: EnrichedTask[], value: Date) {
  return tasks.filter((task) => isSameDay(parseDate(task.dueDate), value));
}

export function getMonthGrid(value: Date) {
  const monthStart = startOfMonth(value);
  const monthEnd = endOfMonth(value);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
}

export function getTaskStatusTone(status: TaskStatus) {
  switch (status) {
    case "Completed":
      return "bg-emerald-50 text-emerald-900 ring-emerald-300 hover:bg-emerald-100";
    case "In Progress":
      return "bg-blue-50 text-blue-900 ring-blue-300 hover:bg-blue-100";
    case "Overdue":
      return "bg-red-50 text-red-900 ring-red-300 hover:bg-red-100";
    default:
      return "bg-slate-100 text-slate-800 ring-slate-300 hover:bg-slate-200";
  }
}

export function getPriorityTone(priority: Task["priority"]) {
  switch (priority) {
    case "Urgent":
      return "bg-red-50 text-red-900 ring-red-300 hover:bg-red-100";
    case "High":
      return "bg-orange-50 text-orange-900 ring-orange-300 hover:bg-orange-100";
    case "Medium":
      return "bg-blue-50 text-blue-900 ring-blue-300 hover:bg-blue-100";
    default:
      return "bg-emerald-50 text-emerald-900 ring-emerald-300 hover:bg-emerald-100";
  }
}

export function getCategoryTone(category: Pick<Category, "name">) {
  switch (category.name.trim().toLowerCase()) {
    case "development":
      return "bg-blue-50 text-blue-900 ring-blue-300 hover:bg-blue-100";
    case "testing":
      return "bg-violet-50 text-violet-900 ring-violet-300 hover:bg-violet-100";
    case "meeting":
      return "bg-amber-50 text-amber-900 ring-amber-300 hover:bg-amber-100";
    case "documentation":
      return "bg-emerald-50 text-emerald-900 ring-emerald-300 hover:bg-emerald-100";
    case "personal":
      return "bg-pink-50 text-pink-900 ring-pink-300 hover:bg-pink-100";
    case "maintenance":
      return "bg-cyan-50 text-cyan-900 ring-cyan-300 hover:bg-cyan-100";
    default:
      return "bg-slate-100 text-slate-800 ring-slate-300 hover:bg-slate-200";
  }
}

export function getDueLabel(task: EnrichedTask) {
  if (task.resolvedStatus === "Completed") {
    return "Completed";
  }

  if (task.isDueToday) {
    return "Due today";
  }

  if (task.isDueTomorrow) {
    return "Due tomorrow";
  }

  if (task.isOverdue) {
    const days = Math.abs(task.daysLeft);
    return days === 1 ? "1 day overdue" : `${days} days overdue`;
  }

  if (task.daysLeft === 1) {
    return "1 day left";
  }

  return `${task.daysLeft} days left`;
}

export function filterTasks(tasks: EnrichedTask[], filters: TaskFilters) {
  return tasks.filter((task) => {
    const searchMatch =
      filters.search.trim().length === 0 ||
      task.title.toLowerCase().includes(filters.search.trim().toLowerCase());
    const categoryMatch =
      !filters.categoryId || task.categoryId === filters.categoryId;
    const priorityMatch = !filters.priority || task.priority === filters.priority;
    const statusMatch =
      !filters.status || task.resolvedStatus === filters.status;
    const dateMatch =
      !filters.date || isSameDay(parseDate(task.dueDate), parseDate(filters.date));
    const monthMatch =
      !filters.month ||
      parseDate(task.dueDate).getMonth() + 1 === Number(filters.month);
    const yearMatch =
      !filters.year ||
      parseDate(task.dueDate).getFullYear() === Number(filters.year);

    return (
      searchMatch &&
      categoryMatch &&
      priorityMatch &&
      statusMatch &&
      dateMatch &&
      monthMatch &&
      yearMatch
    );
  });
}

export function formatActivityTime(timestamp: string) {
  return format(parseISO(timestamp), "MMM d, yyyy 'at' h:mm a");
}

export function createActivity(
  activity: Omit<ActivityLog, "id" | "timestamp">,
): ActivityLog {
  return {
    ...activity,
    id: `activity-${Math.random().toString(36).slice(2, 10)}`,
    timestamp: new Date().toISOString(),
  };
}
