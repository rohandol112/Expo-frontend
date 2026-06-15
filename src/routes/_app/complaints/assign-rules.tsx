import { createFileRoute } from "@tanstack/react-router";
import { Settings2 } from "lucide-react";
import { AdminListPage } from "@/components/admin/AdminListPage";
import { StatusBadge } from "@/components/common/StatusBadge";
import type { Column } from "@/components/tables/DataTable";
import { ROUTES } from "@/constants/routes.constants";
import { useComplaintAssignRules } from "@/hooks/api/useComplaints";
import type { ComplaintAssignRule } from "@/services/complaintCategory.service";

export const Route = createFileRoute("/_app/complaints/assign-rules")({ component: ComplaintAssignRulesPage });

function ComplaintAssignRulesPage() {
  const rulesQuery = useComplaintAssignRules({ per_page: 100 });
  const rows = rulesQuery.data?.items ?? [];
  const columns: Column<ComplaintAssignRule>[] = [
    { key: "rule", header: "Rule", cell: (row) => <div><p className="font-medium">{row.name}</p><p className="text-xs text-muted-foreground">{row.description || "—"}</p></div> },
    { key: "category", header: "Category", cell: (row) => row.category?.name ?? "—" },
    { key: "assignee", header: "Assigned Officer", cell: (row) => row.assign_to?.name || `User #${row.assign_to?.id ?? "—"}` },
    { key: "status", header: "Status", cell: (row) => <StatusBadge status={row.is_active ? "Active" : "Inactive"} /> },
    { key: "created", header: "Created On", cell: (row) => row.created_at ? new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(row.created_at)) : "—" },
  ];

  return (
    <AdminListPage
      title="Complaint Assign Rules"
      breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "Complaints", to: ROUTES.COMPLAINTS }, { label: "Assign Rules" }]}
      stats={[{ title: "Total Rules", value: rows.length, icon: Settings2, variant: "violet" }]}
      data={rows}
      columns={columns}
      rowKey={(row) => String(row.id)}
      loading={rulesQuery.isLoading}
      error={rulesQuery.error ? "Unable to load complaint assign rules from backend." : undefined}
      searchPlaceholder="Search assign rules..."
      filter={(row, search) => !search || [row.name, row.description || "", row.category?.name || "", row.assign_to?.name || ""].some((value) => value.toLowerCase().includes(search.toLowerCase()))}
    />
  );
}
