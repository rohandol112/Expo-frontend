import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Edit, Shield, Users, KeyRound } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatsCard } from "@/components/common/StatsCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes.constants";
import { roleRows } from "@/mock/admin-extra.mock";

export const Route = createFileRoute("/_app/system/roles/$roleId/")({ component: RoleDetailPage });

function RoleDetailPage() {
  const { roleId } = Route.useParams();
  const navigate = useNavigate();
  const role = roleRows.find((item) => item.id === roleId) ?? roleRows[0];

  return (
    <div>
      <PageHeader
        title={role.name}
        breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "Roles", to: ROUTES.SYS_ROLES }, { label: "View Role" }]}
        actions={<Button onClick={() => navigate({ to: "/system/roles/$roleId/edit", params: { roleId } })}><Edit className="mr-2 h-4 w-4" />Edit Role</Button>}
      />
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <StatsCard title="Total Permissions" value={role.permissions} icon={KeyRound} variant="blue" />
        <StatsCard title="Assigned Users" value="0" icon={Users} variant="green" />
        <StatsCard title="Scope" value={role.scope} icon={Shield} variant="violet" />
      </div>
      <section className="rounded-lg border bg-card p-6">
        <div className="grid gap-5 md:grid-cols-2">
          <Detail label="Role Name" value={role.name} />
          <Detail label="Status" value={<StatusBadge status={role.status} />} />
          <Detail label="Description" value={role.description} />
          <Detail label="Content Types" value={role.contentTypes} />
          <Detail label="Created At" value={role.createdAt} />
          <Detail label="Scope" value={role.scope} />
        </div>
      </section>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return <div><p className="text-xs font-semibold uppercase text-muted-foreground">{label}</p><div className="mt-1 text-sm font-medium">{value}</div></div>;
}
