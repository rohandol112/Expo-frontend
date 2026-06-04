import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Save } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { FormSection } from "@/components/forms/FormSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ROUTES } from "@/constants/routes.constants";
import { isAuthApiError } from "@/lib/apiError";
import { useLanguage, useUpdateLanguage } from "@/hooks/api/useLanguages";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/system/language/$languageId/edit")({ component: EditLanguagePage });

const schema = z.object({
  name: z.string().min(2),
  nativeName: z.string().min(2),
  direction: z.enum(["LTR", "RTL"]),
  sortOrder: z.coerce.number().min(0),
  status: z.enum(["Active", "Inactive"]),
});
type FormValues = z.infer<typeof schema>;

function EditLanguagePage() {
  const { languageId } = Route.useParams();
  const navigate = useNavigate();
  const languageQuery = useLanguage(languageId);
  const updateLanguage = useUpdateLanguage();
  const language = languageQuery.data;
  const { register, setValue, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { direction: "LTR", status: "Active", sortOrder: 0 },
  });

  useEffect(() => {
    if (!language) return;
    reset({ name: language.name, nativeName: language.nativeName, direction: language.direction, sortOrder: 0, status: language.status === "Inactive" ? "Inactive" : "Active" });
  }, [language, reset]);

  const onSubmit = async (data: FormValues) => {
    try {
      await updateLanguage.mutateAsync({
        id: languageId,
        payload: {
          name: data.name,
          native_name: data.nativeName,
          direction: data.direction.toLowerCase() as "ltr" | "rtl",
          sort_order: data.sortOrder,
          is_active: data.status === "Active",
        },
      });
      toast.success("Language updated");
      navigate({ to: ROUTES.SYS_LANGUAGE });
    } catch (err) {
      toast.error(isAuthApiError(err) ? "Backend admin auth is required to update language." : "Unable to update language");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <PageHeader title="Edit Language" breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "Languages", to: ROUTES.SYS_LANGUAGE }, { label: "Edit Language" }]} actions={<Button type="submit" disabled={updateLanguage.isPending}><Save className="mr-2 h-4 w-4" />{updateLanguage.isPending ? "Saving..." : "Save Changes"}</Button>} />
      <FormSection title="Language Details" description={languageQuery.error ? "Unable to load language from backend." : languageQuery.isLoading ? "Loading language details..." : undefined}>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Language Name" error={errors.name?.message}><Input {...register("name")} /></Field>
          <Field label="Native Name" error={errors.nativeName?.message}><Input {...register("nativeName")} /></Field>
          <Field label="Language Code"><Input value={language?.code ?? ""} disabled /></Field>
          <Field label="Text Direction"><Select value={language?.direction ?? "LTR"} onValueChange={(v) => setValue("direction", v as FormValues["direction"])}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="LTR">LTR</SelectItem><SelectItem value="RTL">RTL</SelectItem></SelectContent></Select></Field>
          <Field label="Sort Order" error={errors.sortOrder?.message}><Input type="number" {...register("sortOrder")} /></Field>
          <Field label="Status"><Select value={language?.status === "Inactive" ? "Inactive" : "Active"} onValueChange={(v) => setValue("status", v as FormValues["status"])}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Active">Active</SelectItem><SelectItem value="Inactive">Inactive</SelectItem></SelectContent></Select></Field>
        </div>
      </FormSection>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label>{label}</Label>{children}{error && <p className="text-xs text-destructive">{error}</p>}</div>;
}
