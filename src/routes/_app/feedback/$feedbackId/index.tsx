import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Edit, MessageSquareText } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes.constants";
import { feedbackRows } from "@/mock/admin-extra.mock";

export const Route = createFileRoute("/_app/feedback/$feedbackId/")({ component: FeedbackDetailPage });

function FeedbackDetailPage() {
  const { feedbackId } = Route.useParams();
  const navigate = useNavigate();
  const feedback = feedbackRows.find((item) => item.id === feedbackId) ?? feedbackRows[0];

  return (
    <div>
      <PageHeader
        title="Feedback Detail"
        breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "Feedback", to: ROUTES.FEEDBACK }, { label: "View Feedback" }]}
        actions={<Button onClick={() => navigate({ to: "/feedback/$feedbackId/edit", params: { feedbackId } })}><Edit className="mr-2 h-4 w-4" />Edit Feedback</Button>}
      />
      <section className="rounded-lg border bg-card p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary"><MessageSquareText className="h-5 w-5" /></div>
          <div><p className="font-semibold">{feedback.user}</p><p className="text-sm text-muted-foreground">{feedback.userType} user</p></div>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <Detail label="Feedback Type" value={feedback.type} />
          <Detail label="Status" value={<StatusBadge status={feedback.status} />} />
          <Detail label="Language" value={feedback.language} />
          <Detail label="Location" value={feedback.location} />
          <Detail label="Submitted On" value={feedback.submittedOn} />
        </div>
        <div className="mt-5 rounded-md border bg-muted/20 p-4 text-sm">{feedback.feedback}</div>
      </section>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return <div><p className="text-xs font-semibold uppercase text-muted-foreground">{label}</p><div className="mt-1 text-sm font-medium">{value}</div></div>;
}
