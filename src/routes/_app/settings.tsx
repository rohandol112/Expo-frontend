import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/admin/PlaceholderPage";

export const Route = createFileRoute("/_app/settings")({
  component: () => <PlaceholderPage title="Settings" description="Application preferences, profile settings, and platform configuration will appear here." />,
});
