import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { RoleWizard } from "@/components/roles/RoleWizard";
import { useCreateAdminRole } from "@/hooks/api/useAdminRoles";
import { ROUTES } from "@/constants/routes.constants";

export const Route = createFileRoute("/_app/system/roles/add")({ component: AddRolePage });

function AddRolePage() {
  const navigate = useNavigate();
  const createRole = useCreateAdminRole();

  return (
    <div>
      <PageHeader
        title="Role & Permission Management"
        description="Create a new role and manage access permissions."
        breadcrumbs={[
          { label: "Dashboard", to: ROUTES.DASHBOARD },
          { label: "Role & Permission", to: ROUTES.SYS_ROLES },
          { label: "Add Role" },
        ]}
      />
      <RoleWizard
        submitLabel="Create Role"
        saving={createRole.isPending}
        onCancel={() => navigate({ to: ROUTES.SYS_ROLES })}
        onSubmit={(data) =>
          createRole.mutate(data, {
            onSuccess: () => {
              toast.success("Role created");
              navigate({ to: ROUTES.SYS_ROLES });
            },
            onError: (err) => toast.error(err instanceof Error ? err.message : "Could not create role"),
          })
        }
      />
    </div>
  );
}
