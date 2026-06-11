import { useCallback, useMemo, useState } from "react";
import { Outlet, createFileRoute, useLocation, useNavigate } from "@tanstack/react-router";
import { Bell, CheckCircle2, Clock, Megaphone, Plus, Send, XCircle } from "lucide-react";
import { toast } from "sonner";
import { AdminListPage } from "@/components/admin/AdminListPage";
import { ActionMenu } from "@/components/common/ActionMenu";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  notificationStatusLabel,
} from "@/services/adapters/notification.adapter";
import {
  useDeleteNotification,
  useNotificationStats,
  useNotifications,
  usePublishNotification,
  useSendNotification,
} from "@/hooks/api/useNotifications";
import { useLanguages } from "@/hooks/api/useLanguages";
import { useRegions } from "@/hooks/api/useRegions";
import type { NewsNotification, NotificationStatus } from "@/types/notification";
import type { Column } from "@/components/tables/DataTable";
import { ROUTES } from "@/constants/routes.constants";

const statusOptions: Array<{ label: string; value: NotificationStatus }> = [
  { label: "Draft", value: "draft" },
  { label: "Scheduled", value: "scheduled" },
  { label: "Published", value: "published" },
  { label: "Expired", value: "expired" },
];

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Request failed";
}

export const Route = createFileRoute("/_app/notifications")({ component: NotificationsPage });

function NotificationsPage() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<{ search: string; dropdownValues: Record<string, string> }>({
    search: "",
    dropdownValues: {},
  });
  const [deleteTarget, setDeleteTarget] = useState<NewsNotification | null>(null);

  const params = useMemo(
    () => ({
      page,
      per_page: 10,
      search: filters.search || undefined,
      status: filters.dropdownValues.status as NotificationStatus | undefined,
      language_code: filters.dropdownValues.language || undefined,
      state_id: filters.dropdownValues.state ? Number(filters.dropdownValues.state) : undefined,
    }),
    [filters.dropdownValues, filters.search, page],
  );

  const notificationsQuery = useNotifications(params);
  const statsQuery = useNotificationStats();
  const languagesQuery = useLanguages();
  const regionsQuery = useRegions({ language_code: filters.dropdownValues.language || "en" });
  const deleteMutation = useDeleteNotification();
  const publishMutation = usePublishNotification();
  const sendMutation = useSendNotification();

  const handleFiltersChange = useCallback(
    (nextFilters: { search: string; dropdownValues: Record<string, string> }) => {
      setFilters(nextFilters);
      setPage(1);
    },
    [],
  );

  if (pathname !== ROUTES.NOTIFICATIONS) return <Outlet />;

  const columns: Column<NewsNotification>[] = [
    {
      key: "title",
      header: "Notification",
      cell: (row) => (
        <div className="min-w-[220px]">
          <p className="font-medium text-foreground">{row.title}</p>
          <p className="line-clamp-1 text-xs text-muted-foreground">{row.message || "—"}</p>
        </div>
      ),
    },
    { key: "language", header: "Language", cell: (row) => row.language },
    { key: "state", header: "Target State", cell: (row) => row.state },
    { key: "district", header: "District", cell: (row) => row.district },
    { key: "city", header: "City", cell: (row) => row.city },
    { key: "sent", header: "Sent On", cell: (row) => row.sentOn },
    { key: "reach", header: "Reach", cell: (row) => (row.reach ?? 0).toLocaleString() },
    { key: "open", header: "Open", cell: (row) => (row.open ?? 0).toLocaleString() },
    {
      key: "status",
      header: "Status",
      cell: (row) => <StatusBadge status={notificationStatusLabel(row.status)} />,
    },
    {
      key: "actions",
      header: "Actions",
      cell: (row) => (
        <ActionMenu
          onView={() => navigate({ to: ROUTES.NOTIFICATIONS_VIEW(row.id) })}
          onEdit={() => navigate({ to: ROUTES.NOTIFICATIONS_EDIT(row.id) })}
          onDelete={() => setDeleteTarget(row)}
          extraItems={[
            {
              label: "Publish Now",
              icon: Megaphone,
              onClick: () =>
                publishMutation.mutate(
                  { id: row.id, payload: { scheduled_at: null } },
                  {
                    onSuccess: () => toast.success("Notification published."),
                    onError: (error) => toast.error(getErrorMessage(error)),
                  },
                ),
            },
            {
              label: "Send",
              icon: Send,
              onClick: () =>
                sendMutation.mutate(row.id, {
                  onSuccess: () => toast.success("Notification sent."),
                  onError: (error) => toast.error(getErrorMessage(error)),
                }),
            },
          ]}
        />
      ),
    },
  ];

  const stats = statsQuery.data;

  return (
    <>
      <AdminListPage
        title="News Notifications"
        breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "Notifications" }]}
        actions={
          <Button onClick={() => navigate({ to: ROUTES.NOTIFICATIONS_ADD })}>
            <Plus className="mr-2 h-4 w-4" />
            Create Notification
          </Button>
        }
        stats={[
          { title: "Total Notifications", value: stats?.total ?? 0, icon: Bell, variant: "blue" },
          { title: "Sent Successfully", value: stats?.sentSuccessfully ?? 0, icon: CheckCircle2, variant: "green" },
          { title: "Scheduled", value: stats?.scheduled ?? 0, icon: Clock, variant: "amber" },
          { title: "Total Reach", value: (stats?.totalReach ?? 0).toLocaleString(), icon: Megaphone, variant: "violet" },
          { title: "Failed/Closed", value: stats?.failedOrClosed ?? 0, icon: XCircle, variant: "rose" },
        ]}
        data={notificationsQuery.data?.items ?? []}
        columns={columns}
        rowKey={(row) => row.id}
        searchPlaceholder="Search notification..."
        loading={notificationsQuery.isLoading}
        error={notificationsQuery.isError ? "Unable to load notifications from backend." : undefined}
        page={notificationsQuery.data?.page ?? page}
        pageSize={notificationsQuery.data?.perPage ?? 10}
        total={notificationsQuery.data?.total ?? 0}
        onPageChange={setPage}
        manualPagination
        onFiltersChange={handleFiltersChange}
        dropdowns={[
          { key: "status", placeholder: "Status", options: statusOptions },
          {
            key: "language",
            placeholder: "Language",
            options: (languagesQuery.data?.items ?? []).map((language) => ({
              label: language.name,
              value: language.code,
            })),
          },
          {
            key: "state",
            placeholder: "State",
            options: (regionsQuery.data ?? []).map((state) => ({
              label: state.name,
              value: String(state.id),
            })),
          },
        ]}
      />
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete notification?"
        description="Only draft notifications can be deleted by the backend."
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteMutation.mutate(deleteTarget.id, {
            onSuccess: () => {
              toast.success("Notification deleted.");
              setDeleteTarget(null);
            },
            onError: (error) => toast.error(getErrorMessage(error)),
          });
        }}
      />
    </>
  );
}
