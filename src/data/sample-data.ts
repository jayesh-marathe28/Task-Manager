import { addDays, formatISO, subDays } from "date-fns";
import type { ActivityLog, Category, Task, TaskStore } from "@/types/task";

function toIsoDate(value: Date) {
  return formatISO(value, { representation: "date" });
}

function timestamp(value: Date) {
  return value.toISOString();
}

function createTask(
  task: Omit<Task, "createdAt" | "updatedAt"> & {
    createdOffset: number;
    updatedOffset: number;
  },
) {
  const now = new Date();

  return {
    id: task.id,
    title: task.title,
    categoryId: task.categoryId,
    startDate: task.startDate,
    dueDate: task.dueDate,
    duration: task.duration,
    priority: task.priority,
    status: task.status,
    notes: task.notes,
    completedAt: task.completedAt,
    createdAt: timestamp(subDays(now, task.createdOffset)),
    updatedAt: timestamp(subDays(now, task.updatedOffset)),
  } satisfies Task;
}

const now = new Date();

export const defaultCategories: Category[] = [
  {
    id: "category-development",
    name: "Development",
    color: "bg-blue-50 text-blue-900 ring-blue-300",
    isDefault: true,
    createdAt: timestamp(subDays(now, 90)),
    updatedAt: timestamp(subDays(now, 90)),
  },
  {
    id: "category-testing",
    name: "Testing",
    color: "bg-violet-50 text-violet-900 ring-violet-300",
    isDefault: true,
    createdAt: timestamp(subDays(now, 90)),
    updatedAt: timestamp(subDays(now, 90)),
  },
  {
    id: "category-meeting",
    name: "Meeting",
    color: "bg-amber-50 text-amber-900 ring-amber-300",
    isDefault: true,
    createdAt: timestamp(subDays(now, 90)),
    updatedAt: timestamp(subDays(now, 90)),
  },
  {
    id: "category-documentation",
    name: "Documentation",
    color: "bg-emerald-50 text-emerald-900 ring-emerald-300",
    isDefault: true,
    createdAt: timestamp(subDays(now, 90)),
    updatedAt: timestamp(subDays(now, 90)),
  },
  {
    id: "category-personal",
    name: "Personal",
    color: "bg-pink-50 text-pink-900 ring-pink-300",
    isDefault: true,
    createdAt: timestamp(subDays(now, 90)),
    updatedAt: timestamp(subDays(now, 90)),
  },
  {
    id: "category-maintenance",
    name: "Maintenance",
    color: "bg-cyan-50 text-cyan-900 ring-cyan-300",
    isDefault: true,
    createdAt: timestamp(subDays(now, 90)),
    updatedAt: timestamp(subDays(now, 90)),
  },
  {
    id: "category-other",
    name: "Other",
    color: "bg-slate-100 text-slate-800 ring-slate-300",
    isDefault: true,
    createdAt: timestamp(subDays(now, 90)),
    updatedAt: timestamp(subDays(now, 90)),
  },
];

