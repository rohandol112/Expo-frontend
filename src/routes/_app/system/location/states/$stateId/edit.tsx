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
import { useStateItem, useUpdateState } from "@/hooks/api/useLocations";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/system/location/states/$stateId/edit")({ component: EditStatePage });

const schema = z.object({
  name: z.string().min(2),
  sortOrder: z.coerce.number().min(0),
  status: z.enum(["Active", "Inactive"]),
});
type FormValues = z.infer<typeof schema>;

function EditStatePage() {
  const { stateId } = Route.useParams();
  const navigate = useNavigate();
  const stateQuery = useStateItem(stateId);
  const updateState = useUpdateState();
  const { register, setValue, handleSubmit, reset, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { sortOrder: 0, status: "Active" },
  });

  useEffect(() => {
    if (!stateQuery.data) return;
    reset({
      name: stateQuery.data.name,
      sortOrder: stateQuery.data.sort_order ?? 0,
      status: stateQuery.data.is_active ? "Active" : "Inactive",
    });
  }, [reset, stateQuery.data]);

  const onSubmit = (values: FormValues) => {
    updateState.mutate(
      { id: stateId, payload: { name: values.name, sort_order: values.sortOrder, is_active: values.status === "Active" } },
      {
        onSuccess: () => {
          toast.success("State updated.");
          navigate({ to: ROUTES.SYS_STATES });
        },
        onError: (error) => toast.error(error instanceof Error ? error.message : "Unable to update state."),
      },
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <PageHeader
        title="Edit State"
        breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "States", to: ROUTES.SYS_STATES }, { label: "Edit State" }]}
        actions={<div className="flex gap-2"><Button type="button" variant="outline" onClick={() => navigate({ to: ROUTES.SYS_STATES })}><ArrowLeft className="mr-2 h-4 w-4" />Back</Button><Button type="submit" disabled={updateState.isPending}><Save className="mr-2 h-4 w-4" />Save Changes</Button></div>}
      />
      <FormSection title="State Details" description={stateQuery.error ? "Unable to load state from backend." : undefined}>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="State Name" error={errors.name?.message}><Input {...register("name")} /></Field>
          <Field label="State Code"><Input value={stateQuery.data?.code ?? ""} disabled /></Field>
          <Field label="Language Code"><Input value={stateQuery.data?.language_code ?? ""} disabled /></Field>
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
