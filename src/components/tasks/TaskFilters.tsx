"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { TASK_PRIORITIES, TASK_STATUSES, type TaskFilters } from "@/types/task";
import type { Category } from "@/types/task";

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 5 }, (_, index) => String(currentYear - 2 + index));

export function TaskFiltersPanel({
  filters,
  onChange,
  onReset,
  categories,
  count,
}: {
  filters: TaskFilters;
  onChange: (filters: TaskFilters) => void;
  onReset: () => void;
  categories: Category[];
  count: number;
}) {
  function patchFilter<Key extends keyof TaskFilters>(
    key: Key,
    value: TaskFilters[Key],
  ) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <Card>
      <CardHeader
        title="Search & Filters"
        description={`${count} task${count === 1 ? "" : "s"} match the current view.`}
        action={
          <Button variant="ghost" onClick={onReset}>
            Clear filters
          </Button>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[1.4fr_repeat(6,minmax(0,1fr))]">
        <label className="relative block">
          <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-200">
            <Search className="size-4 text-slate-500" />
            Search title
          </span>
          <input
            className={inputClass}
            placeholder="Search tasks..."
            value={filters.search}
            onChange={(event) => patchFilter("search", event.target.value)}
          />
        </label>

        <FilterSelect
          label="Category"
          value={filters.categoryId}
          onChange={(value) => patchFilter("categoryId", value)}
          options={[
            { label: "All", value: "" },
            ...categories.map((category) => ({
              label: category.name,
              value: category.id,
            })),
          ]}
        />

        <FilterSelect
          label="Priority"
          value={filters.priority}
          onChange={(value) => patchFilter("priority", value as TaskFilters["priority"])}
          options={[
            { label: "All", value: "" },
            ...TASK_PRIORITIES.map((priority) => ({ label: priority, value: priority })),
          ]}
        />

        <FilterSelect
          label="Status"
          value={filters.status}
          onChange={(value) => patchFilter("status", value as TaskFilters["status"])}
          options={[
            { label: "All", value: "" },
            ...TASK_STATUSES.map((status) => ({ label: status, value: status })),
          ]}
        />

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-200">Date</span>
          <input
            type="date"
            className={inputClass}
            value={filters.date}
            onChange={(event) => patchFilter("date", event.target.value)}
          />
        </label>

        <FilterSelect
          label="Month"
          value={filters.month}
          onChange={(value) => patchFilter("month", value)}
          options={[
            { label: "All", value: "" },
            ...Array.from({ length: 12 }, (_, index) => ({
              label: String(index + 1).padStart(2, "0"),
              value: String(index + 1),
            })),
          ]}
        />

        <FilterSelect
          label="Year"
          value={filters.year}
          onChange={(value) => patchFilter("year", value)}
          options={[{ label: "All", value: "" }, ...yearOptions.map((year) => ({ label: year, value: year }))]}
        />
      </div>

      <div className="mt-4 flex items-center gap-2 text-sm text-slate-400">
        <SlidersHorizontal className="size-4" />
        Combine title, category, priority, status, date, month, and year filters together.
      </div>
    </Card>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Array<{ label: string; value: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-200">{label}</span>
      <select
        className={inputClass}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={`${label}-${option.value}`} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

const inputClass =
  "w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-400/40 focus:bg-white/10";
