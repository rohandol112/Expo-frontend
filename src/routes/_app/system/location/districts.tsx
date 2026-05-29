import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { AdminListPage } from "@/components/admin/AdminListPage";
import { ActionMenu } from "@/components/common/ActionMenu";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { districts, states } from "@/mock/location.mock";
import type { DistrictItem } from "@/types/location";
import type { Column } from "@/components/tables/DataTable";
import { ROUTES } from "@/constants/routes.constants";

export const Route = createFileRoute("/_app/system/location/districts")({ component: DistrictsPage });

function DistrictsPage() {
  const columns: Column<DistrictItem>[] = [
    { key: "name", header: "District Name", cell: (r) => <span className="font-medium">{r.name}</span> },
    { key: "state", header: "State", cell: (r) => r.state },
    { key: "status", header: "Status", cell: (r) => <StatusBadge status={r.status} /> },
    { key: "added", header: "Added On", cell: (r) => r.addedOn },
    { key: "actions", header: "Actions", cell: () => <ActionMenu /> },
  ];
  return <AdminListPage title="Districts" breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "Locations", to: ROUTES.SYS_LOCATION }, { label: "Districts" }]} actions={<Button><Plus className="mr-2 h-4 w-4" />Add District</Button>} data={districts} columns={columns} rowKey={(r) => r.id} searchPlaceholder="Search district..." dropdowns={[{ key: "state", placeholder: "State", options: states.map((s) => ({ label: s.name, value: s.name })) }, { key: "status", placeholder: "Status", options: ["Active", "Inactive"].map((s) => ({ label: s, value: s })) }]} filter={(row, search) => row.name.toLowerCase().includes(search.toLowerCase()) || row.state.toLowerCase().includes(search.toLowerCase())} />;
}
