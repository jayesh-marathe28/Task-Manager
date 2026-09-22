"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { AuthShell, Field, Message, SubmitButton } from "@/components/auth/AuthUI";
function ResetPasswordForm() {
  const params = useSearchParams(); const router = useRouter(); const { resetPassword } = useAuth(); const [password, setPassword] = useState(""); const [confirm, setConfirm] = useState(""); const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  const submit = (event: React.FormEvent) => { event.preventDefault(); setError(""); if (password.length < 8) return setError("Password must be at least 8 characters."); if (password !== confirm) return setError("Passwords do not match."); setLoading(true); setTimeout(() => { const result = resetPassword(params.get("token") ?? "", password); if (result.ok) router.replace("/login?reset=success"); else setError(result.message ?? "Unable to reset password."); setLoading(false); }, 350); };
  return <AuthShell title="Choose a new password" subtitle="Your new password must be at least 8 characters."><form onSubmit={submit} className="mt-6 space-y-4"><Field label="New password" type="password" value={password} onChange={setPassword} placeholder="At least 8 characters" /><Field label="Confirm password" type="password" value={confirm} onChange={setConfirm} placeholder="Repeat your password" />{error && <Message error>{error}</Message>}<SubmitButton loading={loading}>Update password</SubmitButton></form></AuthShell>;
}

export default function ResetPasswordPage() {
  return <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">Loading…</div>}><ResetPasswordForm /></Suspense>;
}
