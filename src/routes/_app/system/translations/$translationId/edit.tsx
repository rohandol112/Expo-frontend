import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ROUTES } from "@/constants/routes.constants";
import { translationRows } from "@/mock/admin-extra.mock";

export const Route = createFileRoute("/_app/system/translations/$translationId/edit")({ component: TranslationEditPage });

function TranslationEditPage() {
  const { translationId } = Route.useParams();
  const navigate = useNavigate();
  const translation = translationRows.find((item) => item.id === translationId) ?? translationRows[0];

  return (
    <div>
      <PageHeader
        title="Edit Translation"
        breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "Translations", to: ROUTES.SYS_TRANSLATIONS }, { label: "Edit Translation" }]}
        actions={<Button onClick={() => { toast.success("Translation saved locally"); navigate({ to: ROUTES.SYS_TRANSLATIONS }); }}><Save className="mr-2 h-4 w-4" />Save Changes</Button>}
      />
      <section className="rounded-lg border bg-card p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Translation Key"><Input defaultValue={translation.key} /></Field>
          <Field label="Group"><Input defaultValue={translation.group} /></Field>
          <Field label="Status"><Select defaultValue={translation.status}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["Complete", "Partial", "Missing"].map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}</SelectContent></Select></Field>
        </div>
        <Field label="English(en)"><Textarea defaultValue={translation.english} /></Field>
        <Field label="Hindi(hi)"><Textarea placeholder="Enter Hindi translation" /></Field>
        <Field label="Gujarati(gu)"><Textarea placeholder="Enter Gujarati translation" /></Field>
      </section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="mb-4 space-y-2"><Label>{label}</Label>{children}</div>;
}
