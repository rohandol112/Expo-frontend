import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ROUTES } from "@/constants/routes.constants";
import { feedbackRows } from "@/mock/admin-extra.mock";

export const Route = createFileRoute("/_app/feedback/$feedbackId/edit")({ component: FeedbackEditPage });

function FeedbackEditPage() {
  const { feedbackId } = Route.useParams();
  const navigate = useNavigate();
  const feedback = feedbackRows.find((item) => item.id === feedbackId) ?? feedbackRows[0];

  return (
    <div>
      <PageHeader
        title="Edit Feedback"
        breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "Feedback", to: ROUTES.FEEDBACK }, { label: "Edit Feedback" }]}
        actions={<Button onClick={() => { toast.success("Feedback updated locally"); navigate({ to: ROUTES.FEEDBACK }); }}><Save className="mr-2 h-4 w-4" />Save Changes</Button>}
      />
      <section className="rounded-lg border bg-card p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Status"><Select defaultValue={feedback.status}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["New", "Reviewed", "Under Review", "Closed", "Replied", "Resolved"].map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}</SelectContent></Select></Field>
          <Field label="Feedback Type"><Select defaultValue={feedback.type}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["Rating", "Suggestion", "Complaint", "Bug"].map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent></Select></Field>
        </div>
        <Field label="Feedback"><Textarea defaultValue={feedback.feedback} className="min-h-32" /></Field>
        <Field label="Admin Reply"><Textarea placeholder="Write a response for this feedback" className="min-h-28" /></Field>
      </section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="mb-4 space-y-2"><Label>{label}</Label>{children}</div>;
}
