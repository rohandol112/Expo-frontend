import { createFileRoute, redirect } from "@tanstack/react-router";
import { ROUTES } from "@/constants/routes.constants";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({ to: ROUTES.DASHBOARD });
  },
});
