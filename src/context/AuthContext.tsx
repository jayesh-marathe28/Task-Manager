"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type AuthUser = { id: string; name: string; email: string };
type StoredUser = AuthUser & { password: string };
type AuthContextValue = {
  user: AuthUser | null;
  isReady: boolean;
  login: (email: string, password: string) => { ok: boolean; message?: string };
  register: (name: string, email: string, password: string) => { ok: boolean; message?: string };
  logout: () => void;
  requestReset: (email: string) => { ok: boolean; message?: string };
  resetPassword: (token: string, password: string) => { ok: boolean; message?: string };
};

const AuthContext = createContext<AuthContextValue | null>(null);
const USERS_KEY = "taskflow-users";
const SESSION_KEY = "taskflow-session";
const RESET_KEY = "taskflow-reset-token";

function readUsers(): StoredUser[] {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) ?? "[]") as StoredUser[]; } catch { return []; }
}
function saveUsers(users: StoredUser[]) { localStorage.setItem(USERS_KEY, JSON.stringify(users)); }

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Hydrate the browser session once after the server render.
    try {
      const session = localStorage.getItem(SESSION_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (session) setUser(JSON.parse(session) as AuthUser);
    } catch { localStorage.removeItem(SESSION_KEY); }
    setIsReady(true);
  }, []);

  const login = useCallback((email: string, password: string) => {
    const account = readUsers().find((item) => item.email === email.trim().toLowerCase());
    if (!account || account.password !== password) return { ok: false, message: "Invalid email or password." };
    const nextUser = { id: account.id, name: account.name, email: account.email };
    localStorage.setItem(SESSION_KEY, JSON.stringify(nextUser)); setUser(nextUser);
    return { ok: true };
  }, []);

  const register = useCallback((name: string, email: string, password: string) => {
    const normalized = email.trim().toLowerCase();
    const users = readUsers();
    if (users.some((item) => item.email === normalized)) return { ok: false, message: "An account with this email already exists." };
    const nextUser = { id: crypto.randomUUID(), name: name.trim(), email: normalized };
    saveUsers([...users, { ...nextUser, password }]);
    localStorage.setItem(SESSION_KEY, JSON.stringify(nextUser)); setUser(nextUser);
    return { ok: true };
  }, []);

  const logout = useCallback(() => { localStorage.removeItem(SESSION_KEY); setUser(null); }, []);

  const requestReset = useCallback((email: string) => {
    const account = readUsers().find((item) => item.email === email.trim().toLowerCase());
    if (!account) return { ok: false, message: "No account was found for that email." };
    const token = `${account.id}.${Date.now()}`;
    localStorage.setItem(RESET_KEY, JSON.stringify({ token, email: account.email, expires: Date.now() + 15 * 60 * 1000 }));
    return { ok: true, message: token };
  }, []);

  const resetPassword = useCallback((token: string, password: string) => {
    try {
      const reset = JSON.parse(localStorage.getItem(RESET_KEY) ?? "null") as { token: string; email: string; expires: number } | null;
      if (!reset || reset.token !== token || reset.expires < Date.now()) return { ok: false, message: "This reset link is invalid or has expired." };
      const users = readUsers();
      saveUsers(users.map((item) => item.email === reset.email ? { ...item, password } : item));
      localStorage.removeItem(RESET_KEY);
      return { ok: true };
    } catch { return { ok: false, message: "This reset link is invalid or has expired." }; }
  }, []);

  const value = useMemo(() => ({ user, isReady, login, register, logout, requestReset, resetPassword }), [user, isReady, login, register, logout, requestReset, resetPassword]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used within AuthProvider");
  return value;
}
