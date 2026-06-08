import { Outlet, createFileRoute, useLocation, useNavigate } from "@tanstack/react-router";
import { AlertCircle, CheckCircle2, Clock, Download, ListTodo, ShieldAlert } from "lucide-react";
import { useMemo } from "react";
import { AdminListPage } from "@/components/admin/AdminListPage";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ActionMenu } from "@/components/common/ActionMenu";
import { Button } from "@/components/ui/button";
import { useComplaints, useComplaintStats, useComplaintCategories } from "@/hooks/api/useComplaints";
import { useRegions } from "@/hooks/api/useRegions";
import { useLanguages } from "@/hooks/api/useLanguages";
import type { Complaint } from "@/types/complaint";
import type { Column } from "@/components/tables/DataTable";
import { ROUTES } from "@/constants/routes.constants";

export const Route = createFileRoute("/_app/complaints")({ component: ComplaintsPage });

function ComplaintsPage() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  if (pathname !== ROUTES.COMPLAINTS) return <Outlet />;

  const complaintsQuery = useComplaints();
  const statsQuery = useComplaintStats();
  const categoriesQuery = useComplaintCategories();
  const regionsQuery = useRegions();
  const languagesQuery = useLanguages();

  const states = regionsQuery.data ?? [];
  const districts = useMemo(() => states.flatMap((state) => state.districts), [states]);
  const areas = useMemo(() => districts.flatMap((district) => district.areas), [districts]);

  const rows = complaintsQuery.data?.items ?? [];
  const stats = statsQuery.data;
  const error = complaintsQuery.error ? "Unable to load complaints from backend." : undefined;

  const columns: Column<Complaint>[] = [
    {
      key: "title",
      header: "Title",
      cell: (r) => (
        <div>
          <span className="font-medium">{r.title}</span>
          <p className="text-xs text-muted-foreground">{r.number}</p>
        </div>
      ),
    },
    { key: "category", header: "Category", cell: (r) => r.category },
    { key: "priority", header: "Priority", cell: (r) => r.priority },
    { key: "status", header: "Status", cell: (r) => <StatusBadge status={r.status} /> },
    { key: "reported", header: "Reported By", cell: (r) => r.reportedBy },
    { key: "language", header: "Language", cell: (r) => r.language },
    { key: "location", header: "Location", cell: (r) => r.location },
    { key: "assigned", header: "Assigned To", cell: (r) => r.assignedTo },
    { key: "registered", header: "Registered On", cell: (r) => r.registeredOn },
    { key: "actions", header: "Actions", cell: (r) => <ActionMenu onView={() => navigate({ to: "/complaints/$complaintId", params: { complaintId: r.id } })} /> },
  ];

  return (
    <AdminListPage
      title="Complaint Management"
      breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "Complaints" }]}
      actions={<Button variant="outline"><Download className="mr-2 h-4 w-4" />Export</Button>}
      loading={complaintsQuery.isLoading}
      error={error}
      stats={[
        { title: "Total Complaints", value: stats?.total ?? rows.length, icon: ListTodo, variant: "blue" },
        { title: "Pending", value: stats?.pending ?? 0, icon: Clock, variant: "amber" },
        { title: "In Progress", value: (stats?.in_review ?? 0) + (stats?.in_progress ?? 0), icon: AlertCircle, variant: "violet" },
        { title: "Awaiting Action", value: stats?.awaiting_action ?? 0, icon: ShieldAlert, variant: "rose" },
        { title: "Resolved", value: stats?.resolved ?? 0, icon: CheckCircle2, variant: "green" },
      ]}
      data={rows}
      columns={columns}
      rowKey={(r) => r.id}
      searchPlaceholder="Search complaints..."
      showDateRange
      dropdowns={[
        { key: "status", placeholder: "Status", options: ["Pending", "In Review", "In Progress", "Awaiting Action", "Resolved", "Rejected"].map((s) => ({ label: s, value: s })) },
        { key: "priority", placeholder: "Priority", options: ["Low", "Medium", "High", "Critical"].map((s) => ({ label: s, value: s })) },
        { key: "category", placeholder: "Category", options: (categoriesQuery.data?.items ?? []).map((c) => ({ label: c.name, value: c.name })) },
        { key: "language", placeholder: "Language", options: (languagesQuery.data?.items ?? []).map((l) => ({ label: l.name, value: l.name })) },
        { key: "state", placeholder: "State", options: states.map((s) => ({ label: s.name, value: s.name })) },
        { key: "district", placeholder: "District", options: districts.map((d) => ({ label: d.name, value: d.name })) },
        { key: "area", placeholder: "Area", options: areas.map((a) => ({ label: a.name, value: a.name })) },
      ]}
      filter={(row, search, df) => {
        const term = search.toLowerCase();
        if (term && ![row.title, row.number, row.reportedBy, row.location, row.language].some((v) => v.toLowerCase().includes(term))) return false;
        if (df.status && row.status !== df.status) return false;
        if (df.priority && row.priority !== df.priority) return false;
        if (df.category && row.category !== df.category) return false;
        if (df.language && row.language !== df.language) return false;
        if (df.state && row.state !== df.state) return false;
        if (df.district && row.district !== df.district) return false;
        if (df.area && row.area !== df.area) return false;
        return true;
      }}
    />
  );
}
