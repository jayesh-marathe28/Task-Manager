"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { AuthFooter, AuthShell, Field, Message, SubmitButton } from "@/components/auth/AuthUI";
export default function LoginPage() {
  const { login } = useAuth(); const router = useRouter(); const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [error, setError] = useState(""); const [success, setSuccess] = useState(""); const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("reset") === "success") {
      // Hydrate the one-time reset confirmation from the browser URL.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSuccess("Your password has been updated. Sign in with your new password.");
    }
  }, []);
  const submit = (event: React.FormEvent) => { event.preventDefault(); setError(""); setLoading(true); setTimeout(() => { const result = login(email, password); if (result.ok) router.replace("/dashboard"); else setError(result.message ?? "Unable to sign in."); setLoading(false); }, 350); };
  return <AuthShell title="Welcome back" subtitle="Sign in to continue to your workspace."><form onSubmit={submit} className="mt-6 space-y-4"><Field label="Email address" type="email" value={email} onChange={setEmail} placeholder="you@example.com" /><Field label="Password" type="password" value={password} onChange={setPassword} placeholder="Your password" />{success && <Message>{success}</Message>}{error && <Message error>{error}</Message>}<div className="text-right"><a href="/forgot-password" className="text-sm text-sky-300 hover:text-sky-200">Forgot password?</a></div><SubmitButton loading={loading}>Sign in</SubmitButton></form><AuthFooter /></AuthShell>;
}
