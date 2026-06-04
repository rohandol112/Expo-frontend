import { createFileRoute } from "@tanstack/react-router";
import { Send } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { FormSection } from "@/components/forms/FormSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ROUTES } from "@/constants/routes.constants";

export const Route = createFileRoute("/_app/notifications/add")({ component: CreateNotificationPage });

function CreateNotificationPage() {
  return (
    <div>
      <PageHeader title="Create Custom Notification" breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "Notifications", to: ROUTES.NOTIFICATIONS }, { label: "Create" }]} actions={<Button><Send className="mr-2 h-4 w-4" />Save Draft</Button>} />
      <FormSection title="Notification Details" description="Static UI until notification backend APIs are available.">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Title"><Input placeholder="Breaking update" /></Field>
          <Field label="Target Language"><Input placeholder="Hindi" /></Field>
          <Field label="State"><Input placeholder="Maharashtra" /></Field>
          <Field label="District"><Input placeholder="Pune" /></Field>
          <Field label="Area"><Input placeholder="Kothrud" /></Field>
          <Field label="Schedule Date"><Input type="datetime-local" /></Field>
        </div>
        <Field label="Message"><Textarea placeholder="Write notification message..." className="min-h-[140px]" /></Field>
      </FormSection>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label>{label}</Label>{children}</div>;
}
