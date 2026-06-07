import { createFileRoute } from "@tanstack/react-router";
import { FileText, Ban, UserCheck, UserPlus, Users as UsersIcon, UserX } from "lucide-react";
import { useState } from "react";
import { AdminListPage } from "@/components/admin/AdminListPage";
import { ActionMenu } from "@/components/common/ActionMenu";
import { StatusBadge } from "@/components/common/StatusBadge";
import { users } from "@/mock/users.mock";
import { languages } from "@/mock/system.mock";
import { areas, districts, states } from "@/mock/location.mock";
import type { AdminUser } from "@/types/user";
import type { Column } from "@/components/tables/DataTable";
import { ROUTES } from "@/constants/routes.constants";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/users")({ component: UsersPage });

function UsersPage() {
  const [rows, setRows] = useState(users);
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
    { key: "deviceType", header: "Device Type", cell: (r) => <span className="rounded-full bg-muted px-2 py-1 text-xs font-medium">{r.deviceType}</span> },
    { key: "posts", header: "Posts", cell: (r) => r.posts },
    { key: "status", header: "Status", cell: (r) => <StatusBadge status={r.status} /> },
    {
      key: "actions",
      header: "Actions",
      cell: (row) => (
        <ActionMenu
          extraItems={[
            {
              label: "Suspend User",
              icon: Ban,
              onClick: () => {
                setRows((current) => current.map((user) => (user.id === row.id ? { ...user, status: "Inactive" } : user)));
                toast.info("Suspend user API not available yet. Local mock status updated.");
              },
            },
          ]}
        />
      ),
    },
  ];
  return <AdminListPage title="Users" breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "Users" }]} stats={[{ title: "All Users", value: rows.length, icon: UsersIcon, variant: "blue" }, { title: "Registered Users", value: rows.filter((u) => u.type === "Registered").length, icon: UserCheck, variant: "green" }, { title: "Guest Users", value: rows.filter((u) => u.type === "Guest").length, icon: UsersIcon, variant: "amber" }, { title: "Total Users", value: "18,420", icon: UsersIcon, variant: "violet" }, { title: "Active Users", value: rows.filter((u) => u.status === "Active").length, icon: UserCheck, variant: "green" }, { title: "Inactive Users", value: rows.filter((u) => u.status === "Inactive").length, icon: UserX, variant: "rose" }, { title: "New This Month", value: "1,280", icon: UserPlus, variant: "pink" }, { title: "Total Posts", value: rows.reduce((a, u) => a + u.posts, 0), icon: FileText, variant: "blue" }]} data={rows} columns={columns} rowKey={(r) => r.id} searchPlaceholder="Search users..." showDateRange dropdowns={[{ key: "status", placeholder: "Status", options: ["Active", "Inactive"].map((s) => ({ label: s, value: s })) }, { key: "language", placeholder: "Language", options: languages.map((l) => ({ label: l.name, value: l.name })) }, { key: "state", placeholder: "State", options: states.map((s) => ({ label: s.name, value: s.name })) }, { key: "district", placeholder: "District", options: districts.map((d) => ({ label: d.name, value: d.name })) }, { key: "area", placeholder: "Area", options: areas.map((a) => ({ label: a.name, value: a.name })) }, { key: "deviceType", placeholder: "Device Type", options: [{ label: "All Devices", value: "all" }, { label: "Android", value: "Android" }, { label: "iOS", value: "iOS" }] }]} filter={(row, search) => [row.name, row.email, row.phone].some((v) => v.toLowerCase().includes(search.toLowerCase()))} />;
}
