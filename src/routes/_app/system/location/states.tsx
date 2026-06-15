import { Outlet, createFileRoute, useLocation, useNavigate } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useState } from "react";
import { AdminListPage } from "@/components/admin/AdminListPage";
import { ActionMenu } from "@/components/common/ActionMenu";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import type { StateItem } from "@/types/location";
import type { Column } from "@/components/tables/DataTable";
import { ROUTES } from "@/constants/routes.constants";
import { useDeleteState, useStates, useUpdateStateStatus } from "@/hooks/api/useLocations";
import { useLanguages } from "@/hooks/api/useLanguages";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/system/location/states")({ component: StatesPage });

function formatDateTime(value?: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function StatesPage() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  if (pathname !== ROUTES.SYS_STATES) return <Outlet />;
  const [deleteTarget, setDeleteTarget] = useState<StateItem | null>(null);
  const statesQuery = useStates({ per_page: 100 });
  const languagesQuery = useLanguages();
  const updateStatus = useUpdateStateStatus();
  const deleteState = useDeleteState();
  const rows: StateItem[] = (statesQuery.data?.items ?? []).map((state) => ({
    id: String(state.id),
    language: state.language_code,
    name: state.name,
    code: state.code,
    status: state.is_active ? "Active" : "Inactive",
    addedOn: formatDateTime(state.created_at),
  }));
  const handleStatusToggle = (row: StateItem) => {
    updateStatus.mutate(
      { id: row.id, isActive: row.status !== "Active" },
      {
        onSuccess: () => toast.success("State status updated."),
        onError: (error) => toast.error(error instanceof Error ? error.message : "Unable to update state status."),
      },
    );
  };
  const columns: Column<StateItem>[] = [
    { key: "language", header: "Language", cell: (r) => r.language.toUpperCase() },
    { key: "name", header: "State Name", cell: (r) => <span className="font-medium">{r.name}</span> },
    { key: "code", header: "State Code", cell: (r) => r.code },
    { key: "status", header: "Status", cell: (r) => <StatusBadge status={r.status} /> },
    { key: "added", header: "Added On", cell: (r) => r.addedOn },
    {
      key: "actions",
      header: "Actions",
      cell: (row) => (
        <ActionMenu
          onEdit={() => navigate({ to: "/system/location/states/$stateId/edit", params: { stateId: row.id } })}
          onDelete={() => setDeleteTarget(row)}
          extraItems={[{ label: row.status === "Active" ? "Mark Inactive" : "Mark Active", onClick: () => handleStatusToggle(row) }]}
        />
      ),
    },
  ];
  return (
    <>
      <AdminListPage title="States" breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "Locations", to: ROUTES.SYS_LOCATION }, { label: "States" }]} actions={<Button onClick={() => navigate({ to: ROUTES.SYS_STATES_ADD })}><Plus className="mr-2 h-4 w-4" />Add State</Button>} data={rows} columns={columns} rowKey={(r) => r.id} loading={statesQuery.isLoading} error={statesQuery.error ? "Unable to load states from backend." : undefined} searchPlaceholder="Search state..." dropdowns={[{ key: "language", placeholder: "Language", options: (languagesQuery.data?.items ?? []).map((l) => ({ label: l.name, value: l.code })) }, { key: "status", placeholder: "Status", options: ["Active", "Inactive"].map((s) => ({ label: s, value: s })) }]} filter={(row, search, df) => {
      const term = search.toLowerCase();
      if (term && !(row.name.toLowerCase().includes(term) || row.code.toLowerCase().includes(term))) return false;
      if (df.language && row.language !== df.language) return false;
      if (df.status && row.status !== df.status) return false;
      return true;
    }} />
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete state?"
        description={`This will delete ${deleteTarget?.name ?? "this state"} from the backend.`}
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteState.mutate(deleteTarget.id, {
            onSuccess: () => {
              toast.success("State deleted.");
              setDeleteTarget(null);
            },
            onError: (error) => toast.error(error instanceof Error ? error.message : "Unable to delete state."),
          });
        }}
      />
    </>
  );
}
