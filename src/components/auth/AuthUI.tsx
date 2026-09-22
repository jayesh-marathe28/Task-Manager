"use client";

import Link from "next/link";
import { Eye, EyeOff, FolderKanban, LoaderCircle } from "lucide-react";
import { FormEvent, useState } from "react";

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-10">
    <div className="w-full max-w-md">
      <Link href="/login" className="mb-8 flex items-center justify-center gap-3"><span className="rounded-2xl border border-sky-300/20 bg-sky-400/10 p-3 text-sky-300"><FolderKanban className="size-6" /></span><span className="text-xl font-semibold text-white">TaskFlow</span></Link>
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-8"><h1 className="text-2xl font-semibold text-slate-900">{title}</h1><p className="mt-2 text-sm text-slate-500">{subtitle}</p>{children}</section>
    </div>
  </main>;
}

export function Field({ label, type = "text", value, onChange, placeholder, required = true }: { label: string; type?: string; value: string; onChange: (value: string) => void; placeholder?: string; required?: boolean }) {
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";
  return <label className="block text-sm font-medium text-slate-700"><span>{label}</span><span className="relative mt-2 block"><input required={required} type={isPassword && visible ? "text" : type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-11 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />{isPassword && <button type="button" aria-label={visible ? "Hide password" : "Show password"} onClick={() => setVisible(!visible)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600">{visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button>}</span></label>;
}

export function SubmitButton({ children, loading }: { children: React.ReactNode; loading: boolean }) {
  return <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold !text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">{loading && <LoaderCircle className="size-4 animate-spin" />}{children}</button>;
}
export function Message({ error, children }: { error?: boolean; children: React.ReactNode }) { return <p className={`rounded-xl border px-3 py-2 text-sm ${error ? "border-rose-400/30 bg-rose-500/10 text-rose-200" : "border-emerald-400/30 bg-emerald-500/10 text-emerald-200"}`}>{children}</p>; }
export function AuthFooter({ register = false }: { register?: boolean }) { return <p className="mt-6 text-center text-sm text-slate-400">{register ? "Already have an account?" : "New to TaskFlow?"} <Link href={register ? "/login" : "/register"} className="font-semibold text-sky-300 hover:text-sky-200">{register ? "Sign in" : "Create an account"}</Link></p>; }
export function useAuthForm(handler: () => void) { return (event: FormEvent) => { event.preventDefault(); handler(); }; }
