"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { CheckCircle2, Info, TriangleAlert, X, XCircle } from "lucide-react";
import { cn, createId } from "@/lib/utils";

type ToastTone = "success" | "info" | "warning" | "error";

interface ToastItem {
  id: string;
  title: string;
  description?: string;
  tone: ToastTone;
}

interface ToastContextValue {
  notify: (toast: Omit<ToastItem, "id">) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const toastIcons = {
  success: CheckCircle2,
  info: Info,
  warning: TriangleAlert,
  error: XCircle,
} satisfies Record<ToastTone, typeof Info>;

const toastTones = {
  success: "border-emerald-400/30 bg-emerald-500/10 text-emerald-50",
  info: "border-sky-400/30 bg-sky-500/10 text-sky-50",
  warning: "border-amber-400/30 bg-amber-500/10 text-amber-50",
  error: "border-rose-400/30 bg-rose-500/10 text-rose-50",
} satisfies Record<ToastTone, string>;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const notify = useCallback((toast: Omit<ToastItem, "id">) => {
    const id = createId("toast");
    setToasts((current) => [...current, { ...toast, id }]);

    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, 3200);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((current) => current.filter((item) => item.id !== id));
  }, []);

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div
        aria-live="polite"
        className="pointer-events-none fixed right-4 top-4 z-50 flex w-full max-w-sm flex-col gap-3"
      >
        {toasts.map((toast) => {
          const Icon = toastIcons[toast.tone];

          return (
            <div
              key={toast.id}
              className={cn(
                "pointer-events-auto rounded-2xl border p-4 shadow-2xl shadow-slate-950/25 backdrop-blur",
                toastTones[toast.tone],
              )}
              role="status"
            >
              <div className="flex items-start gap-3">
                <Icon className="mt-0.5 size-5 shrink-0" />

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{toast.title}</p>
                  {toast.description ? (
                    <p className="mt-1 text-sm text-white/75">
                      {toast.description}
                    </p>
                  ) : null}
                </div>

                <button
                  type="button"
                  aria-label="Dismiss notification"
                  className="rounded-full p-1 text-white/70 transition hover:bg-white/10 hover:text-white"
                  onClick={() => removeToast(toast.id)}
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }

  return context;
}
