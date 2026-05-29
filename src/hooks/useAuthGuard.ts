import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuthStore } from "@/store/useAuthStore";
import { ROUTES } from "@/constants/routes.constants";

export function useAuthGuard() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: ROUTES.LOGIN, replace: true });
    }
  }, [isAuthenticated, navigate]);

  return isAuthenticated;
}