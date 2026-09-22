"use client";

import type { ButtonHTMLAttributes } from "react";
import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  loading?: boolean;
}

const variants = {
  primary:
    "bg-blue-600 !text-white shadow-sm shadow-blue-600/20 hover:bg-blue-700 active:bg-blue-800",
  secondary:
    "border border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50",
  ghost: "text-slate-600 hover:bg-blue-50 hover:text-blue-700",
  danger:
    "bg-rose-500 text-white shadow-lg shadow-rose-500/20 hover:bg-rose-400 active:bg-rose-600",
} satisfies Record<NonNullable<ButtonProps["variant"]>, string>;

export function Button({
  className,
  children,
  variant = "primary",
  loading = false,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400 disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant],
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <LoaderCircle className="size-4 animate-spin" /> : null}
      {children}
    </button>
  );
}
