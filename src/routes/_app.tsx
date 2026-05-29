import { createFileRoute, redirect } from "@tanstack/react-router";
import { RootLayout } from "@/layouts/RootLayout";
import { hasPersistedAuthSession, useAuthStore } from "@/store/useAuthStore";
import { ROUTES } from "@/constants/routes.constants";

export const Route = createFileRoute("/_app")({
  beforeLoad: () => {
    if (typeof window === "undefined") return;

    const isAuthenticated =
      useAuthStore.getState().isAuthenticated || hasPersistedAuthSession();

    if (!isAuthenticated) {
      throw redirect({ to: ROUTES.LOGIN });
    }
  },
  component: RootLayout,
});
