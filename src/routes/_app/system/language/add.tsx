import { createFileRoute } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Save } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { FormSection } from "@/components/forms/FormSection";
import { FileUploadBox } from "@/components/forms/FileUploadBox";
import { SectionCard } from "@/components/admin/SectionCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ROUTES } from "@/constants/routes.constants";

export const Route = createFileRoute("/_app/system/language/add")({ component: AddLanguagePage });

const schema = z.object({
  name: z.string().min(2),
  nativeName: z.string().min(2),
  code: z.string().min(2).max(5),
  direction: z.enum(["LTR", "RTL"]),
  status: z.enum(["Active", "Inactive"]),
});
type FormValues = z.infer<typeof schema>;

function AddLanguagePage() {
  const { register, setValue, watch, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { direction: "LTR", status: "Active" },
  });
  const values = watch();
  return (
    <form onSubmit={handleSubmit(() => undefined)}>
      <PageHeader title="Add Language" breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "Languages", to: ROUTES.SYS_LANGUAGE }, { label: "Add Language" }]} actions={<Button type="submit"><Save className="mr-2 h-4 w-4" />Save Language</Button>} />
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <FormSection title="Language Details">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Language Name" error={errors.name?.message}><Input {...register("name")} placeholder="Hindi" /></Field>
            <Field label="Native Name" error={errors.nativeName?.message}><Input {...register("nativeName")} placeholder="Hindi" /></Field>
            <Field label="Language Code" error={errors.code?.message}><Input {...register("code")} placeholder="hi" /></Field>
            <Field label="Text Direction"><Select defaultValue="LTR" onValueChange={(v) => setValue("direction", v as FormValues["direction"])}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="LTR">LTR</SelectItem><SelectItem value="RTL">RTL</SelectItem></SelectContent></Select></Field>
            <Field label="Status"><Select defaultValue="Active" onValueChange={(v) => setValue("status", v as FormValues["status"])}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Active">Active</SelectItem><SelectItem value="Inactive">Inactive</SelectItem></SelectContent></Select></Field>
          </div>
          <FileUploadBox label="Upload language icon" hint="PNG, SVG or JPG" accept="image/*" />
        </FormSection>
        <SectionCard title="Preview">
          <div className="rounded-lg border bg-muted/30 p-4">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">{(values.code || "LA").toUpperCase()}</div>
            <p className="font-semibold">{values.name || "Language name"}</p>
            <p className="text-sm text-muted-foreground">{values.nativeName || "Native name"}</p>
            <p className="mt-3 text-xs text-muted-foreground">Direction: {values.direction}</p>
            <p className="text-xs text-muted-foreground">Status: {values.status}</p>
          </div>
        </SectionCard>
      </div>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label>{label}</Label>{children}{error && <p className="text-xs text-destructive">{error}</p>}</div>;
}
