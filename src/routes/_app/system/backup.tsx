import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/admin/PlaceholderPage";

export const Route = createFileRoute("/_app/system/backup")({
  component: () => <PlaceholderPage title="Backup & Restore" description="Backup schedules, restore points, and system export controls will appear here." />,
});
