import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Calendar, Pencil, Shield, User, Users } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { RolePermissionMatrix } from "@/components/roles/RolePermissionMatrix";
import { useAdminRole, useUpdateAdminRole } from "@/hooks/api/useAdminRoles";
import type { AdminRoleInput } from "@/types/adminRole";
import { ROUTES } from "@/constants/routes.constants";
import { formatDate } from "@/components/competition/bannerReview";

export const Route = createFileRoute("/_app/system/roles/$roleId/")({ component: RoleDetailPage });

function RoleDetailPage() {
  const { roleId } = Route.useParams();
  const navigate = useNavigate();
  const roleQuery = useAdminRole(roleId);
  const updateRole = useUpdateAdminRole();
  const [permissions, setPermissions] = useState<NonNullable<AdminRoleInput["permissions"]>>({});

  const role = roleQuery.data;

  useEffect(() => {
    if (role) setPermissions(role.permissions);
  }, [role]);

  if (roleQuery.isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading role…</div>;
  }
  if (!role) {
    return <div className="p-8 text-center text-muted-foreground">Role not found.</div>;
  }

  const tiles = [
    { icon: Users, label: "Users", value: String(role.users_count) },
    { icon: Shield, label: "Permissions", value: String(role.total_permissions) },
    { icon: Calendar, label: "Created On", value: formatDate(role.created_at) },
    { icon: User, label: "Created By", value: role.is_system ? "System" : "Admin" },
  ];

  return (
    <div>
      <PageHeader
        title={
          <span className="flex items-center gap-3">
            {role.name}
            {role.is_system && (
              <span className="rounded bg-violet-50 px-2 py-0.5 text-xs font-bold text-violet-700">System Role</span>
            )}
            <StatusBadge status={role.is_active ? "Active" : "Inactive"} />
          </span>
        }
        description={role.description || "No description."}
        breadcrumbs={[
          { label: "Dashboard", to: ROUTES.DASHBOARD },
          { label: "Role & Permission", to: ROUTES.SYS_ROLES },
          { label: role.name },
        ]}
        actions={
          <Button
            variant="outline"
            disabled={role.is_system}
            onClick={() => navigate({ to: "/system/roles/$roleId/edit", params: { roleId } })}
          >
            <Pencil className="mr-2 h-4 w-4" /> Edit Role
          </Button>
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {tiles.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center gap-3 rounded-xl border bg-card p-4 shadow-sm">
            <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-sm font-bold text-foreground">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-foreground">Role Permissions</h3>
          <p className="text-xs text-muted-foreground">Manage what this role can access and perform.</p>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700"
          disabled={role.is_system || updateRole.isPending}
          onClick={() =>
            updateRole.mutate(
              { id: role.id, patch: { permissions } },
              {
                onSuccess: () => toast.success("Permissions saved"),
                onError: (err) => toast.error(err instanceof Error ? err.message : "Save failed"),
              },
            )
          }
        >
          {updateRole.isPending ? "Saving…" : "Save Changes"}
        </Button>
      </div>

      <RolePermissionMatrix value={permissions} onChange={setPermissions} disabled={role.is_system} />
    </div>
  );
}
