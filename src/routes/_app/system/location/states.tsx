import { Outlet, createFileRoute, useLocation, useNavigate } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { AdminListPage } from "@/components/admin/AdminListPage";
import { ActionMenu } from "@/components/common/ActionMenu";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { states } from "@/mock/location.mock";
import type { StateItem } from "@/types/location";
import type { Column } from "@/components/tables/DataTable";
import { ROUTES } from "@/constants/routes.constants";

export const Route = createFileRoute("/_app/system/location/states")({ component: StatesPage });

function StatesPage() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  if (pathname !== ROUTES.SYS_STATES) return <Outlet />;
  const columns: Column<StateItem>[] = [
    { key: "name", header: "State Name", cell: (r) => <span className="font-medium">{r.name}</span> },
    { key: "code", header: "State Code", cell: (r) => r.code },
    { key: "status", header: "Status", cell: (r) => <StatusBadge status={r.status} /> },
    { key: "added", header: "Added On", cell: (r) => r.addedOn },
    { key: "actions", header: "Actions", cell: () => <ActionMenu /> },
  ];
  return <AdminListPage title="States" breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "Locations", to: ROUTES.SYS_LOCATION }, { label: "States" }]} actions={<Button onClick={() => navigate({ to: ROUTES.SYS_STATES_ADD })}><Plus className="mr-2 h-4 w-4" />Add State</Button>} data={states} columns={columns} rowKey={(r) => r.id} searchPlaceholder="Search state..." dropdowns={[{ key: "status", placeholder: "Status", options: ["Active", "Inactive"].map((s) => ({ label: s, value: s })) }]} filter={(row, search) => row.name.toLowerCase().includes(search.toLowerCase()) || row.code.toLowerCase().includes(search.toLowerCase())} />;
}
