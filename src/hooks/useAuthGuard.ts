import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { hasPersistedAuthSession, useAuthStore } from "@/store/useAuthStore";
import { ROUTES } from "@/constants/routes.constants";

export function useAuthGuard() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const hasSession = (isAuthenticated && Boolean(user) && Boolean(token)) || hasPersistedAuthSession();

  useEffect(() => {
    if (!hasSession) {
      navigate({ to: ROUTES.LOGIN, replace: true });
    }
  }, [hasSession, navigate]);

  return hasSession;
}
