import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AdminUser } from "@/types/auth";

export const AUTH_STORAGE_KEY = "news-admin-auth";
export const ADMIN_TOKEN_STORAGE_KEY = "pehli-baat-admin-token";

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
      setAuth: (user, token) => {
        if (typeof window !== "undefined") {
          window.localStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, token);
        }
        set({ user, token, isAuthenticated: true });
      },
      logout: () => {
        if (typeof window !== "undefined") {
          window.localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
        }
        set({ user: null, token: null, isAuthenticated: false });
      },
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
      state?: Pick<AuthState, "isAuthenticated" | "token" | "user">;
    };

    const adminToken = window.localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY);
    return Boolean(parsed.state?.isAuthenticated && parsed.state.token && parsed.state.user && adminToken);
  } catch {
    return false;
  }
}
