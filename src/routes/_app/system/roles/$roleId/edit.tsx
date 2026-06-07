import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ROUTES } from "@/constants/routes.constants";
import { roleRows } from "@/mock/admin-extra.mock";

export const Route = createFileRoute("/_app/system/roles/$roleId/edit")({ component: RoleEditPage });

function RoleEditPage() {
  const { roleId } = Route.useParams();
  const navigate = useNavigate();
  const role = roleRows.find((item) => item.id === roleId) ?? roleRows[0];

  return (
    <div>
      <PageHeader
        title="Edit Role"
        breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "Roles", to: ROUTES.SYS_ROLES }, { label: "Edit Role" }]}
        actions={<Button onClick={() => { toast.success("Role changes saved locally"); navigate({ to: ROUTES.SYS_ROLES }); }}><Save className="mr-2 h-4 w-4" />Save Changes</Button>}
      />
      <section className="rounded-lg border bg-card p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Role Name"><Input defaultValue={role.name} /></Field>
          <Field label="Scope"><Input defaultValue={role.scope} /></Field>
          <Field label="Content Types"><Input defaultValue={role.contentTypes} /></Field>
          <Field label="Status"><Select defaultValue={role.status}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Active">Active</SelectItem><SelectItem value="Inactive">Inactive</SelectItem></SelectContent></Select></Field>
        </div>
        <Field label="Description"><Textarea defaultValue={role.description} className="min-h-28" /></Field>
      </section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="mb-4 space-y-2"><Label>{label}</Label>{children}</div>;
}
