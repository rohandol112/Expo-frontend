import { createFileRoute, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { Download, Filter, MessageSquareText, Star, ThumbsDown, ThumbsUp, Lightbulb } from "lucide-react";
import { ActionMenu } from "@/components/common/ActionMenu";
import { PageHeader } from "@/components/common/PageHeader";
import { StatsCard } from "@/components/common/StatsCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable, type Column } from "@/components/tables/DataTable";
import { ROUTES } from "@/constants/routes.constants";
import { feedbackRows, type FeedbackRow } from "@/mock/admin-extra.mock";

export const Route = createFileRoute("/_app/feedback")({ component: FeedbackPage });

function FeedbackPage() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  if (pathname !== ROUTES.FEEDBACK) return <Outlet />;

  const columns: Column<FeedbackRow>[] = [
    { key: "user", header: "User", cell: (row) => <span className="font-medium">{row.user}</span> },
    { key: "userType", header: "User Type", cell: (row) => row.userType },
    { key: "type", header: "Feedback Type", cell: (row) => row.type },
    { key: "feedback", header: "Feedback", cell: (row) => <span className="line-clamp-2 text-muted-foreground">{row.feedback}</span> },
    { key: "language", header: "Language", cell: (row) => row.language },
    { key: "location", header: "Location", cell: (row) => row.location },
    { key: "submittedOn", header: "Submitted On", cell: (row) => row.submittedOn },
    { key: "status", header: "Status", cell: (row) => <StatusBadge status={row.status} /> },
    {
      key: "actions",
      header: "Actions",
      cell: (row) => (
        <ActionMenu
          onView={() => navigate({ to: "/feedback/$feedbackId", params: { feedbackId: row.id } })}
          onEdit={() => navigate({ to: "/feedback/$feedbackId/edit", params: { feedbackId: row.id } })}
          extraItems={[{ label: "Reply" }, { label: "Mark Reviewed" }]}
        />
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Feedback Management"
        breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "Feedback" }]}
        actions={<><Button variant="outline"><Download className="mr-2 h-4 w-4" />Export Feedback</Button><Button variant="outline"><Filter className="mr-2 h-4 w-4" />Filter</Button></>}
      />
      <p className="mb-5 text-sm text-muted-foreground">Manage ratings, suggestions and feedback submitted by users from mobile app and guest users.</p>
      <div className="mb-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatsCard title="Total Feedback" value="1,248" icon={MessageSquareText} variant="blue" />
        <StatsCard title="Average Rating" value="4.3" icon={Star} variant="amber" />
        <StatsCard title="Positive Feedback" value="824" icon={ThumbsUp} variant="green" />
        <StatsCard title="Negative Feedback" value="86" icon={ThumbsDown} variant="rose" />
        <StatsCard title="Suggestions" value="338" icon={Lightbulb} variant="violet" />
      </div>
      <div className="mb-4 grid gap-3 rounded-lg border bg-card p-4 md:grid-cols-4 xl:grid-cols-8">
        {["Feedback Type", "User Type", "Status", "Language", "State", "District", "Area", "Date Range"].map((filter) => <FilterSelect key={filter} label={filter} />)}
      </div>
      <div className="mb-4 flex gap-2 border-b">
        {["All Feedback", "Registered Users", "Guest Users"].map((tab, index) => <button key={tab} className={`px-3 py-2 text-sm font-medium ${index === 0 ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}>{tab}</button>)}
      </div>
      <DataTable columns={columns} data={feedbackRows} rowKey={(row) => row.id} pageSize={10} total={feedbackRows.length} />
    </div>
  );
}

function FilterSelect({ label }: { label: string }) {
  return <Select><SelectTrigger><SelectValue placeholder={label} /></SelectTrigger><SelectContent><SelectItem value="all">All</SelectItem><SelectItem value="active">Active</SelectItem></SelectContent></Select>;
}
