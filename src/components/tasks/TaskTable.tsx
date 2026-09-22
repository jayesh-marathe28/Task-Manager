"use client";

import { format } from "date-fns";
import { CheckCircle2, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  getDueLabel,
  getCategoryTone,
  getPriorityTone,
  getTaskStatusTone,
  parseDate,
} from "@/lib/task-utils";
import type { EnrichedTask } from "@/types/task";

export function TaskTable({
  tasks,
  onEdit,
  onDelete,
  onToggleComplete,
  emptyTitle = "No tasks found",
  emptyDescription = "Adjust your filters or create a new task to get started.",
}: {
  tasks: EnrichedTask[];
  onEdit?: (task: EnrichedTask) => void;
  onDelete?: (task: EnrichedTask) => void;
  onToggleComplete?: (task: EnrichedTask) => void;
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  if (tasks.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <>
      <div className="space-y-4 lg:hidden">
        {tasks.map((task) => (
          <article
            key={task.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-base font-semibold text-white">{task.title}</h3>
                <p className="mt-2 text-sm text-slate-400">{task.category.name}</p>
              </div>
              <Badge className={getCategoryTone(task.category)}>{task.category.name}</Badge>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Badge className={getTaskStatusTone(task.resolvedStatus)}>
                {task.resolvedStatus}
              </Badge>
              <Badge className={getPriorityTone(task.priority)}>{task.priority}</Badge>
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <Summary label="Due" value={format(parseDate(task.dueDate), "MMM d, yyyy")} />
              <Summary label="Days remaining" value={getDueLabel(task)} />
            </dl>

            <div className="mt-4 flex flex-wrap gap-2">
              {onToggleComplete ? (
                <Button variant="secondary" onClick={() => onToggleComplete(task)}>
                  <CheckCircle2 className="size-4" />
                  {task.resolvedStatus === "Completed" ? "Reopen" : "Complete"}
                </Button>
              ) : null}
              {onEdit ? (
                <Button variant="ghost" onClick={() => onEdit(task)}>
                  <Pencil className="size-4" />
                  Edit
                </Button>
              ) : null}
              {onDelete ? (
                <Button variant="ghost" onClick={() => onDelete(task)}>
                  <Trash2 className="size-4" />
                  Delete
                </Button>
              ) : null}
            </div>
          </article>
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-2xl border border-slate-200 lg:block">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.18em] text-slate-500">
            <tr>
              <th className="px-6 py-4">Task</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Priority</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Due</th>
              <th className="px-6 py-4">Days Left</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {tasks.map((task) => (
              <tr key={task.id} className="align-top">
                <td className="px-6 py-4">
                  <p className="font-medium text-white">{task.title}</p>
                  <p className="mt-1 max-w-xs text-sm text-slate-400">{task.notes}</p>
                </td>
                <td className="px-6 py-4">
                  <Badge className={getCategoryTone(task.category)}>{task.category.name}</Badge>
                </td>
                <td className="px-6 py-4">
                  <Badge className={getPriorityTone(task.priority)}>{task.priority}</Badge>
                </td>
                <td className="px-6 py-4">
                  <Badge className={getTaskStatusTone(task.resolvedStatus)}>
                    {task.resolvedStatus}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-sm text-slate-300">
                  {format(parseDate(task.dueDate), "MMM d, yyyy")}
                </td>
                <td className="px-6 py-4 text-sm text-slate-300">
                  {getDueLabel(task)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    {onToggleComplete ? (
                      <Button variant="ghost" onClick={() => onToggleComplete(task)}>
                        <CheckCircle2 className="size-4" />
                        {task.resolvedStatus === "Completed" ? "Reopen" : "Complete"}
                      </Button>
                    ) : null}
                    {onEdit ? (
                      <Button variant="ghost" onClick={() => onEdit(task)}>
                        <Pencil className="size-4" />
                        Edit
                      </Button>
                    ) : null}
                    {onDelete ? (
                      <Button variant="ghost" onClick={() => onDelete(task)}>
                        <Trash2 className="size-4" />
                        Delete
                      </Button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
      <dt className="text-xs uppercase tracking-[0.14em] text-slate-500">{label}</dt>
      <dd className="mt-2 text-sm font-medium text-slate-200">{value}</dd>
    </div>
  );
}
