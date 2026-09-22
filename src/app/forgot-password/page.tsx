"use client";
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { AuthShell, Field, Message, SubmitButton } from "@/components/auth/AuthUI";
export default function ForgotPasswordPage() {
  const { requestReset } = useAuth(); const [email, setEmail] = useState(""); const [error, setError] = useState(""); const [token, setToken] = useState(""); const [loading, setLoading] = useState(false);
  const submit = (event: React.FormEvent) => { event.preventDefault(); setError(""); setLoading(true); setTimeout(() => { const result = requestReset(email); if (result.ok) setToken(result.message ?? ""); else setError(result.message ?? "Unable to find account."); setLoading(false); }, 350); };
  return <AuthShell title="Reset your password" subtitle="Enter your email and we'll create a secure reset link.">{token ? <div className="mt-6 space-y-4"><Message>Reset link ready. For this frontend-only demo, use the button below.</Message><Link href={`/reset-password?token=${encodeURIComponent(token)}`} className="block w-full rounded-xl bg-sky-400 px-4 py-3 text-center text-sm font-semibold text-slate-950 hover:bg-sky-300">Continue to reset password</Link></div> : <form onSubmit={submit} className="mt-6 space-y-4"><Field label="Email address" type="email" value={email} onChange={setEmail} placeholder="you@example.com" />{error && <Message error>{error}</Message>}<SubmitButton loading={loading}>Create reset link</SubmitButton></form>}<p className="mt-6 text-center text-sm text-slate-400"><Link href="/login" className="text-sky-300 hover:text-sky-200">Back to sign in</Link></p></AuthShell>;
}
