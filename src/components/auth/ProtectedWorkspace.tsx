"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { LoaderCircle } from "lucide-react";
export default function ProtectedWorkspace({ children }: { children: React.ReactNode }) {
  const { user, isReady } = useAuth(); const router = useRouter();
  useEffect(() => { if (isReady && !user) router.replace("/login"); }, [isReady, user, router]);
  if (!isReady || !user) return <div className="flex min-h-screen items-center justify-center bg-slate-50 text-blue-600"><LoaderCircle className="size-6 animate-spin" /></div>;
  return <>{children}</>;
}
