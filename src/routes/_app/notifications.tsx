import { Outlet, createFileRoute, useLocation, useNavigate } from "@tanstack/react-router";
import { Bell, CheckCircle2, Clock, Megaphone, Plus, XCircle } from "lucide-react";
import { AdminListPage } from "@/components/admin/AdminListPage";
import { ActionMenu } from "@/components/common/ActionMenu";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { notifications } from "@/mock/notifications.mock";
import type { NewsNotification } from "@/types/notification";
import type { Column } from "@/components/tables/DataTable";
import { ROUTES } from "@/constants/routes.constants";

export const Route = createFileRoute("/_app/notifications")({ component: NotificationsPage });

function NotificationsPage() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  if (pathname !== ROUTES.NOTIFICATIONS) return <Outlet />;
  const columns: Column<NewsNotification>[] = [
    { key: "news", header: "News", cell: (r) => <span className="font-medium">{r.news}</span> },
    { key: "language", header: "Language", cell: (r) => r.language },
    { key: "state", header: "Target State", cell: (r) => r.targetState },
    { key: "district", header: "District", cell: (r) => r.district },
    { key: "city", header: "City", cell: (r) => r.city },
    { key: "sent", header: "Sent On", cell: (r) => r.sentOn },
    { key: "targetLang", header: "Target Language", cell: (r) => r.targetLanguage },
    { key: "reach", header: "Reach", cell: (r) => r.reach.toLocaleString() },
    { key: "open", header: "Open", cell: (r) => r.open.toLocaleString() },
    { key: "status", header: "Status", cell: (r) => <StatusBadge status={r.status} /> },
    { key: "actions", header: "Actions", cell: () => <ActionMenu /> },
  ];
  return <AdminListPage title="News Notifications" breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "Notifications" }]} actions={<Button onClick={() => navigate({ to: ROUTES.NOTIFICATIONS_ADD })}><Plus className="mr-2 h-4 w-4" />Create Notification</Button>} stats={[{ title: "Total Notifications", value: notifications.length, icon: Bell, variant: "blue" }, { title: "Sent Successfully", value: 248, icon: CheckCircle2, variant: "green" }, { title: "Scheduled", value: notifications.filter((n) => n.status === "Scheduled").length, icon: Clock, variant: "amber" }, { title: "Total Reach", value: "2.4M", icon: Megaphone, variant: "violet" }, { title: "Failed/Closed", value: notifications.filter((n) => n.status === "Failed").length, icon: XCircle, variant: "rose" }]} data={notifications} columns={columns} rowKey={(r) => r.id} searchPlaceholder="Search notification..." showDateRange dropdowns={[{ key: "status", placeholder: "Status", options: ["Active", "Scheduled", "Failed"].map((s) => ({ label: s, value: s })) }]} filter={(row, search) => row.news.toLowerCase().includes(search.toLowerCase())} />;
}
