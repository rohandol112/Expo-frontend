import { createFileRoute } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Info, Save } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { FormSection } from "@/components/forms/FormSection";
import { SectionCard } from "@/components/admin/SectionCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ROUTES } from "@/constants/routes.constants";

export const Route = createFileRoute("/_app/system/location/states/add")({ component: AddStatePage });

const schema = z.object({ name: z.string().min(2), code: z.string().min(2).max(4), status: z.enum(["Active", "Inactive"]) });
type FormValues = z.infer<typeof schema>;

function AddStatePage() {
  const { register, setValue, handleSubmit, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { status: "Active" } });
  return (
    <form onSubmit={handleSubmit(() => undefined)}>
      <PageHeader title="Add State" breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "States", to: ROUTES.SYS_STATES }, { label: "Add State" }]} actions={<Button type="submit"><Save className="mr-2 h-4 w-4" />Save State</Button>} />
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <FormSection title="State Details">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="State Name" error={errors.name?.message}><Input {...register("name")} placeholder="Maharashtra" /></Field>
            <Field label="State Code" error={errors.code?.message}><Input {...register("code")} placeholder="MH" /></Field>
            <Field label="Status"><Select defaultValue="Active" onValueChange={(v) => setValue("status", v as FormValues["status"])}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Active">Active</SelectItem><SelectItem value="Inactive">Inactive</SelectItem></SelectContent></Select></Field>
          </div>
        </FormSection>
        <SectionCard title="Note Panel">
          <div className="flex gap-3 text-sm text-muted-foreground"><Info className="mt-0.5 h-4 w-4 text-primary" /><p>State codes are used by channel filters, listing locations, and notification targeting. Keep codes short and unique.</p></div>
        </SectionCard>
      </div>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label>{label}</Label>{children}{error && <p className="text-xs text-destructive">{error}</p>}</div>;
}
