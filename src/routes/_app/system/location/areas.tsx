import { Outlet, createFileRoute, useLocation, useNavigate } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { AdminListPage } from "@/components/admin/AdminListPage";
import { ActionMenu } from "@/components/common/ActionMenu";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { areas, districts, states } from "@/mock/location.mock";
import type { AreaItem } from "@/types/location";
import type { Column } from "@/components/tables/DataTable";
import { ROUTES } from "@/constants/routes.constants";

export const Route = createFileRoute("/_app/system/location/areas")({ component: AreasPage });

function AreasPage() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  if (pathname !== ROUTES.SYS_AREAS) return <Outlet />;
  const columns: Column<AreaItem>[] = [
    { key: "name", header: "Area Name", cell: (r) => <span className="font-medium">{r.name}</span> },
    { key: "district", header: "District", cell: (r) => r.district },
    { key: "state", header: "State", cell: (r) => r.state },
    { key: "status", header: "Status", cell: (r) => <StatusBadge status={r.status} /> },
    { key: "added", header: "Added On", cell: (r) => r.addedOn },
    { key: "actions", header: "Actions", cell: () => <ActionMenu /> },
  ];
  return <AdminListPage title="Areas" breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "Locations", to: ROUTES.SYS_LOCATION }, { label: "Areas" }]} actions={<Button onClick={() => navigate({ to: ROUTES.SYS_AREAS_ADD })}><Plus className="mr-2 h-4 w-4" />Add Area</Button>} data={areas} columns={columns} rowKey={(r) => r.id} searchPlaceholder="Search area..." dropdowns={[{ key: "district", placeholder: "District", options: districts.map((d) => ({ label: d.name, value: d.name })) }, { key: "state", placeholder: "State", options: states.map((s) => ({ label: s.name, value: s.name })) }]} filter={(row, search) => [row.name, row.district, row.state].some((v) => v.toLowerCase().includes(search.toLowerCase()))} />;
}
