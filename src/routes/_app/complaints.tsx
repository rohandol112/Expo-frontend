import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Download, Plus } from "lucide-react";
import { AdminListPage } from "@/components/admin/AdminListPage";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ActionMenu } from "@/components/common/ActionMenu";
import { Button } from "@/components/ui/button";
import { complaints } from "@/mock/complaints.mock";
import type { Complaint } from "@/types/complaint";
import type { Column } from "@/components/tables/DataTable";
import { ROUTES } from "@/constants/routes.constants";

export const Route = createFileRoute("/_app/complaints")({ component: ComplaintsPage });

function ComplaintsPage() {
  const navigate = useNavigate();
  const columns: Column<Complaint>[] = [
    { key: "title", header: "Title", cell: (r) => <span className="font-medium">{r.title}</span> },
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
  return <AdminListPage title="Complaint Management" breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "Complaints" }]} actions={<><Button variant="outline"><Download className="mr-2 h-4 w-4" />Export</Button><Button><Plus className="mr-2 h-4 w-4" />Add New Complaint</Button></>} data={complaints} columns={columns} rowKey={(r) => r.id} searchPlaceholder="Search complaints..." showDateRange dropdowns={[{ key: "status", placeholder: "Status", options: ["Active", "Pending", "Resolved"].map((s) => ({ label: s, value: s })) }, { key: "priority", placeholder: "Priority", options: ["Low", "Medium", "High", "Critical"].map((s) => ({ label: s, value: s })) }, { key: "category", placeholder: "Category", options: ["Content", "Abuse", "Technical"].map((s) => ({ label: s, value: s })) }, { key: "assigned", placeholder: "Assigned To", options: ["Priya Admin", "Rohit Support", "Unassigned"].map((s) => ({ label: s, value: s })) }, { key: "location", placeholder: "Location", options: ["Pune", "Mumbai", "Lucknow"].map((s) => ({ label: s, value: s })) }]} filter={(row, search) => [row.title, row.reportedBy, row.location].some((v) => v.toLowerCase().includes(search.toLowerCase()))} />;
}
