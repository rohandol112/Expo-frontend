import { createFileRoute } from "@tanstack/react-router";
import { AlertCircle } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { ROUTES } from "@/constants/routes.constants";

export const Route = createFileRoute("/_app/complaints/$complaintId")({ component: ComplaintDetailPage });

function ComplaintDetailPage() {
  const { complaintId } = Route.useParams();
  return (
    <div>
      <PageHeader title="Complaint Detail" breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "Complaints", to: ROUTES.COMPLAINTS }, { label: complaintId }]} />
      <div className="rounded-lg border bg-card p-10">
        <EmptyState
          icon={AlertCircle}
          title="Complaint API not available"
          description="No backend complaint detail endpoint is available in OpenAPI yet, so mock complaint details are not shown."
        />
      </div>
    </div>
  );
}
