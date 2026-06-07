import { Outlet, createFileRoute, useLocation, useNavigate } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useState } from "react";
import { AdminListPage } from "@/components/admin/AdminListPage";
import { ActionMenu } from "@/components/common/ActionMenu";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import type { AreaItem } from "@/types/location";
import type { Column } from "@/components/tables/DataTable";
import { ROUTES } from "@/constants/routes.constants";
import { useAreas, useDeleteArea, useDistricts, useStates, useUpdateAreaStatus } from "@/hooks/api/useLocations";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/system/location/areas")({ component: AreasPage });

function AreasPage() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  if (pathname !== ROUTES.SYS_AREAS) return <Outlet />;
  const [deleteTarget, setDeleteTarget] = useState<AreaItem | null>(null);
  const statesQuery = useStates({ language_code: "en", per_page: 100 });
  const districtsQuery = useDistricts({ language_code: "en", per_page: 100 });
  const areasQuery = useAreas({ language_code: "en", per_page: 100 });
  const updateStatus = useUpdateAreaStatus();
  const deleteArea = useDeleteArea();
  const states = statesQuery.data?.items ?? [];
  const districts = districtsQuery.data?.items ?? [];
  const stateNameById = new Map(states.map((state) => [state.id, state.name]));
  const districtMetaById = new Map(districts.map((district) => [district.id, { name: district.name, state: stateNameById.get(district.state_id) ?? `State #${district.state_id}` }]));
  const rows: AreaItem[] = (areasQuery.data?.items ?? []).map((area) => {
    const district = districtMetaById.get(area.district_id);
    return {
      id: String(area.id),
      name: area.name,
      district: district?.name ?? `District #${area.district_id}`,
      state: district?.state ?? "—",
      status: area.is_active ? "Active" : "Inactive",
      addedOn: "—",
    };
  });
  const handleStatusToggle = (row: AreaItem) => {
    updateStatus.mutate(
      { id: row.id, isActive: row.status !== "Active" },
      {
        onSuccess: () => toast.success("Area status updated."),
        onError: (error) => toast.error(error instanceof Error ? error.message : "Unable to update area status."),
      },
    );
  };
  const columns: Column<AreaItem>[] = [
    { key: "name", header: "Area Name", cell: (r) => <span className="font-medium">{r.name}</span> },
    { key: "district", header: "District", cell: (r) => r.district },
    { key: "state", header: "State", cell: (r) => r.state },
    { key: "status", header: "Status", cell: (r) => <StatusBadge status={r.status} /> },
    { key: "added", header: "Added On", cell: (r) => r.addedOn },
    {
      key: "actions",
      header: "Actions",
      cell: (row) => (
        <ActionMenu
          onEdit={() => navigate({ to: "/system/location/areas/$areaId/edit", params: { areaId: row.id } })}
          onDelete={() => setDeleteTarget(row)}
          extraItems={[{ label: row.status === "Active" ? "Mark Inactive" : "Mark Active", onClick: () => handleStatusToggle(row) }]}
        />
      ),
    },
  ];
  return (
    <>
      <AdminListPage title="Areas" breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "Locations", to: ROUTES.SYS_LOCATION }, { label: "Areas" }]} actions={<Button onClick={() => navigate({ to: ROUTES.SYS_AREAS_ADD })}><Plus className="mr-2 h-4 w-4" />Add Area</Button>} data={rows} columns={columns} rowKey={(r) => r.id} loading={areasQuery.isLoading || districtsQuery.isLoading || statesQuery.isLoading} error={areasQuery.error ? "Unable to load areas from backend." : undefined} searchPlaceholder="Search area..." dropdowns={[{ key: "district", placeholder: "District", options: districts.map((d) => ({ label: d.name, value: d.name })) }, { key: "state", placeholder: "State", options: states.map((s) => ({ label: s.name, value: s.name })) }]} filter={(row, search) => [row.name, row.district, row.state].some((v) => v.toLowerCase().includes(search.toLowerCase()))} />
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete area?"
        description={`This will delete ${deleteTarget?.name ?? "this area"} from the backend.`}
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteArea.mutate(deleteTarget.id, {
            onSuccess: () => {
              toast.success("Area deleted.");
              setDeleteTarget(null);
            },
            onError: (error) => toast.error(error instanceof Error ? error.message : "Unable to delete area."),
          });
        }}
      />
    </>
  );
}
