import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { RootLayout } from "@/layouts/RootLayout";
import { useAuthStore } from "@/store/useAuthStore";
import { ROUTES } from "@/constants/routes.constants";

export const Route = createFileRoute("/_app")({
  beforeLoad: () => {
    if (!useAuthStore.getState().isAuthenticated) {
      throw redirect({ to: ROUTES.LOGIN });
    }
  },
  component: AppShell,
});

function AppShell() {
  return (
    <RootLayout>
      <Outlet />
    </RootLayout>
  );
}