"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import api from "./api";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
}

interface AuthCtx {
  user: User | null;
  token: string | null;
  login: (email: string, password: string, remember?: boolean) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const SESSION_TIMEOUT = 30 * 60 * 1000;
const STORAGE_KEY_TOKEN = "rpms_token";
const STORAGE_KEY_USER = "rpms_user";

const AuthContext = createContext<AuthCtx>({} as AuthCtx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastActivity, setLastActivity] = useState(Date.now());

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    localStorage.removeItem(STORAGE_KEY_USER);
    sessionStorage.removeItem(STORAGE_KEY_TOKEN);
    sessionStorage.removeItem(STORAGE_KEY_USER);
    setToken(null);
    setUser(null);
    if (typeof window !== "undefined") window.location.href = "/login";
  };

  // Restore session on mount
  useEffect(() => {
    const storedToken = localStorage.getItem(STORAGE_KEY_TOKEN) || sessionStorage.getItem(STORAGE_KEY_TOKEN);
    const storedUser = localStorage.getItem(STORAGE_KEY_USER) || sessionStorage.getItem(STORAGE_KEY_USER);
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        logout();
      }
    }
    setLoading(false);
  }, []);

  // Activity tracker
  useEffect(() => {
    const events = ["mousedown", "mousemove", "keydown", "scroll", "touchstart", "click"];
    const resetActivity = () => setLastActivity(Date.now());
    events.forEach(e => window.addEventListener(e, resetActivity, { passive: true }));
    return () => events.forEach(e => window.removeEventListener(e, resetActivity));
  }, []);

  // Session timeout checker
  useEffect(() => {
    if (!token) return;
    const checkSession = () => {
      const elapsed = Date.now() - lastActivity;
      if (elapsed > SESSION_TIMEOUT) logout();
    };
    const interval = setInterval(checkSession, 60 * 1000);
    return () => clearInterval(interval);
  }, [token, lastActivity]);

  const login = async (email: string, password: string, remember = false) => {
    const res = await api.post("/auth/login", { email, password });
    const { access_token, user: u } = res.data;

    if (remember) {
      localStorage.setItem(STORAGE_KEY_TOKEN, access_token);
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(u));
    } else {
      sessionStorage.setItem(STORAGE_KEY_TOKEN, access_token);
      sessionStorage.setItem(STORAGE_KEY_USER, JSON.stringify(u));
    }

    setToken(access_token);
    setUser(u);
    setLastActivity(Date.now());
  };

  return <AuthContext.Provider value={{ user, token, login, logout, loading }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
