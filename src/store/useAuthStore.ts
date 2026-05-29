import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AdminUser } from "@/types/auth";

export const AUTH_STORAGE_KEY = "news-admin-auth";

interface AuthState {
  user: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: AdminUser, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    { name: AUTH_STORAGE_KEY },
  ),
);

export function hasPersistedAuthSession() {
  if (typeof window === "undefined") return false;

  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return false;

    const parsed = JSON.parse(raw) as {
      state?: Pick<AuthState, "isAuthenticated" | "token">;
    };

    return Boolean(parsed.state?.isAuthenticated && parsed.state.token);
  } catch {
    return false;
  }
}
