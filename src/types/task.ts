export const TASK_STATUSES = [
  "Pending",
  "In Progress",
  "Completed",
  "Overdue",
] as const;

export const EDITABLE_TASK_STATUSES = [
  "Pending",
  "In Progress",
  "Completed",
] as const;

export const TASK_PRIORITIES = [
  "Low",
  "Medium",
  "High",
  "Urgent",
] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];
export type EditableTaskStatus = (typeof EDITABLE_TASK_STATUSES)[number];
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export type CalendarView = "day" | "month" | "year";

export interface Category {
  id: string;
  name: string;
  color: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  categoryId: string;
  startDate: string;
  dueDate: string;
  duration: number;
  priority: TaskPriority;
  status: TaskStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface ActivityLog {
  id: string;
  taskId?: string;
  taskTitle: string;
  action:
    | "created"
    | "updated"
    | "deleted"
    | "completed"
    | "status_changed"
    | "priority_changed"
    | "due_date_changed"
    | "category_changed";
  description: string;
  timestamp: string;
}

export interface EnrichedTask extends Task {
  resolvedStatus: TaskStatus;
  category: Category;
  daysLeft: number;
  isDueToday: boolean;
  isDueTomorrow: boolean;
  isOverdue: boolean;
}

export interface TaskFormValues {
  title: string;
  categoryId: string;
  startDate: string;
  dueDate: string;
  duration: number;
  priority: TaskPriority;
  status: EditableTaskStatus;
  notes: string;
}

export interface TaskFilters {
  search: string;
  categoryId: string;
  priority: TaskPriority | "";
  status: TaskStatus | "";
  date: string;
  month: string;
  year: string;
}

export interface DashboardMetrics {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  overdue: number;
  today: number;
  upcoming: number;
  completionRate: number;
}

export interface ProgressPoint {
  label: string;
  total: number;
  completed: number;
  percentage: number;
}

export interface TaskStore {
  tasks: Task[];
  categories: Category[];
  activities: ActivityLog[];
}
