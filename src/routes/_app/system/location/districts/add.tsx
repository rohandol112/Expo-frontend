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
import { states } from "@/mock/location.mock";
import { ROUTES } from "@/constants/routes.constants";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/system/location/districts/add")({ component: AddDistrictPage });

const schema = z.object({
  name: z.string().min(2, "District name is required"),
  state: z.string().min(1, "State is required"),
  status: z.enum(["Active", "Inactive"]),
});

type FormValues = z.infer<typeof schema>;

function AddDistrictPage() {
  const navigate = useNavigate();
  const { register, setValue, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { status: "Active" },
  });

  const onSubmit = () => {
    toast.error("Backend API not available yet.");
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
            <Button type="submit"><Save className="mr-2 h-4 w-4" />Save District</Button>
          </div>
        }
      />
      <FormSection title="District Details" description="Region create APIs are not available in the backend yet. This form is ready for wiring once endpoints exist.">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="District Name" error={errors.name?.message}><Input {...register("name")} placeholder="Pune" /></Field>
          <Field label="State" error={errors.state?.message}>
            <Select onValueChange={(value) => setValue("state", value)}>
              <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
              <SelectContent>{states.map((state) => <SelectItem key={state.id} value={state.name}>{state.name}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
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
