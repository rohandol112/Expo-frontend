import { createFileRoute } from "@tanstack/react-router";
import { Tags } from "lucide-react";
import { AdminListPage } from "@/components/admin/AdminListPage";
import { StatusBadge } from "@/components/common/StatusBadge";
import type { Column } from "@/components/tables/DataTable";
import { ROUTES } from "@/constants/routes.constants";
import { useComplaintCategories } from "@/hooks/api/useComplaints";
import type { ComplaintCategory } from "@/services/complaintCategory.service";

export const Route = createFileRoute("/_app/complaints/categories")({ component: ComplaintCategoriesPage });

function ComplaintCategoriesPage() {
  const categoriesQuery = useComplaintCategories({ per_page: 100 });
  const rows = categoriesQuery.data?.items ?? [];
  const columns: Column<ComplaintCategory>[] = [
    { key: "name", header: "Category", cell: (row) => <div><p className="font-medium">{row.name}</p><p className="text-xs text-muted-foreground">{row.description || "—"}</p></div> },
    { key: "icon", header: "Icon", cell: (row) => row.icon_url ? <img src={row.icon_url} alt="" className="h-10 w-10 rounded object-cover" /> : "—" },
    { key: "status", header: "Status", cell: (row) => <StatusBadge status={row.is_active ? "Active" : "Inactive"} /> },
    { key: "created", header: "Created On", cell: (row) => row.created_at ? new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(row.created_at)) : "—" },
  ];

  return (
    <AdminListPage
      title="Complaint Categories"
      breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "Complaints", to: ROUTES.COMPLAINTS }, { label: "Categories" }]}
      stats={[{ title: "Total Categories", value: rows.length, icon: Tags, variant: "blue" }]}
      data={rows}
      columns={columns}
      rowKey={(row) => String(row.id)}
      loading={categoriesQuery.isLoading}
      error={categoriesQuery.error ? "Unable to load complaint categories from backend." : undefined}
      searchPlaceholder="Search complaint categories..."
      filter={(row, search) => !search || [row.name, row.description || ""].some((value) => value.toLowerCase().includes(search.toLowerCase()))}
    />
  );
}
