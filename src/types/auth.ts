export interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

export interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export interface AuthActions {
  setAuth: (token: string, refreshToken: string) => void;
  clearAuth: () => void;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}
