import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthActions, AuthState } from '@/types/auth';

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      user: null,
      isLoading: false,
      error: null,

      setAuth: (token, refreshToken) =>
        set({
          token,
          refreshToken,
          isLoading: false,
          error: null,
        }),

      clearAuth: () =>
        set({
          token: null,
          refreshToken: null,
          user: null,
          isLoading: false,
          error: null,
        }),

      setUser: (user) => set({ user }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error, isLoading: false }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
    }
  )
);

export default useAuthStore;
