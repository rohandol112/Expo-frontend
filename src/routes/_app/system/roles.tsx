import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown, ChevronUp, Plus, Save, SquarePen, Users } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionCard } from "@/components/admin/SectionCard";
import { PermissionGroup } from "@/components/admin/PermissionGroup";
import { StatsGrid } from "@/components/admin/StatsGrid";
import { Button } from "@/components/ui/button";
import { roles, permissionActions, permissionGroups } from "@/mock/roles.mock";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/routes.constants";

export const Route = createFileRoute("/_app/system/roles")({ component: RolesPage });

function RolesPage() {
  const [selectedRoleId, setSelectedRoleId] = useState(roles[0].id);
  const [expanded, setExpanded] = useState(true);
  const selectedRole = roles.find((role) => role.id === selectedRoleId) ?? roles[0];
  return (
    <div>
      <PageHeader title="Role & Permission Management" breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "System" }, { label: "Roles" }]} actions={<><Button variant="outline"><SquarePen className="mr-2 h-4 w-4" />Edit Role</Button><Button><Plus className="mr-2 h-4 w-4" />Create New Role</Button></>} />
      <StatsGrid items={[{ title: "Total Roles", value: roles.length, icon: Users, variant: "blue" }, { title: "Assigned Users", value: roles.reduce((a, r) => a + r.users, 0), icon: Users, variant: "green" }]} />
      <div className="grid gap-6 xl:grid-cols-[300px_1fr]">
        <SectionCard title="Roles">
          <div className="space-y-2">
            {roles.map((role) => (
              <button key={role.id} onClick={() => setSelectedRoleId(role.id)} className={cn("w-full rounded-lg border p-3 text-left transition", selectedRole.id === role.id ? "border-primary bg-primary/5" : "hover:bg-muted/40")}>
                <p className="font-medium">{role.name}</p>
                <p className="text-xs text-muted-foreground">{role.users} users</p>
              </button>
            ))}
          </div>
        </SectionCard>
        <SectionCard title={selectedRole.name} description={selectedRole.description} action={<div className="flex gap-2"><Button variant="outline" size="sm" onClick={() => setExpanded(true)}><ChevronDown className="mr-2 h-4 w-4" />Expand All</Button><Button variant="outline" size="sm" onClick={() => setExpanded(false)}><ChevronUp className="mr-2 h-4 w-4" />Collapse All</Button><Button size="sm"><Save className="mr-2 h-4 w-4" />Save Changes</Button></div>}>
          {expanded ? <div className="space-y-4">{permissionGroups.map((group) => <PermissionGroup key={group} title={group} permissions={permissionActions} />)}</div> : <p className="text-sm text-muted-foreground">Permission matrix collapsed.</p>}
        </SectionCard>
      </div>
    </div>
  );
}
