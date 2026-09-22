"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FolderKanban,
  LayoutDashboard,
  CheckSquare,
  CalendarDays,
  CalendarClock,
  Tags,
  ChartColumnIncreasing,
  History,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useTasks } from "@/context/TaskContext";

const menuItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Tasks",
    href: "/tasks",
    icon: CheckSquare,
  },
  {
    name: "Calendar",
    href: "/calendar",
    icon: CalendarDays,
  },
  {
    name: "Schedule",
    href: "/schedule",
    icon: CalendarClock,
  },
  {
    name: "Categories",
    href: "/categories",
    icon: Tags,
  },
  {
    name: "Progress",
    href: "/progress",
    icon: ChartColumnIncreasing,
  },
  {
    name: "History",
    href: "/history",
    icon: History,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { metrics } = useTasks();

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className="border-b border-slate-800/90 px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-3 text-blue-600 shadow-sm">
            <FolderKanban className="size-6" />
          </div>
          <div>
            <p className="text-lg font-semibold text-white">TaskFlow</p>
            <p className="text-xs text-slate-400">Project operations cockpit</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-5">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
            Workspace
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <p className="text-2xl font-semibold text-white">{metrics.total}</p>
              <p className="text-xs text-slate-400">Tasks</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-rose-600">{metrics.overdue}</p>
              <p className="text-xs text-slate-400">Overdue</p>
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-2 overflow-y-auto px-4 pb-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                active
                  ? "bg-blue-600 !text-white shadow-md shadow-blue-600/20"
                  : "text-slate-300 hover:bg-slate-800/80 hover:text-white",
              )}
              onClick={() => setOpen(false)}
            >
              <Icon size={20} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );

  return (
    <>
      <button
        type="button"
        aria-label={open ? "Close navigation" : "Open navigation"}
        className="fixed left-4 top-4 z-50 rounded-xl border border-slate-200 bg-white p-3 text-slate-700 shadow-lg lg:hidden"
        onClick={() => setOpen((current) => !current)}
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-slate-200 bg-white lg:block">
        {sidebarContent}
      </aside>

      {open ? (
        <div
          className="fixed inset-0 z-30 bg-slate-950/60 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        >
          <aside
            className="h-full w-72 border-r border-slate-200 bg-white"
            onClick={(event) => event.stopPropagation()}
          >
            {sidebarContent}
          </aside>
        </div>
      ) : null}
    </>
  );
}
