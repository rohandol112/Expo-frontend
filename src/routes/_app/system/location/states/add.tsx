import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ArrowLeft, ImageIcon, Info, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { FormSection } from "@/components/forms/FormSection";
import { SectionCard } from "@/components/admin/SectionCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ROUTES } from "@/constants/routes.constants";
import { useCreateState, useStateImageUploadUrl } from "@/hooks/api/useLocations";
import { useLanguages } from "@/hooks/api/useLanguages";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/system/location/states/add")({
  validateSearch: (search: Record<string, unknown>) => ({
    language_code: typeof search.language_code === "string" && search.language_code ? search.language_code : undefined,
  }),
  component: AddStatePage,
});

const schema = z.object({
  name: z.string().min(2),
  code: z.string().min(2).max(12),
  languageCode: z.string().min(1),
  sortOrder: z.coerce.number().min(0),
  status: z.enum(["Active", "Inactive"]),
  imageKey: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

function AddStatePage() {
  const navigate = useNavigate();
  const { language_code } = Route.useSearch();
  const createState = useCreateState();
  const uploadImageMutation = useStateImageUploadUrl();
  const languagesQuery = useLanguages({ is_active: true });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const { register, setValue, watch, handleSubmit, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { languageCode: language_code ?? "en", sortOrder: 0, status: "Active" } });
  const selectedLanguage = watch("languageCode");

  useEffect(() => {
    if (imageFile) {
      const url = URL.createObjectURL(imageFile);
      setImagePreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setImagePreviewUrl(null);
    }
  }, [imageFile]);

  const onSubmit = (values: FormValues) => {
    createState.mutate(
      { language_code: values.languageCode, code: values.code, name: values.name, sort_order: values.sortOrder, is_active: values.status === "Active", image_key: values.imageKey || undefined },
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
            <Field label="State Flag / Icon">
              <div className="space-y-2">
                {imagePreviewUrl && (
                  <div className="h-20 w-20 rounded-md overflow-hidden border bg-muted">
                    <img src={imagePreviewUrl} alt="Flag Preview" className="h-full w-full object-cover" />
                  </div>
                )}
                <label className="flex h-20 cursor-pointer items-center justify-center gap-3 rounded-md border border-dashed bg-background text-sm transition hover:border-primary/70 hover:bg-primary/5">
                  <Input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(event) => {
                      const file = event.target.files?.[0] ?? null;
                      if (!file) return;
                      setImageFile(file);
                      uploadImageMutation.mutate(
                        { file_name: file.name, content_type: file.type || "image/png" },
                        {
                          onSuccess: async (result) => {
                            try {
                              await fetch(result.upload_url, {
                                method: "PUT",
                                body: file,
                                headers: { "Content-Type": file.type || "image/png" },
                              });
                              setValue("imageKey", result.file_key, { shouldDirty: true });
                              toast.success("Flag uploaded.");
                            } catch {
                              toast.error("Failed to upload flag to storage.");
                            }
                          },
                          onError: (err) => toast.error(err.message || "Failed to generate upload URL."),
                        }
                      );
                    }}
                  />
                  <ImageIcon className="h-5 w-5" />
                  <span className="max-w-[220px] truncate">{uploadImageMutation.isPending ? "Uploading flag..." : imageFile?.name || "Choose flag image"}</span>
                </label>
              </div>
            </Field>
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
