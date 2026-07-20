import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
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
import { useDistrict, useStates, useUpdateDistrict } from "@/hooks/api/useLocations";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/system/location/districts/$districtId/edit")({ component: EditDistrictPage });

const schema = z.object({
  name: z.string().min(2),
  code: z.string().optional(),
  sortOrder: z.coerce.number().min(0),
  status: z.enum(["Active", "Inactive"]),
});
type FormValues = z.infer<typeof schema>;

function EditDistrictPage() {
  const { districtId } = Route.useParams();
  const navigate = useNavigate();
  const districtQuery = useDistrict(districtId);
  const statesQuery = useStates({ language_code: districtQuery.data?.language_code || "hi", per_page: 100 });
  const updateDistrict = useUpdateDistrict();
  const { register, setValue, handleSubmit, reset, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { code: "", sortOrder: 0, status: "Active" },
  });

  useEffect(() => {
    if (!districtQuery.data) return;
    reset({
      name: districtQuery.data.name,
      code: districtQuery.data.code ?? "",
      sortOrder: districtQuery.data.sort_order ?? 0,
      status: districtQuery.data.is_active ? "Active" : "Inactive",
    });
  }, [districtQuery.data, reset]);

  const onSubmit = (values: FormValues) => {
    updateDistrict.mutate(
      { id: districtId, payload: { name: values.name, code: values.code || null, sort_order: values.sortOrder, is_active: values.status === "Active" }, languageCode: districtQuery.data?.language_code },
      {
        onSuccess: () => {
          toast.success("District updated.");
          navigate({ to: ROUTES.SYS_DISTRICTS });
        },
        onError: (error) => toast.error(error instanceof Error ? error.message : "Unable to update district."),
      },
    );
  };

  const stateName = (statesQuery.data?.items ?? []).find((state) => state.id === districtQuery.data?.state_id)?.name;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <PageHeader
        title="Edit District"
        breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "Districts", to: ROUTES.SYS_DISTRICTS }, { label: "Edit District" }]}
        actions={<div className="flex gap-2"><Button type="button" variant="outline" onClick={() => navigate({ to: ROUTES.SYS_DISTRICTS })}><ArrowLeft className="mr-2 h-4 w-4" />Back</Button><Button type="submit" disabled={updateDistrict.isPending}><Save className="mr-2 h-4 w-4" />Save Changes</Button></div>}
      />
      <FormSection title="District Details" description={districtQuery.error ? "Unable to load district from backend." : undefined}>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="District Name" error={errors.name?.message}><Input {...register("name")} /></Field>
          <Field label="State"><Input value={stateName ?? (districtQuery.data ? `State #${districtQuery.data.state_id}` : "")} disabled /></Field>
          <Field label="District Code" error={errors.code?.message}><Input {...register("code")} /></Field>
          <Field label="Language Code"><Input value={districtQuery.data?.language_code ?? ""} disabled /></Field>
          <Field label="Sort Order" error={errors.sortOrder?.message}><Input type="number" min={0} {...register("sortOrder")} /></Field>
          <Field label="Status"><Select value={watch("status")} onValueChange={(v) => setValue("status", v as FormValues["status"])}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Active">Active</SelectItem><SelectItem value="Inactive">Inactive</SelectItem></SelectContent></Select></Field>
        </div>
      </FormSection>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label>{label}</Label>{children}{error && <p className="text-xs text-destructive">{error}</p>}</div>;
}
