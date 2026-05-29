import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/admin/PlaceholderPage";

export const Route = createFileRoute("/_app/system/audit-logs")({
  component: () => <PlaceholderPage title="Audit Logs" description="Administrative activity logs, filters, and exports will appear here." />,
});
