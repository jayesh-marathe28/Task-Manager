"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { addDays, addMonths, format, isSameMonth, startOfMonth, startOfYear, addYears, eachMonthOfInterval, endOfYear } from "date-fns";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  Clock3,
  FolderKanban,
  ListChecks,
  Pencil,
  Plus,
  Target,
  Trash2,
} from "lucide-react";
import { useTasks } from "@/context/TaskContext";
import { CategoryFormDialog } from "@/components/categories/CategoryFormDialog";
import { TaskFiltersPanel } from "@/components/tasks/TaskFilters";
import { TaskFormDialog } from "@/components/tasks/TaskFormDialog";
import { TaskTable } from "@/components/tasks/TaskTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import { SectionIntro } from "@/components/ui/SectionIntro";
import { StatsCard } from "@/components/ui/StatsCard";
import {
  filterTasks,
  formatActivityTime,
  getCategoryTone,
  getMonthGrid,
  getTaskStatusTone,
} from "@/lib/task-utils";
import type { CalendarView, Category, EnrichedTask, TaskFilters } from "@/types/task";

function Ready({ children }: { children: React.ReactNode }) {
  const { isReady } = useTasks();
  return isReady ? <>{children}</> : <LoadingState />;
}

function TaskListCard({
  title,
  description,
  tasks,
  action,
}: {
  title: string;
  description: string;
  tasks: EnrichedTask[];
  action?: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader title={title} description={description} action={action} />
      <TaskTable tasks={tasks} />
    </Card>
  );
}

export function DashboardPage() {
  const router = useRouter();
  const { metrics, todayTasks, upcomingTasks, overdueTasks, categoryProgress } =
    useTasks();
  return (
    <Ready>
      <div className="space-y-8">
        <SectionIntro
          eyebrow="Workspace overview"
          title="Good morning, let’s make progress."
          description="A focused view of what needs attention today and how your work is tracking."
          action={<Button onClick={() => router.push("/tasks")}><Plus className="size-4" />New task</Button>}
        />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatsCard label="Total tasks" value={metrics.total} detail={`${metrics.pending} pending`} icon={<ListChecks className="size-5" />} onClick={() => router.push("/tasks")} />
          <StatsCard label="Due today" value={metrics.today} detail={`${metrics.upcoming} coming this week`} icon={<CalendarDays className="size-5" />} onClick={() => router.push("/schedule")} />
          <StatsCard label="Completion rate" value={`${Math.round(metrics.completionRate)}%`} detail={`${metrics.completed} completed`} icon={<Target className="size-5" />} onClick={() => router.push("/progress")} />
          <StatsCard label="Overdue" value={metrics.overdue} detail="Needs your attention" icon={<CircleAlert className="size-5" />} onClick={() => router.push("/schedule")} />
        </div>
        <div className="grid gap-6 xl:grid-cols-[1.25fr_1fr]">
          <TaskListCard title="Today’s focus" description="Tasks scheduled for today." tasks={todayTasks} />
          <TaskListCard title="Upcoming" description="The next seven days." tasks={upcomingTasks} />
        </div>
        <div className="grid gap-6 xl:grid-cols-[1fr_1.25fr]">
          <TaskListCard title="Overdue" description="Bring these tasks back on track." tasks={overdueTasks} />
          <ProgressCard title="Progress by category" points={categoryProgress} />
        </div>
      </div>
    </Ready>
  );
}

export function TasksPage() {
  const { tasks, categories, deleteTask, toggleTaskCompletion } = useTasks();
  const [filters, setFilters] = useState<TaskFilters>({ search: "", categoryId: "", priority: "", status: "", date: "", month: "", year: "" });
  const [editing, setEditing] = useState<EnrichedTask | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<EnrichedTask | null>(null);
  const filtered = useMemo(() => filterTasks(tasks, filters), [filters, tasks]);
  return (
    <Ready>
      <div className="space-y-8">
        <SectionIntro eyebrow="Task register" title="All tasks" description="Create, filter, update, and complete work from one place." action={<Button onClick={() => setCreating(true)}><Plus className="size-4" />Create task</Button>} />
        <TaskFiltersPanel filters={filters} onChange={setFilters} onReset={() => setFilters({ search: "", categoryId: "", priority: "", status: "", date: "", month: "", year: "" })} categories={categories} count={filtered.length} />
        <Card><TaskTable tasks={filtered} onEdit={setEditing} onDelete={setDeleting} onToggleComplete={(task) => toggleTaskCompletion(task.id)} /></Card>
        <TaskFormDialog open={editing !== null} onClose={() => setEditing(null)} task={editing} />
        <TaskCreateDialog open={creating} onClose={() => setCreating(false)} />
        <ConfirmDialog open={Boolean(deleting)} onClose={() => setDeleting(null)} title="Delete task?" description={`This will permanently remove ${deleting?.title ?? "this task"}.`} onConfirm={() => { if (deleting) deleteTask(deleting.id); setDeleting(null); }} confirmLabel="Delete task" />
      </div>
    </Ready>
  );
}

function TaskCreateDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  return <TaskFormDialog open={open} onClose={onClose} />;
}

export function CalendarPage() {
  const { getTasksByDate, tasks } = useTasks();
  const [month, setMonth] = useState(startOfMonth(new Date()));
  const [selected, setSelected] = useState(new Date());
  const [view, setView] = useState<CalendarView>("month");
  const days = getMonthGrid(month);
  const selectedTasks = getTasksByDate(selected);
  const yearMonths = eachMonthOfInterval({
    start: startOfYear(month),
    end: endOfYear(month),
  });
  const shift = (amount: number) => {
    if (view === "day") {
      setSelected((current) => addDays(current, amount));
      return;
    }

    setMonth((current) =>
      view === "year" ? addYears(current, amount) : addMonths(current, amount),
    );
  };
  return (
    <Ready>
      <div className="space-y-8">
        <SectionIntro eyebrow="Planning calendar" title="Calendar" description="See deadlines at a glance and select any day for its task list." />
        <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
          <Card>
            <CardHeader title={view === "day" ? format(selected, "EEEE, MMMM d, yyyy") : format(month, view === "year" ? "yyyy" : "MMMM yyyy")} action={<div className="flex flex-wrap justify-end gap-2"><div className="flex rounded-xl border border-white/10 p-1">{(["day", "month", "year"] as CalendarView[]).map((option) => <button key={option} type="button" onClick={() => setView(option)} className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize ${view === option ? "bg-sky-400 text-slate-950" : "text-slate-400 hover:text-white"}`}>{option}</button>)}</div><Button variant="ghost" onClick={() => shift(-1)}><ArrowLeft className="size-4" /></Button><Button variant="ghost" onClick={() => shift(1)}><ArrowRight className="size-4" /></Button></div>} />
            {view === "month" ? <><div className="grid grid-cols-7 gap-2 text-center text-xs uppercase tracking-wider text-slate-500">{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => <span key={day} className="py-2">{day}</span>)}</div><div className="grid grid-cols-7 gap-2">{days.map((day) => { const dayTasks = getTasksByDate(day); return <button key={day.toISOString()} type="button" onClick={() => { setSelected(day); if (!isSameMonth(day, month)) setMonth(startOfMonth(day)); }} className={`min-h-20 rounded-2xl border p-2 text-left transition ${isSameMonth(day, month) ? "border-white/10 bg-white/5" : "border-transparent bg-slate-950/20 text-slate-600"} ${selected.toDateString() === day.toDateString() ? "ring-2 ring-sky-400/60" : ""}`}><span className="text-sm font-medium">{format(day, "d")}</span><span className="mt-2 block space-y-1">{dayTasks.slice(0, 2).map((task) => <span key={task.id} className={`block truncate rounded-lg px-1.5 py-1 text-[10px] ${getTaskStatusTone(task.resolvedStatus)}`}>{task.title}</span>)}</span></button>; })}</div></> : view === "day" ? <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><TaskTable tasks={selectedTasks} emptyTitle="No tasks for this day" emptyDescription="Select another day or create a task for this date." /></div> : <div className="grid gap-3 sm:grid-cols-3">{yearMonths.map((item) => { const count = tasks.filter((task) => task.dueDate.startsWith(format(item, "yyyy-MM"))).length; return <button key={item.toISOString()} type="button" onClick={() => { setMonth(item); setSelected(item); setView("month"); }} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition hover:border-sky-400/40 hover:bg-white/10"><p className="font-medium text-white">{format(item, "MMMM")}</p><p className="mt-2 text-sm text-slate-400">{count} scheduled task{count === 1 ? "" : "s"}</p></button>; })}</div>}
          </Card>
          <Card><CardHeader title={format(selected, "EEEE, MMM d")} description={`${selectedTasks.length} task${selectedTasks.length === 1 ? "" : "s"} scheduled`} />{selectedTasks.length ? <TaskTable tasks={selectedTasks} /> : <EmptyState title="Nothing scheduled" description="Enjoy the space or add a task for this day." />}</Card>
        </div>
      </div>
    </Ready>
  );
}

export function SchedulePage() {
  const { todayTasks, upcomingTasks, overdueTasks } = useTasks();
  return <Ready><div className="space-y-8"><SectionIntro eyebrow="Time horizon" title="Schedule" description="Prioritize overdue work, today’s commitments, and what is next." /><div className="grid gap-6 xl:grid-cols-3"><TaskListCard title="Overdue" description="Resolve first." tasks={overdueTasks} /><TaskListCard title="Today" description="Your immediate focus." tasks={todayTasks} /><TaskListCard title="Next 7 days" description="Prepare ahead." tasks={upcomingTasks} /></div></div></Ready>;
}

export function CategoriesPage() {
  const { categories, categoryProgress, addCategory, updateCategory, deleteCategory } = useTasks();
  const [dialog, setDialog] = useState<"new" | Category | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);
  const submitCategory = (name: string) =>
    dialog === "new"
      ? addCategory(name)
      : dialog
        ? updateCategory(dialog.id, name)
        : { ok: false, message: "Choose a category." };
  return <Ready><div className="space-y-8"><SectionIntro eyebrow="Organization" title="Categories" description="Keep work grouped by area so your dashboard and progress stay meaningful." action={<Button onClick={() => setDialog("new")}><Plus className="size-4" />Add category</Button>} /><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{categories.map((category) => { const progress = categoryProgress.find((item) => item.label === category.name); return <Card key={category.id}><div className="flex items-start justify-between gap-3"><div><Badge className={getCategoryTone(category)}>{category.name}</Badge><p className="mt-4 text-2xl font-semibold text-white">{progress?.total ?? 0}</p><p className="text-sm text-slate-400">tasks · {Math.round(progress?.percentage ?? 0)}% complete</p></div><FolderKanban className="size-5 text-slate-500" /></div><div className="mt-5 flex gap-2"><Button variant="ghost" onClick={() => setDialog(category)}><Pencil className="size-4" />Edit</Button>{!category.isDefault && <Button variant="ghost" onClick={() => setDeleting(category)}><Trash2 className="size-4" />Delete</Button>}</div></Card>; })}</div><CategoryFormDialog open={dialog !== null} category={dialog === "new" ? null : dialog} onClose={() => setDialog(null)} onSubmit={submitCategory} /><ConfirmDialog open={Boolean(deleting)} onClose={() => setDeleting(null)} title="Delete category?" description={`Tasks in ${deleting?.name ?? "this category"} will move to Other.`} onConfirm={() => { if (deleting) deleteCategory(deleting.id); setDeleting(null); }} confirmLabel="Delete category" /></div></Ready>;
}

function ProgressCard({ title, points }: { title: string; points: Array<{ label: string; total: number; completed: number; percentage: number }> }) {
  return <Card><CardHeader title={title} description="Completed work compared with total tasks." />{points.length ? <div className="space-y-5">{points.map((point) => <div key={point.label}><div className="flex justify-between text-sm"><span className="text-slate-200">{point.label}</span><span className="text-slate-400">{point.completed}/{point.total}</span></div><div className="mt-2 h-2 rounded-full bg-white/10"><div className="h-2 rounded-full bg-sky-400" style={{ width: `${point.percentage}%` }} /></div></div>)}</div> : <EmptyState title="No progress yet" description="Create tasks to start tracking progress." />}</Card>;
}

export function ProgressPage() {
  const { metrics, categoryProgress, monthlyProgress, yearlyProgress } = useTasks();
  return <Ready><div className="space-y-8"><SectionIntro eyebrow="Performance" title="Progress" description="Understand completion trends across your workspace." /><div className="grid gap-4 sm:grid-cols-3"><StatsCard label="Completion rate" value={`${Math.round(metrics.completionRate)}%`} detail={`${metrics.completed} of ${metrics.total} tasks`} icon={<CheckCircle2 className="size-5" />} /><StatsCard label="In progress" value={metrics.inProgress} detail={`${metrics.pending} still pending`} icon={<Clock3 className="size-5" />} /><StatsCard label="Total delivered" value={metrics.completed} detail="Completed tasks" icon={<Target className="size-5" />} /></div><div className="grid gap-6 xl:grid-cols-3"><ProgressCard title="By category" points={categoryProgress} /><ProgressCard title="Last six months" points={monthlyProgress} /><ProgressCard title="By year" points={yearlyProgress} /></div></div></Ready>;
}

export function HistoryPage() {
  const { activities } = useTasks();
  return <Ready><div className="space-y-8"><SectionIntro eyebrow="Audit trail" title="History" description="A local timeline of changes made in this workspace." /><Card>{activities.length ? <div className="space-y-1">{activities.map((activity) => <div key={activity.id} className="flex gap-4 border-b border-white/10 py-5 last:border-0"><div className="mt-1 rounded-full bg-sky-400/15 p-2 text-sky-200"><Clock3 className="size-4" /></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><p className="font-medium text-white">{activity.taskTitle}</p><time className="text-xs text-slate-500">{formatActivityTime(activity.timestamp)}</time></div><p className="mt-1 text-sm text-slate-400">{activity.description}</p></div></div>)}</div> : <EmptyState title="No activity yet" description="Task changes will appear here." />}</Card></div></Ready>;
}
