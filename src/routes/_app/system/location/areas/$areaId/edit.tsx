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
import { useArea, useDistricts, useStates, useUpdateArea } from "@/hooks/api/useLocations";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/system/location/areas/$areaId/edit")({ component: EditAreaPage });

const schema = z.object({
  name: z.string().min(2),
  sortOrder: z.coerce.number().min(0),
  status: z.enum(["Active", "Inactive"]),
});
type FormValues = z.infer<typeof schema>;

function EditAreaPage() {
  const { areaId } = Route.useParams();
  const navigate = useNavigate();
  const areaQuery = useArea(areaId);
  const statesQuery = useStates({ language_code: areaQuery.data?.language_code || "hi", per_page: 100 });
  const districtsQuery = useDistricts({ language_code: areaQuery.data?.language_code || "hi", per_page: 100 });
  const updateArea = useUpdateArea();
  const { register, setValue, handleSubmit, reset, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { sortOrder: 0, status: "Active" },
  });

  useEffect(() => {
    if (!areaQuery.data) return;
    reset({
      name: areaQuery.data.name,
      sortOrder: areaQuery.data.sort_order ?? 0,
      status: areaQuery.data.is_active ? "Active" : "Inactive",
    });
  }, [areaQuery.data, reset]);

  const onSubmit = (values: FormValues) => {
    updateArea.mutate(
      { id: areaId, payload: { name: values.name, sort_order: values.sortOrder, is_active: values.status === "Active" } },
      {
        onSuccess: () => {
          toast.success("Area updated.");
          navigate({ to: ROUTES.SYS_AREAS });
        },
        onError: (error) => toast.error(error instanceof Error ? error.message : "Unable to update area."),
      },
    );
  };

  const district = (districtsQuery.data?.items ?? []).find((item) => item.id === areaQuery.data?.district_id);
  const state = (statesQuery.data?.items ?? []).find((item) => item.id === district?.state_id);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <PageHeader
        title="Edit Area"
        breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "Areas", to: ROUTES.SYS_AREAS }, { label: "Edit Area" }]}
        actions={<div className="flex gap-2"><Button type="button" variant="outline" onClick={() => navigate({ to: ROUTES.SYS_AREAS })}><ArrowLeft className="mr-2 h-4 w-4" />Back</Button><Button type="submit" disabled={updateArea.isPending}><Save className="mr-2 h-4 w-4" />Save Changes</Button></div>}
      />
      <FormSection title="Area Details" description={areaQuery.error ? "Unable to load area from backend." : undefined}>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Area Name" error={errors.name?.message}><Input {...register("name")} /></Field>
          <Field label="State"><Input value={state?.name ?? "—"} disabled /></Field>
          <Field label="District"><Input value={district?.name ?? (areaQuery.data ? `District #${areaQuery.data.district_id}` : "")} disabled /></Field>
          <Field label="Language Code"><Input value={areaQuery.data?.language_code ?? ""} disabled /></Field>
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