export const sampleTasks: Task[] = [
  createTask({
    id: "task-1",
    title: "Finalize Q4 planning dashboard",
    categoryId: "category-development",
    startDate: toIsoDate(subDays(now, 4)),
    dueDate: toIsoDate(addDays(now, 2)),
    duration: 6,
    priority: "High",
    status: "In Progress",
    notes: "Align delivery milestones with design and analytics teams.",
    createdOffset: 7,
    updatedOffset: 1,
  }),
  createTask({
    id: "task-2",
    title: "Regression test the release candidate",
    categoryId: "category-testing",
    startDate: toIsoDate(subDays(now, 2)),
    dueDate: toIsoDate(addDays(now, 1)),
    duration: 3,
    priority: "Urgent",
    status: "Pending",
    notes: "Focus on login, exports, and mobile navigation scenarios.",
    createdOffset: 5,
    updatedOffset: 2,
  }),
  createTask({
    id: "task-3",
    title: "Weekly leadership sync",
    categoryId: "category-meeting",
    startDate: toIsoDate(now),
    dueDate: toIsoDate(now),
    duration: 1,
    priority: "Medium",
    status: "Pending",
    notes: "Prepare blockers, wins, and staffing updates before the meeting.",
    createdOffset: 3,
    updatedOffset: 0,
  }),
  createTask({
    id: "task-4",
    title: "Ship onboarding documentation refresh",
    categoryId: "category-documentation",
    startDate: toIsoDate(subDays(now, 6)),
    dueDate: toIsoDate(subDays(now, 1)),
    duration: 5,
    priority: "Medium",
    status: "Pending",
    notes: "Review screenshots and clean up environment setup guidance.",
    createdOffset: 9,
    updatedOffset: 1,
  }),
  createTask({
    id: "task-5",
    title: "Submit expense report",
    categoryId: "category-personal",
    startDate: toIsoDate(subDays(now, 1)),
    dueDate: toIsoDate(addDays(now, 4)),
    duration: 2,
    priority: "Low",
    status: "Pending",
    notes: "Attach hotel invoice and rideshare receipts.",
    createdOffset: 2,
    updatedOffset: 1,
  }),
  createTask({
    id: "task-6",
    title: "Refresh staging environment dependencies",
    categoryId: "category-maintenance",
    startDate: toIsoDate(subDays(now, 8)),
    dueDate: toIsoDate(subDays(now, 3)),
    duration: 4,
    priority: "High",
    status: "Completed",
    completedAt: timestamp(subDays(now, 2)),
    notes: "Verify worker queue and cron jobs after the upgrade.",
    createdOffset: 10,
    updatedOffset: 2,
  }),
  createTask({
    id: "task-7",
    title: "Create onboarding checklist template",
    categoryId: "category-other",
    startDate: toIsoDate(addDays(now, 1)),
    dueDate: toIsoDate(addDays(now, 8)),
    duration: 5,
    priority: "Medium",
    status: "Pending",
    notes: "Create a reusable starter checklist for new team members.",
    createdOffset: 1,
    updatedOffset: 0,
  }),
  createTask({
    id: "task-8",
    title: "Polish client demo walkthrough",
    categoryId: "category-development",
    startDate: toIsoDate(subDays(now, 5)),
    dueDate: toIsoDate(addDays(now, 6)),
    duration: 7,
    priority: "High",
    status: "In Progress",
    notes: "Update metrics slide and rehearse the handoff segment.",
    createdOffset: 8,
    updatedOffset: 1,
  }),
];

export const sampleActivities: ActivityLog[] = [
  {
    id: "activity-1",
    taskId: "task-1",
    taskTitle: "Finalize Q4 planning dashboard",
    action: "status_changed",
    description: "Moved task to In Progress.",
    timestamp: timestamp(subDays(now, 1)),
  },
  {
    id: "activity-2",
    taskId: "task-2",
    taskTitle: "Regression test the release candidate",
    action: "priority_changed",
    description: "Raised priority to Urgent.",
    timestamp: timestamp(subDays(now, 2)),
  },
  {
    id: "activity-3",
    taskId: "task-4",
    taskTitle: "Ship onboarding documentation refresh",
    action: "due_date_changed",
    description: "Due date moved to keep launch notes aligned.",
    timestamp: timestamp(subDays(now, 1)),
  },
  {
    id: "activity-4",
    taskId: "task-6",
    taskTitle: "Refresh staging environment dependencies",
    action: "completed",
    description: "Marked task as completed.",
    timestamp: timestamp(subDays(now, 2)),
  },
  {
    id: "activity-5",
    taskId: "task-3",
    taskTitle: "Weekly leadership sync",
    action: "created",
    description: "Created task and scheduled it for today.",
    timestamp: timestamp(subDays(now, 3)),
  },
];

export const initialTaskStore: TaskStore = {
  tasks: sampleTasks,
  categories: defaultCategories,
  activities: sampleActivities,
};
