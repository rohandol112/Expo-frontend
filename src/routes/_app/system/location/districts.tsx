import { Outlet, createFileRoute, useLocation, useNavigate } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useState } from "react";
import { AdminListPage } from "@/components/admin/AdminListPage";
import { ActionMenu } from "@/components/common/ActionMenu";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import type { DistrictItem } from "@/types/location";
import type { Column } from "@/components/tables/DataTable";
import { ROUTES } from "@/constants/routes.constants";
import { useDeleteDistrict, useDistricts, useStates, useUpdateDistrictStatus } from "@/hooks/api/useLocations";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/system/location/districts")({ component: DistrictsPage });

function DistrictsPage() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  if (pathname !== ROUTES.SYS_DISTRICTS) return <Outlet />;
  const [deleteTarget, setDeleteTarget] = useState<DistrictItem | null>(null);
  const statesQuery = useStates({ language_code: "hi", per_page: 100 });
  const districtsQuery = useDistricts({ language_code: "hi", per_page: 100 });
  const updateStatus = useUpdateDistrictStatus();
  const deleteDistrict = useDeleteDistrict();
  const states = statesQuery.data?.items ?? [];
  const stateNameById = new Map(states.map((state) => [state.id, state.name]));
  const rows: DistrictItem[] = (districtsQuery.data?.items ?? []).map((district) => ({
    id: String(district.id),
    name: district.name,
    state: stateNameById.get(district.state_id) ?? `State #${district.state_id}`,
    status: district.is_active ? "Active" : "Inactive",
    addedOn: "—",
  }));
  const handleStatusToggle = (row: DistrictItem) => {
    updateStatus.mutate(
      { id: row.id, isActive: row.status !== "Active" },
      {
        onSuccess: () => toast.success("District status updated."),
        onError: (error) => toast.error(error instanceof Error ? error.message : "Unable to update district status."),
      },
    );
  };
  const columns: Column<DistrictItem>[] = [
    { key: "name", header: "District Name", cell: (r) => <span className="font-medium">{r.name}</span> },
    { key: "state", header: "State", cell: (r) => r.state },
    { key: "status", header: "Status", cell: (r) => <StatusBadge status={r.status} /> },
    { key: "added", header: "Added On", cell: (r) => r.addedOn },
    {
      key: "actions",
      header: "Actions",
      cell: (row) => (
        <ActionMenu
          onEdit={() => navigate({ to: "/system/location/districts/$districtId/edit", params: { districtId: row.id } })}
          onDelete={() => setDeleteTarget(row)}
          extraItems={[{ label: row.status === "Active" ? "Mark Inactive" : "Mark Active", onClick: () => handleStatusToggle(row) }]}
        />
      ),
    },
  ];
  return (
    <>
      <AdminListPage title="Districts" breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "Locations", to: ROUTES.SYS_LOCATION }, { label: "Districts" }]} actions={<Button onClick={() => navigate({ to: ROUTES.SYS_DISTRICTS_ADD })}><Plus className="mr-2 h-4 w-4" />Add District</Button>} data={rows} columns={columns} rowKey={(r) => r.id} loading={districtsQuery.isLoading || statesQuery.isLoading} error={districtsQuery.error ? "Unable to load districts from backend." : undefined} searchPlaceholder="Search district..." dropdowns={[{ key: "state", placeholder: "State", options: states.map((s) => ({ label: s.name, value: s.name })) }, { key: "status", placeholder: "Status", options: ["Active", "Inactive"].map((s) => ({ label: s, value: s })) }]} filter={(row, search, df) => {
      const term = search.toLowerCase();
      if (term && !(row.name.toLowerCase().includes(term) || row.state.toLowerCase().includes(term))) return false;
      if (df.state && row.state !== df.state) return false;
      if (df.status && row.status !== df.status) return false;
      return true;
    }} />
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete district?"
        description={`This will delete ${deleteTarget?.name ?? "this district"} from the backend.`}
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteDistrict.mutate(deleteTarget.id, {
            onSuccess: () => {
              toast.success("District deleted.");
              setDeleteTarget(null);
            },
            onError: (error) => toast.error(error instanceof Error ? error.message : "Unable to delete district."),
          });
        }}
      />
    </>
  );
}
