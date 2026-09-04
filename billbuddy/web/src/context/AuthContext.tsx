import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { AuthedUser } from "@billbuddy/shared";
import { api, getToken, setToken } from "../api/client";

interface AuthContextValue {
  user: AuthedUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  registerFirm: (data: { firmName: string; userName: string; email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthedUser | null>(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    if (!getToken()) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const { user: me } = await api.auth.me();
      setUser(me);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function login(email: string, password: string) {
    const { token } = await api.auth.login({ email, password });
    setToken(token);
    await refresh();
  }

  async function registerFirm(data: { firmName: string; userName: string; email: string; password: string }) {
    const { token } = await api.auth.registerFirm(data);
    setToken(token);
    await refresh();
  }

  async function logout() {
    try {
      await api.auth.logout();
    } catch {
      // ignore - we're clearing the local token regardless
    }
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, registerFirm, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
