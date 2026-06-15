import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ArrowLeft, Info, Save } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { FormSection } from "@/components/forms/FormSection";
import { SectionCard } from "@/components/admin/SectionCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ROUTES } from "@/constants/routes.constants";
import { useCreateState } from "@/hooks/api/useLocations";
import { useLanguages } from "@/hooks/api/useLanguages";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/system/location/states/add")({ component: AddStatePage });

const schema = z.object({
  name: z.string().min(2),
  code: z.string().min(2).max(12),
  languageCode: z.string().min(1),
  sortOrder: z.coerce.number().min(0),
  status: z.enum(["Active", "Inactive"]),
});
type FormValues = z.infer<typeof schema>;

function AddStatePage() {
  const navigate = useNavigate();
  const createState = useCreateState();
  const languagesQuery = useLanguages({ is_active: true });
  const { register, setValue, watch, handleSubmit, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { languageCode: "en", sortOrder: 0, status: "Active" } });
  const selectedLanguage = watch("languageCode");
  const onSubmit = (values: FormValues) => {
    createState.mutate(
      { language_code: values.languageCode, code: values.code, name: values.name, sort_order: values.sortOrder, is_active: values.status === "Active" },
      {
        onSuccess: () => {
          toast.success("State created.");
          navigate({ to: ROUTES.SYS_STATES });
        },
        onError: (error) => toast.error(error instanceof Error ? error.message : "Unable to create state."),
      },
    );
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <PageHeader
        title="Add State"
        breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "States", to: ROUTES.SYS_STATES }, { label: "Add State" }]}
        actions={
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => navigate({ to: ROUTES.SYS_STATES })}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button type="submit" disabled={createState.isPending}><Save className="mr-2 h-4 w-4" />Save State</Button>
          </div>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <FormSection title="State Details">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="State Name" error={errors.name?.message}><Input {...register("name")} placeholder="Maharashtra" /></Field>
            <Field label="State Code" error={errors.code?.message}><Input {...register("code")} placeholder="MH" /></Field>
            <Field label="Language" error={errors.languageCode?.message}>
              <Select value={selectedLanguage} onValueChange={(value) => setValue("languageCode", value, { shouldValidate: true })}>
                <SelectTrigger><SelectValue placeholder="Select language" /></SelectTrigger>
                <SelectContent>{(languagesQuery.data?.items ?? []).map((language) => <SelectItem key={language.id} value={language.code}>{language.name}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Sort Order" error={errors.sortOrder?.message}><Input type="number" min={0} {...register("sortOrder")} /></Field>
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
