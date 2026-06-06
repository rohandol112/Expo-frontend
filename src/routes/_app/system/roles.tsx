import { createFileRoute, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { Filter, Plus, Search } from "lucide-react";
import { ActionMenu } from "@/components/common/ActionMenu";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable, type Column } from "@/components/tables/DataTable";
import { ROUTES } from "@/constants/routes.constants";
import { roleRows, type RoleRow } from "@/mock/admin-extra.mock";

export const Route = createFileRoute("/_app/system/roles")({ component: RolesPage });

function RolesPage() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  if (pathname !== ROUTES.SYS_ROLES) return <Outlet />;

  const columns: Column<RoleRow>[] = [
    { key: "name", header: "Role Name", cell: (row) => <span className="font-medium">{row.name}</span> },
    { key: "description", header: "Role Description", cell: (row) => <span className="text-muted-foreground">{row.description}</span> },
    { key: "scope", header: "Scope", cell: (row) => row.scope },
    { key: "permissions", header: "Total Permissions", cell: (row) => row.permissions },
    { key: "contentTypes", header: "Content Types", cell: (row) => row.contentTypes },
    { key: "status", header: "Status", cell: (row) => <StatusBadge status={row.status} /> },
    { key: "createdAt", header: "Created At", cell: (row) => row.createdAt },
    {
      key: "actions",
      header: "Actions",
      cell: (row) => (
        <ActionMenu
          onView={() => navigate({ to: "/system/roles/$roleId", params: { roleId: row.id } })}
          onEdit={() => navigate({ to: "/system/roles/$roleId/edit", params: { roleId: row.id } })}
          extraItems={[{ label: "Duplicate" }, { label: "Permissions" }]}
        />
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Role Management"
        breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "System Management" }, { label: "Roles" }]}
        actions={<Button onClick={() => navigate({ to: ROUTES.SYS_ROLES_ADD })}><Plus className="mr-2 h-4 w-4" />Add Role</Button>}
      />
      <div className="mb-4 flex flex-col gap-3 rounded-lg border bg-card p-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search by role name or description" />
        </div>
        <Button variant="outline"><Filter className="mr-2 h-4 w-4" />Filter</Button>
      </div>
      <DataTable columns={columns} data={roleRows} rowKey={(row) => row.id} pageSize={10} total={roleRows.length} />
    </div>
  );
}
