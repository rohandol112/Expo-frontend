import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ArrowLeft, Save } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { FormSection } from "@/components/forms/FormSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ROUTES } from "@/constants/routes.constants";
import { useCreateDistrict, useStates } from "@/hooks/api/useLocations";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/system/location/districts/add")({ component: AddDistrictPage });

const schema = z.object({
  name: z.string().min(2, "District name is required"),
  state: z.string().min(1, "State is required"),
  code: z.string().optional(),
  languageCode: z.string().min(1),
  sortOrder: z.coerce.number().min(0),
  status: z.enum(["Active", "Inactive"]),
});

type FormValues = z.infer<typeof schema>;

function AddDistrictPage() {
  const navigate = useNavigate();
  const statesQuery = useStates({ language_code: "en", per_page: 100 });
  const createDistrict = useCreateDistrict();
  const { register, setValue, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { languageCode: "en", sortOrder: 0, status: "Active" },
  });

  const onSubmit = (values: FormValues) => {
    createDistrict.mutate(
      {
        language_code: values.languageCode,
        state_id: Number(values.state),
        code: values.code || null,
        name: values.name,
        sort_order: values.sortOrder,
        is_active: values.status === "Active",
      },
      {
        onSuccess: () => {
          toast.success("District created.");
          navigate({ to: ROUTES.SYS_DISTRICTS });
        },
        onError: (error) => toast.error(error instanceof Error ? error.message : "Unable to create district."),
      },
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <PageHeader
        title="Add District"
        breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "Districts", to: ROUTES.SYS_DISTRICTS }, { label: "Add District" }]}
        actions={
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => navigate({ to: ROUTES.SYS_DISTRICTS })}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button type="submit" disabled={createDistrict.isPending}><Save className="mr-2 h-4 w-4" />Save District</Button>
          </div>
        }
      />
      <FormSection title="District Details">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="District Name" error={errors.name?.message}><Input {...register("name")} placeholder="Pune" /></Field>
          <Field label="State" error={errors.state?.message}>
            <Select onValueChange={(value) => setValue("state", value)}>
              <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
              <SelectContent>{(statesQuery.data?.items ?? []).map((state) => <SelectItem key={state.id} value={String(state.id)}>{state.name}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="District Code" error={errors.code?.message}><Input {...register("code")} placeholder="PUN" /></Field>
          <Field label="Language Code" error={errors.languageCode?.message}><Input {...register("languageCode")} placeholder="en" /></Field>
          <Field label="Sort Order" error={errors.sortOrder?.message}><Input type="number" min={0} {...register("sortOrder")} /></Field>
          <Field label="Status">
            <Select defaultValue="Active" onValueChange={(value) => setValue("status", value as FormValues["status"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="Active">Active</SelectItem><SelectItem value="Inactive">Inactive</SelectItem></SelectContent>
            </Select>
          </Field>
        </div>
      </FormSection>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label>{label}</Label>{children}{error && <p className="text-xs text-destructive">{error}</p>}</div>;
}
