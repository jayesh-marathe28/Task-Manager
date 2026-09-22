"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { AuthFooter, AuthShell, Field, Message, SubmitButton } from "@/components/auth/AuthUI";
export default function RegisterPage() {
  const { register } = useAuth(); const router = useRouter(); const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [confirm, setConfirm] = useState(""); const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  const submit = (event: React.FormEvent) => { event.preventDefault(); setError(""); if (name.trim().length < 2) return setError("Please enter your name."); if (password.length < 8) return setError("Password must be at least 8 characters."); if (password !== confirm) return setError("Passwords do not match."); setLoading(true); setTimeout(() => { const result = register(name, email, password); if (result.ok) router.replace("/dashboard"); else setError(result.message ?? "Unable to create account."); setLoading(false); }, 350); };
  return <AuthShell title="Create your account" subtitle="Start organizing your work with TaskFlow."><form onSubmit={submit} className="mt-6 space-y-4"><Field label="Full name" value={name} onChange={setName} placeholder="Alex Morgan" /><Field label="Email address" type="email" value={email} onChange={setEmail} placeholder="you@example.com" /><Field label="Password" type="password" value={password} onChange={setPassword} placeholder="At least 8 characters" /><Field label="Confirm password" type="password" value={confirm} onChange={setConfirm} placeholder="Repeat your password" />{error && <Message error>{error}</Message>}<SubmitButton loading={loading}>Create account</SubmitButton></form><AuthFooter register /></AuthShell>;
}
