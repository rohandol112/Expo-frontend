import { Outlet, createFileRoute, useLocation, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Eye, Filter, MoreVertical, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAdminRoles, useDeleteAdminRole, useUpdateAdminRole } from "@/hooks/api/useAdminRoles";
import { useLanguages } from "@/hooks/api/useLanguages";
import { useRegions } from "@/hooks/api/useRegions";
import type { AdminRole } from "@/types/adminRole";
import { ROUTES } from "@/constants/routes.constants";
import { formatDateTime } from "@/components/competition/bannerReview";

export const Route = createFileRoute("/_app/system/roles")({ component: RolesPage });

function RolesPage() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [search, setSearch] = useState("");
  const [toDelete, setToDelete] = useState<AdminRole | null>(null);

  const rolesQuery = useAdminRoles();
  const deleteRole = useDeleteAdminRole();
  const updateRole = useUpdateAdminRole();
  const languagesQuery = useLanguages();
  const regionsQuery = useRegions();

  const langName = useMemo(
    () => new Map((languagesQuery.data?.items ?? []).map((l) => [l.code, l.name])),
    [languagesQuery.data],
  );
  const stateName = useMemo(
    () => new Map((regionsQuery.data ?? []).map((s) => [s.id, s.name])),
    [regionsQuery.data],
  );

  const roles = useMemo(() => {
    const all = rolesQuery.data ?? [];
    const needle = search.trim().toLowerCase();
    if (!needle) return all;
    return all.filter((r) => r.name.toLowerCase().includes(needle) || r.description.toLowerCase().includes(needle));
  }, [rolesQuery.data, search]);

  if (pathname !== ROUTES.SYS_ROLES) return <Outlet />;

  const scopeLabel = (r: AdminRole) => {
    const parts = [
      ...(r.scope.language_codes ?? []).map((c) => langName.get(c) ?? c),
      ...(r.scope.state_ids ?? []).map((id) => stateName.get(id)).filter(Boolean),
    ];
    return parts.length ? parts.join(", ") : "All Languages, All Locations";
  };

  return (
    <div>
      <PageHeader
        title="Role & Permission Management"
        description="Manage roles and their access permissions in the system."
        breadcrumbs={[
          { label: "Dashboard", to: ROUTES.DASHBOARD },
          { label: "System Management" },
          { label: "Role & Permission Management" },
        ]}
        actions={
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => navigate({ to: ROUTES.SYS_ROLES_ADD })}>
            <Plus className="mr-2 h-4 w-4" /> Add Role
          </Button>
        }
      />

      <div className="rounded-xl border bg-card shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
          <div>
            <h3 className="text-sm font-bold text-foreground">Role Management</h3>
            <p className="text-xs text-muted-foreground">Below is the list of all roles created in the system.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by role name or description…"
                className="w-[260px] pl-9"
              />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" /> Filter
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 text-[11px] font-semibold uppercase text-muted-foreground">
              <tr>
                <th className="w-12 p-3">#</th>
                <th className="p-3">Role Name</th>
                <th className="w-[24%] p-3">Role Description</th>
                <th className="p-3">Scope</th>
                <th className="p-3 text-center">Total Permissions</th>
                <th className="p-3 text-center">Content Types</th>
                <th className="p-3">Status</th>
                <th className="p-3">Created At</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rolesQuery.isLoading ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-muted-foreground">
                    Loading roles…
                  </td>
                </tr>
              ) : roles.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-muted-foreground">
                    No roles found. Create your first role with “Add Role”.
                  </td>
                </tr>
              ) : (
                roles.map((r, idx) => (
                  <tr key={r.id} className="align-middle transition-colors hover:bg-muted/30">
                    <td className="p-3 text-muted-foreground">{idx + 1}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground">{r.name}</span>
                        {r.is_system && (
                          <span className="rounded bg-violet-50 px-1.5 py-0.5 text-[10px] font-bold text-violet-700">
                            System Role
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground">{r.users_count} user(s)</p>
                    </td>
                    <td className="p-3 text-slate-600">{r.description || "—"}</td>
                    <td className="max-w-[180px] truncate p-3 text-slate-600">{scopeLabel(r)}</td>
                    <td className="p-3 text-center font-semibold text-slate-700">{r.total_permissions}</td>
                    <td className="p-3 text-center text-slate-600">{r.content_types_count || "—"}</td>
                    <td className="p-3">
                      <StatusBadge status={r.is_active ? "Active" : "Inactive"} />
                    </td>
                    <td className="whitespace-nowrap p-3 text-slate-600">{formatDateTime(r.created_at)}</td>
                    <td className="p-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-600"
                          onClick={() => navigate({ to: "/system/roles/$roleId", params: { roleId: String(r.id) } })}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-600">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="text-xs">
                            <DropdownMenuItem
                              onClick={() => navigate({ to: "/system/roles/$roleId/edit", params: { roleId: String(r.id) } })}
                              disabled={r.is_system}
                            >
                              Edit Role
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                updateRole.mutate(
                                  { id: r.id, patch: { is_active: !r.is_active } },
                                  {
                                    onSuccess: () => toast.success(r.is_active ? "Role deactivated" : "Role activated"),
                                    onError: (err) => toast.error(err instanceof Error ? err.message : "Update failed"),
                                  },
                                )
                              }
                            >
                              {r.is_active ? "Deactivate" : "Activate"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-rose-600"
                              disabled={r.is_system}
                              onClick={() => setToDelete(r)}
                            >
                              <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t px-4 py-3 text-sm text-muted-foreground">
          Showing 1 to {roles.length} of {roles.length} roles
        </div>
      </div>

      <AlertDialog open={Boolean(toDelete)} onOpenChange={(open) => !open && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete role “{toDelete?.name}”?</AlertDialogTitle>
            <AlertDialogDescription>
              This cannot be undone. Roles that are assigned to users cannot be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-rose-600 hover:bg-rose-700"
              onClick={() =>
                toDelete &&
                deleteRole.mutate(toDelete.id, {
                  onSuccess: () => {
                    toast.success("Role deleted");
                    setToDelete(null);
                  },
                  onError: (err) => toast.error(err instanceof Error ? err.message : "Delete failed"),
                })
              }
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
