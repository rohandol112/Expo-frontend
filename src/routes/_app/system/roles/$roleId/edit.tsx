import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { RoleWizard } from "@/components/roles/RoleWizard";
import { useAdminRole, useUpdateAdminRole } from "@/hooks/api/useAdminRoles";
import { ROUTES } from "@/constants/routes.constants";

export const Route = createFileRoute("/_app/system/roles/$roleId/edit")({ component: RoleEditPage });

function RoleEditPage() {
  const { roleId } = Route.useParams();
  const navigate = useNavigate();
  const roleQuery = useAdminRole(roleId);
  const updateRole = useUpdateAdminRole();

  if (roleQuery.isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading role…</div>;
  }
  const role = roleQuery.data;
  if (!role) {
    return <div className="p-8 text-center text-muted-foreground">Role not found.</div>;
  }

  return (
    <div>
      <PageHeader
        title={`Edit Role — ${role.name}`}
        description="Update role details and access permissions."
        breadcrumbs={[
          { label: "Dashboard", to: ROUTES.DASHBOARD },
          { label: "Role & Permission", to: ROUTES.SYS_ROLES },
          { label: role.name },
          { label: "Edit" },
        ]}
      />
      <RoleWizard
        initial={role}
        submitLabel="Save Changes"
        saving={updateRole.isPending}
        onCancel={() => navigate({ to: ROUTES.SYS_ROLES })}
        onSubmit={(data) =>
          updateRole.mutate(
            { id: role.id, patch: data },
            {
              onSuccess: () => {
                toast.success("Role updated");
                navigate({ to: ROUTES.SYS_ROLES });
              },
              onError: (err) => toast.error(err instanceof Error ? err.message : "Could not update role"),
            },
          )
        }
      />
    </div>
  );
}
