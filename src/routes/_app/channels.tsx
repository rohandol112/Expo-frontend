import { Outlet, createFileRoute, useLocation, useNavigate } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useMemo } from "react";
import { useState } from "react";
import { AdminListPage } from "@/components/admin/AdminListPage";
import { ActionMenu } from "@/components/common/ActionMenu";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import type { Channel } from "@/types/channel";
import type { Column } from "@/components/tables/DataTable";
import { ROUTES } from "@/constants/routes.constants";
import { useChannels, useDeleteChannel, useUpdateChannel } from "@/hooks/api/useChannels";
import { useLanguages } from "@/hooks/api/useLanguages";
import { useRegions } from "@/hooks/api/useRegions";
import { isAuthApiError } from "@/lib/apiError";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/channels")({ component: ChannelsPage });

function ChannelsPage() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  if (pathname !== ROUTES.CHANNELS) return <Outlet />;
  const [deleteTarget, setDeleteTarget] = useState<Channel | null>(null);
  const channelsQuery = useChannels();
  const languagesQuery = useLanguages();
  const regionsQuery = useRegions();
  const deleteChannel = useDeleteChannel();
  const updateChannel = useUpdateChannel();
  const rows = channelsQuery.data?.items ?? [];
  const states = regionsQuery.data ?? [];
  const districts = useMemo(() => states.flatMap((state) => state.districts), [states]);
  const areas = useMemo(() => districts.flatMap((district) => district.areas), [districts]);
  const error = channelsQuery.error ? "Unable to load channels from backend." : undefined;
  const columns: Column<Channel>[] = [
    {
      key: "name",
      header: "Channel Name",
      cell: (r) => (
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded bg-primary/10 text-xs font-semibold text-primary">
            {r.logoUrl ? <img src={r.logoUrl} alt="" className="h-full w-full object-cover" /> : r.logo}
          </div>
          <span className="truncate font-medium">{r.name}</span>
        </div>
      ),
    },
    { key: "language", header: "Language", cell: (r) => r.language },
    { key: "state", header: "State", cell: (r) => r.state },
    { key: "district", header: "District", cell: (r) => r.district },
    { key: "areas", header: "Area/Cities", cell: (r) => r.areas.join(", ") },
    { key: "posts", header: "No. of Posts", cell: (r) => r.posts.toLocaleString() },
    { key: "subscribers", header: "Subscribers", cell: (r) => r.subscribers.toLocaleString() },
    { key: "status", header: "Status", cell: (r) => <StatusBadge status={r.status} /> },
    { key: "added", header: "Added On", cell: (r) => r.addedOn },
    {
      key: "actions",
      header: "Actions",
      cell: (r) => (
        <ActionMenu
          onView={() => navigate({ to: "/channels/$channelId", params: { channelId: r.id } })}
          onEdit={() => navigate({ to: "/channels/$channelId/edit", params: { channelId: r.id } })}
          onDelete={() => setDeleteTarget(r)}
          extraItems={[
            {
              label: r.status === "Active" ? "Mark Inactive" : "Mark Active",
              onClick: async () => {
                try {
                  await updateChannel.mutateAsync({ id: r.id, payload: { is_active: r.status !== "Active" } });
                  toast.success("Channel status updated");
                } catch (err) {
                  toast.error(isAuthApiError(err) ? "Backend admin auth is required to update channel status." : "Unable to update channel status");
                }
              },
            },
          ]}
        />
      ),
    },
  ];
  return <>
    <AdminListPage title="Channels" breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "Channels" }]} actions={<Button onClick={() => navigate({ to: ROUTES.CHANNELS_ADD })}><Plus className="mr-2 h-4 w-4" />Add Channel</Button>} data={rows} columns={columns} rowKey={(r) => r.id} loading={channelsQuery.isLoading} error={error} searchPlaceholder="Search channel..." dropdowns={[{ key: "language", placeholder: "Language", options: (languagesQuery.data?.items ?? []).map((l) => ({ label: l.name, value: l.name })) }, { key: "state", placeholder: "State", options: states.map((s) => ({ label: s.name, value: s.name })) }, { key: "district", placeholder: "District", options: districts.map((d) => ({ label: d.name, value: d.name })) }, { key: "area", placeholder: "Area/City", options: areas.map((a) => ({ label: a.name, value: a.name })) }, { key: "status", placeholder: "Status", options: ["Active", "Inactive"].map((s) => ({ label: s, value: s })) }]} filter={(row, search, df) => {
      const term = search.toLowerCase();
      if (term && !(row.name.toLowerCase().includes(term) || row.language.toLowerCase().includes(term))) return false;
      if (df.language && row.language !== df.language) return false;
      if (df.state && row.state !== df.state) return false;
      if (df.district && row.district !== df.district) return false;
      if (df.area && !row.areas.includes(df.area)) return false;
      if (df.status && row.status !== df.status) return false;
      return true;
    }} />
    <ConfirmDialog
      open={Boolean(deleteTarget)}
      onOpenChange={(open) => !open && setDeleteTarget(null)}
      title="Delete channel?"
      description={`This will delete ${deleteTarget?.name ?? "this channel"} if the backend allows it.`}
      confirmLabel={deleteChannel.isPending ? "Deleting..." : "Delete"}
      destructive
      onConfirm={async () => {
        if (!deleteTarget) return;
        try {
          await deleteChannel.mutateAsync(deleteTarget.id);
          toast.success("Channel deleted");
          setDeleteTarget(null);
        } catch (err) {
          toast.error(isAuthApiError(err) ? "Backend admin auth is required to delete channel." : "Unable to delete channel");
        }
      }}
    />
  </>;
}
