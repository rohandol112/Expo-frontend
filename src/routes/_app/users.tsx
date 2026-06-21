import { createFileRoute } from "@tanstack/react-router";
import { Ban, CheckCircle2, FileText, UserCheck, UserPlus, Users as UsersIcon, UserX } from "lucide-react";
import { useMemo, useState } from "react";
import { AdminListPage, type AdminListQuery } from "@/components/admin/AdminListPage";
import { ActionMenu } from "@/components/common/ActionMenu";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { StatusBadge } from "@/components/common/StatusBadge";
import { useUsers, useUserStats, useUpdateUserStatus, useDeleteUser } from "@/hooks/api/useUsers";
import { useLanguages } from "@/hooks/api/useLanguages";
import { useRegions } from "@/hooks/api/useRegions";
import type { AdminUser } from "@/types/user";
import type { Column } from "@/components/tables/DataTable";
import { ROUTES } from "@/constants/routes.constants";
import { isAuthApiError } from "@/lib/apiError";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/users")({ component: UsersPage });

const PAGE_SIZE = 10;

function UsersPage() {
  const [statusTarget, setStatusTarget] = useState<AdminUser | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState<{ search: string; dropdownValues: Record<string, string> }>({
    search: "",
    dropdownValues: {},
  });

  const usersQuery = useUsers({
    page,
    per_page: PAGE_SIZE,
    search: query.search || undefined,
    status: query.dropdownValues.status === "Active" ? "active" : query.dropdownValues.status === "Inactive" ? "inactive" : undefined,
    is_guest: query.dropdownValues.type === "Guest" ? true : query.dropdownValues.type === "Registered" ? false : undefined,
    language_code: query.dropdownValues.language || undefined,
    state_id: query.dropdownValues.state ? Number(query.dropdownValues.state) : undefined,
    district_id: query.dropdownValues.district ? Number(query.dropdownValues.district) : undefined,
    area_id: query.dropdownValues.area ? Number(query.dropdownValues.area) : undefined,
  });
  const statsQuery = useUserStats();
  const languagesQuery = useLanguages();
  const regionsQuery = useRegions();
  const updateStatus = useUpdateUserStatus();
  const deleteUser = useDeleteUser();

  const states = regionsQuery.data ?? [];
  const districts = useMemo(() => states.flatMap((state) => state.districts), [states]);
  const areas = useMemo(() => districts.flatMap((district) => district.areas), [districts]);

  const rows = usersQuery.data?.items ?? [];
  const stats = statsQuery.data;
  const error = usersQuery.error ? "Unable to load users from backend." : undefined;

  const handleQueryChange = (q: AdminListQuery) => {
    setQuery({ search: q.search, dropdownValues: q.dropdownValues });
  };

  const columns: Column<AdminUser>[] = [
    { key: "user", header: "User", cell: (r) => <div><p className="font-medium">{r.name}</p><p className="text-xs text-muted-foreground">{r.type}</p></div> },
    { key: "contact", header: "Contact/Phone/Email", cell: (r) => <div><p>{r.phone}</p><p className="text-xs text-muted-foreground">{r.email}</p></div> },
    { key: "dob", header: "Date of Birth", cell: (r) => r.dob },
    { key: "language", header: "Language", cell: (r) => r.language },
    { key: "state", header: "State", cell: (r) => r.state },
    { key: "district", header: "District", cell: (r) => r.district },
    { key: "area", header: "Area", cell: (r) => r.area },
    { key: "ref", header: "Referred By", cell: (r) => r.referredBy },
    { key: "registered", header: "Registered On", cell: (r) => r.registeredOn },
    { key: "active", header: "Last Active", cell: (r) => r.lastActive },
    { key: "posts", header: "Posts", cell: (r) => r.posts },
    { key: "status", header: "Status", cell: (r) => <StatusBadge status={r.status} /> },
    {
      key: "actions",
      header: "Actions",
      cell: (row) => (
        <ActionMenu
          onDelete={() => setDeleteTarget(row)}
          extraItems={[
            {
              label: row.status === "Active" ? "Suspend User" : "Activate User",
              icon: row.status === "Active" ? Ban : UserCheck,
              onClick: () => setStatusTarget(row),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <>
      <AdminListPage
        title="Users"
        breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "Users" }]}
        loading={usersQuery.isFetching}
        error={error}
        stats={[
          { title: "All Users", value: stats?.total ?? rows.length, icon: UsersIcon, variant: "blue" },
          { title: "Registered Users", value: stats?.registered ?? rows.filter((u) => u.type === "Registered").length, icon: UserCheck, variant: "green" },
          { title: "Guest Users", value: stats?.guests ?? rows.filter((u) => u.type === "Guest").length, icon: UsersIcon, variant: "amber" },
          { title: "Active Users", value: stats?.active ?? rows.filter((u) => u.status === "Active").length, icon: CheckCircle2, variant: "violet" },
          { title: "Inactive Users", value: stats?.inactive ?? rows.filter((u) => u.status === "Inactive").length, icon: UserX, variant: "rose" },
          { title: "New This Month", value: stats?.new_this_month ?? 0, icon: UserPlus, variant: "pink" },
          { title: "Total Posts", value: stats?.total_posts ?? rows.reduce((a, u) => a + u.posts, 0), icon: FileText, variant: "blue" },
        ]}
        data={rows}
        columns={columns}
        rowKey={(r) => r.id}
        searchPlaceholder="Search users..."
        showDateRange
        serverSide
        total={usersQuery.data?.total ?? 0}
        pageSize={PAGE_SIZE}
        page={page}
        onPageChange={setPage}
        onQueryChange={handleQueryChange}
        dropdowns={[
          { key: "status", placeholder: "Status", options: ["Active", "Inactive"].map((s) => ({ label: s, value: s })) },
          { key: "type", placeholder: "User Type", options: ["Registered", "Guest"].map((s) => ({ label: s, value: s })) },
          { key: "language", placeholder: "Language", options: (languagesQuery.data?.items ?? []).map((l) => ({ label: l.name, value: l.code })) },
          { key: "state", placeholder: "State", options: states.map((s) => ({ label: s.name, value: String(s.id) })) },
          { key: "district", placeholder: "District", options: districts.map((d) => ({ label: d.name, value: String(d.id) })) },
          { key: "area", placeholder: "Area", options: areas.map((a) => ({ label: a.name, value: String(a.id) })) },
        ]}
      />
      <ConfirmDialog
        open={Boolean(statusTarget)}
        onOpenChange={(open) => !open && setStatusTarget(null)}
        title={statusTarget?.status === "Active" ? "Suspend user?" : "Activate user?"}
        description={`This will ${statusTarget?.status === "Active" ? "suspend" : "activate"} ${statusTarget?.name ?? "this user"}.`}
        confirmLabel={updateStatus.isPending ? "Updating..." : "Confirm"}
        destructive={statusTarget?.status === "Active"}
        onConfirm={async () => {
          if (!statusTarget) return;
          try {
            await updateStatus.mutateAsync({ id: statusTarget.id, isActive: statusTarget.status !== "Active" });
            toast.success(statusTarget.status === "Active" ? "User suspended" : "User activated");
            setStatusTarget(null);
          } catch (err) {
            toast.error(isAuthApiError(err) ? "Backend admin auth is required to update user status." : "Unable to update user status");
          }
        }}
      />
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete user?"
        description={`This will permanently remove ${deleteTarget?.name ?? "this user"} if the backend allows it.`}
        confirmLabel={deleteUser.isPending ? "Deleting..." : "Delete"}
        destructive
        onConfirm={async () => {
          if (!deleteTarget) return;
          try {
            await deleteUser.mutateAsync(deleteTarget.id);
            toast.success("User deleted");
            setDeleteTarget(null);
          } catch (err) {
            toast.error(isAuthApiError(err) ? "Backend admin auth is required to delete user." : "Unable to delete user");
          }
        }}
      />
    </>
  );
}
