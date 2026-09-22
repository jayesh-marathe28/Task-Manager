"use client";

import Link from "next/link";
import { Bell, CalendarRange, Search, Sparkles, UserRound, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTasks } from "@/context/TaskContext";
import { useAuth } from "@/context/AuthContext";
import { formatPercent } from "@/lib/utils";

const titles: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": {
    title: "Dashboard",
    subtitle: "Keep an eye on workload, focus, and delivery momentum.",
  },
  "/tasks": {
    title: "Task Management",
    subtitle: "Create, update, filter, and complete work from one place.",
  },
  "/calendar": {
    title: "Calendar",
    subtitle: "See deadlines across day, month, and year views.",
  },
  "/schedule": {
    title: "Schedule",
    subtitle: "Review what is due today, next, and already overdue.",
  },
  "/categories": {
    title: "Categories",
    subtitle: "Organize work streams with defaults and custom labels.",
  },
  "/progress": {
    title: "Progress",
    subtitle: "Measure overall, category, monthly, and yearly progress.",
  },
  "/history": {
    title: "History & Activity",
    subtitle: "Trace every meaningful update across the workspace.",
  },
};

export default function Navbar() {
  const pathname = usePathname();
  const { metrics, todayTasks, overdueTasks } = useTasks();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const content = useMemo(() => {
    const entry =
      Object.entries(titles).find(([route]) => pathname.startsWith(route))?.[1] ??
      titles["/dashboard"];

    return entry;
  }, [pathname]);

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur-xl">
      <div className="flex min-h-20 flex-col gap-4 px-5 py-4 pl-20 sm:px-6 sm:pl-20 lg:flex-row lg:items-center lg:justify-between lg:px-8 lg:pl-8">
        <div>
          <h2 className="text-lg font-semibold text-white sm:text-xl">
            {content.title}
          </h2>
          <p className="mt-1 text-sm text-slate-400">{content.subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/tasks"
            className="hidden items-center gap-2 rounded-2xl border border-slate-700/60 bg-slate-900/80 px-3 py-2 text-sm text-slate-300 transition hover:border-sky-400/40 hover:bg-slate-800 hover:text-white sm:flex"
          >
            <Search className="size-4 text-slate-500" />
            <span>Quick search on the Tasks page</span>
          </Link>

          <div className="flex items-center gap-2 rounded-2xl border border-slate-700/60 bg-slate-900/80 px-3 py-2 text-sm text-slate-300">
            <Sparkles className="size-4 text-sky-300" />
            <span>{formatPercent(metrics.completionRate)} complete</span>
          </div>

          <div className="flex items-center gap-2 rounded-2xl border border-slate-700/60 bg-slate-900/80 px-3 py-2 text-sm text-slate-300">
            <CalendarRange className="size-4 text-violet-300" />
            <span>{todayTasks.length} due today</span>
          </div>

          <div className="relative">
            <button
              type="button"
              aria-label="Notifications"
              aria-expanded={notificationsOpen}
              className="relative rounded-2xl border border-slate-700/60 bg-slate-900/80 p-2.5 text-slate-300 transition hover:border-slate-600 hover:bg-slate-800 hover:text-white"
              onClick={() => {
                setNotificationsOpen((current) => !current);
                setProfileOpen(false);
              }}
            >
              <Bell size={18} />
              {overdueTasks.length > 0 ? (
                <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                  {Math.min(overdueTasks.length, 9)}
                </span>
              ) : null}
            </button>
            {notificationsOpen ? (
              <div className="absolute right-0 top-14 z-30 w-[min(20rem,calc(100vw-2rem))] rounded-2xl border border-slate-700/80 bg-slate-900 p-4 shadow-2xl shadow-black/40">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">Notifications</p>
                    <p className="mt-1 text-xs text-slate-400">Live workspace reminders</p>
                  </div>
                  <button type="button" aria-label="Close notifications" className="text-slate-400 hover:text-white" onClick={() => setNotificationsOpen(false)}>
                    <X className="size-4" />
                  </button>
                </div>
                {overdueTasks.length > 0 ? (
                  <Link href="/schedule" onClick={() => setNotificationsOpen(false)} className="mt-4 block rounded-xl border border-rose-400/20 bg-rose-500/10 p-3 transition hover:bg-rose-500/15">
                    <p className="text-sm font-medium text-rose-700">{overdueTasks.length} overdue task{overdueTasks.length === 1 ? "" : "s"}</p>
                    <p className="mt-1 text-xs text-rose-700">Review the schedule and get work back on track.</p>
                  </Link>
                ) : (
                  <div className="mt-4 rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-3">
                    <p className="text-sm font-medium text-emerald-100">You’re all caught up</p>
                    <p className="mt-1 text-xs text-emerald-200/70">No overdue tasks right now.</p>
                  </div>
                )}
                <Link href="/tasks" onClick={() => setNotificationsOpen(false)} className="mt-3 block text-center text-xs font-semibold text-sky-300 hover:text-sky-200">Open task register</Link>
              </div>
            ) : null}
          </div>

          <div className="relative">
            <button
              type="button"
              aria-label="Open profile menu"
              aria-expanded={profileOpen}
              className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-violet-500 text-sm font-semibold text-slate-950 transition hover:shadow-lg hover:shadow-sky-500/20"
              onClick={() => {
                setProfileOpen((current) => !current);
                setNotificationsOpen(false);
              }}
            >
              {user?.name.slice(0, 2).toUpperCase() ?? "PM"}
            </button>
            {profileOpen ? (
              <div className="absolute right-0 top-14 z-30 w-56 rounded-2xl border border-slate-700/80 bg-slate-900 p-2 shadow-2xl shadow-black/40">
                <div className="border-b border-slate-700/60 px-3 py-2">
                  <p className="text-sm font-semibold text-white">{user?.name}</p>
                  <p className="mt-1 truncate text-xs text-slate-400">{user?.email}</p>
                </div>
                <Link href="/dashboard" onClick={() => setProfileOpen(false)} className="mt-2 flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white">
                  <UserRound className="size-4" />
                  Workspace overview
                </Link>
                <button type="button" onClick={() => { logout(); setProfileOpen(false); router.replace("/login"); }} className="mt-1 flex w-full items-center rounded-xl px-3 py-2 text-left text-sm text-rose-300 hover:bg-rose-500/10">
                  Sign out
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
  