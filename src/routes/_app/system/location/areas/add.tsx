import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
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
import { useCreateArea, useDistricts, useStates } from "@/hooks/api/useLocations";
import { useLanguages } from "@/hooks/api/useLanguages";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/system/location/areas/add")({
  validateSearch: (search: Record<string, unknown>) => ({
    language_code: typeof search.language_code === "string" && search.language_code ? search.language_code : undefined,
  }),
  component: AddAreaPage,
});

const schema = z.object({
  name: z.string().min(2, "Area name is required"),
  state: z.string().min(1, "State is required"),
  district: z.string().min(1, "District is required"),
  languageCode: z.string().min(1),
  sortOrder: z.coerce.number().min(0),
  status: z.enum(["Active", "Inactive"]),
});

type FormValues = z.infer<typeof schema>;

function AddAreaPage() {
  const navigate = useNavigate();
  const { language_code } = Route.useSearch();
  const languagesQuery = useLanguages({ is_active: true });
  const createArea = useCreateArea();
  const { register, setValue, watch, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { languageCode: language_code ?? "en", sortOrder: 0, status: "Active" },
  });
  const selectedLanguage = watch("languageCode");
  const selectedState = watch("state");
  const statesQuery = useStates({ language_code: selectedLanguage || "en", per_page: 2000 });
  const districtsQuery = useDistricts({ language_code: selectedLanguage || "en", per_page: 2000 });
  const states = statesQuery.data?.items ?? [];
  const districts = districtsQuery.data?.items ?? [];
  const filteredDistricts = useMemo(
    () => districts.filter((district) => !selectedState || String(district.state_id) === selectedState),
    [districts, selectedState],
  );

  const onSubmit = (values: FormValues) => {
    createArea.mutate(
      {
        language_code: values.languageCode,
        district_id: Number(values.district),
        name: values.name,
        sort_order: values.sortOrder,
        is_active: values.status === "Active",
      },
      {
        onSuccess: () => {
          toast.success("Area created.");
          navigate({ to: ROUTES.SYS_AREAS });
        },
        onError: (error) => toast.error(error instanceof Error ? error.message : "Unable to create area."),
      },
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <PageHeader
        title="Add Area"
        breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "Areas", to: ROUTES.SYS_AREAS }, { label: "Add Area" }]}
        actions={
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => navigate({ to: ROUTES.SYS_AREAS })}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button type="submit" disabled={createArea.isPending}><Save className="mr-2 h-4 w-4" />Save Area</Button>
          </div>
        }
      />
      <FormSection title="Area Details">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Area Name" error={errors.name?.message}><Input {...register("name")} placeholder="Kothrud" /></Field>
          <Field label="State" error={errors.state?.message}>
            <Select onValueChange={(value) => { setValue("state", value); setValue("district", ""); }}>
              <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
              <SelectContent>{states.map((state) => <SelectItem key={state.id} value={String(state.id)}>{state.name}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="District" error={errors.district?.message}>
            <Select onValueChange={(value) => setValue("district", value)}>
              <SelectTrigger><SelectValue placeholder="Select district" /></SelectTrigger>
              <SelectContent>{filteredDistricts.map((district) => <SelectItem key={district.id} value={String(district.id)}>{district.name}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Language" error={errors.languageCode?.message}>
            <Select value={selectedLanguage} onValueChange={(value) => { setValue("languageCode", value, { shouldValidate: true }); setValue("state", ""); setValue("district", ""); }}>
              <SelectTrigger><SelectValue placeholder="Select language" /></SelectTrigger>
              <SelectContent>{(languagesQuery.data?.items ?? []).map((language) => <SelectItem key={language.id} value={language.code}>{language.name}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
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
