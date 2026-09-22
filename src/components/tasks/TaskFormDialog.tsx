"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { useTasks } from "@/context/TaskContext";
import {
  EDITABLE_TASK_STATUSES,
  TASK_PRIORITIES,
  type EnrichedTask,
  type TaskFormValues,
} from "@/types/task";

const emptyValues: TaskFormValues = {
  title: "",
  categoryId: "",
  startDate: new Date().toISOString().slice(0, 10),
  dueDate: new Date().toISOString().slice(0, 10),
  duration: 1,
  priority: "Medium",
  status: "Pending",
  notes: "",
};

type FormErrors = Partial<Record<keyof TaskFormValues, string>>;

export function TaskFormDialog({
  open,
  onClose,
  task,
}: {
  open: boolean;
  onClose: () => void;
  task?: EnrichedTask | null;
}) {
  const { categories, createTask, updateTask } = useTasks();
  const [values, setValues] = useState<TaskFormValues>(emptyValues);
  const [errors, setErrors] = useState<FormErrors>({});

  const initialValues = useMemo<TaskFormValues>(() => {
    if (!task) {
      return {
        ...emptyValues,
        categoryId: categories[0]?.id ?? "",
      };
    }

    return {
      title: task.title,
      categoryId: task.categoryId,
      startDate: task.startDate,
      dueDate: task.dueDate,
      duration: task.duration,
      priority: task.priority,
      status: task.resolvedStatus === "Overdue" ? "Pending" : task.resolvedStatus,
      notes: task.notes,
    };
  }, [categories, task]);

  useEffect(() => {
    if (!open) {
      return;
    }

    // Reset the draft whenever the dialog opens for a different task.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setValues(initialValues);
    setErrors({});
  }, [initialValues, open]);

  function updateValue<Key extends keyof TaskFormValues>(
    key: Key,
    value: TaskFormValues[Key],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function validate() {
    const nextErrors: FormErrors = {};

    if (!values.title.trim()) {
      nextErrors.title = "Task title is required.";
    }

    if (!values.categoryId) {
      nextErrors.categoryId = "Choose a category.";
    }

    if (!values.startDate) {
      nextErrors.startDate = "Pick a start date.";
    }

    if (!values.dueDate) {
      nextErrors.dueDate = "Pick a due date.";
    }

    if (
      values.startDate &&
      values.dueDate &&
      values.dueDate < values.startDate
    ) {
      nextErrors.dueDate = "Due date cannot be earlier than start date.";
    }

    if (!Number.isFinite(values.duration) || values.duration <= 0) {
      nextErrors.duration = "Duration must be at least 1 day.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    if (task) {
      updateTask(task.id, values);
    } else {
      createTask(values);
    }

    onClose();
  }

  const title = task ? "Edit task" : "Create task";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      description="Keep the details complete so the dashboard, schedule, and history stay accurate."
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button form="task-form" type="submit">
            {task ? "Save changes" : "Create task"}
          </Button>
        </>
      }
    >
      <form id="task-form" className="space-y-5" onSubmit={handleSubmit}>
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Title" error={errors.title}>
            <input
              className={inputClass}
              value={values.title}
              onChange={(event) => updateValue("title", event.target.value)}
              placeholder="Prepare sprint review summary"
            />
          </Field>

          <Field label="Category" error={errors.categoryId}>
            <select
              className={inputClass}
              value={values.categoryId}
              onChange={(event) => updateValue("categoryId", event.target.value)}
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Start Date" error={errors.startDate}>
            <input
              type="date"
              className={inputClass}
              value={values.startDate}
              onChange={(event) => updateValue("startDate", event.target.value)}
            />
          </Field>

          <Field label="Due Date" error={errors.dueDate}>
            <input
              type="date"
              className={inputClass}
              value={values.dueDate}
              onChange={(event) => updateValue("dueDate", event.target.value)}
            />
          </Field>

          <Field label="Duration (days)" error={errors.duration}>
            <input
              type="number"
              min={1}
              className={inputClass}
              value={values.duration}
              onChange={(event) =>
                updateValue("duration", Number(event.target.value))
              }
            />
          </Field>

          <Field label="Priority">
            <select
              className={inputClass}
              value={values.priority}
              onChange={(event) =>
                updateValue("priority", event.target.value as TaskFormValues["priority"])
              }
            >
              {TASK_PRIORITIES.map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Status">
            <select
              className={inputClass}
              value={values.status}
              onChange={(event) =>
                updateValue("status", event.target.value as TaskFormValues["status"])
              }
            >
              {EDITABLE_TASK_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Notes">
          <textarea
            className={`${inputClass} min-h-32 resize-y`}
            value={values.notes}
            onChange={(event) => updateValue("notes", event.target.value)}
            placeholder="Capture context, blockers, or handoff notes."
          />
        </Field>
      </form>
    </Dialog>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-200">{label}</span>
      {children}
      {error ? <span className="mt-2 block text-sm text-rose-300">{error}</span> : null}
    </label>
  );
}

const inputClass =
  "w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400/40 focus:bg-white/10";
