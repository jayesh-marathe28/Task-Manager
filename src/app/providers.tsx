"use client";

import { TaskProvider } from "@/context/TaskContext";
import { ToastProvider } from "@/context/ToastContext";
import { AuthProvider } from "@/context/AuthContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <AuthProvider><TaskProvider>{children}</TaskProvider></AuthProvider>
    </ToastProvider>
  );
}
