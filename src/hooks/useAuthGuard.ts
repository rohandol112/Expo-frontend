import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { hasPersistedAuthSession, useAuthStore } from "@/store/useAuthStore";
import { ROUTES } from "@/constants/routes.constants";

export function useAuthGuard() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasSession = isAuthenticated || hasPersistedAuthSession();

  useEffect(() => {
    if (!hasSession) {
      navigate({ to: ROUTES.LOGIN, replace: true });
    }
  }, [hasSession, navigate]);

  return hasSession;
}
