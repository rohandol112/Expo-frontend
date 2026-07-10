import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ArrowLeft, ImageIcon, Save, Video } from "lucide-react";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { FormSection } from "@/components/forms/FormSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ROUTES } from "@/constants/routes.constants";
import { useCategories, useCreateCategory } from "@/hooks/api/useCategories";
import { useLanguages } from "@/hooks/api/useLanguages";
import { isAuthApiError } from "@/lib/apiError";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/categories/add")({ component: AddCategoryPage });

const schema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  language: z.string().min(1),
  description: z.string().optional(),
  parentId: z.string().optional(),
  status: z.enum(["Active", "Inactive"]),
  featured: z.boolean(),
  displayOrder: z.coerce.number().min(1),
  iconUrl: z.string().url().or(z.literal("")),
});
type FormValues = z.infer<typeof schema>;

function AddCategoryPage() {
  const navigate = useNavigate();
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [iconPreviewUrl, setIconPreviewUrl] = useState<string | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (iconFile) {
      const url = URL.createObjectURL(iconFile);
      setIconPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setIconPreviewUrl(null);
    }
  }, [iconFile]);

  useEffect(() => {
    if (videoFile) {
      const url = URL.createObjectURL(videoFile);
      setVideoPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setVideoPreviewUrl(null);
    }
  }, [videoFile]);

  const createCategory = useCreateCategory();
  const languagesQuery = useLanguages({ is_active: true });
  const categoriesQuery = useCategories();
  const { register, setValue, watch, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { status: "Active", featured: false, displayOrder: 1, iconUrl: "", parentId: "none" },
  });
  const selectedLanguage = watch("language");

  useEffect(() => {
    if (!selectedLanguage && languagesQuery.data?.items?.[0]?.code) {
      setValue("language", languagesQuery.data.items[0].code, { shouldValidate: true });
    }
  }, [languagesQuery.data?.items, selectedLanguage, setValue]);
  const onSubmit = async (data: FormValues) => {
    try {
      await createCategory.mutateAsync({
        slug: data.slug,
        parent_id: data.parentId && data.parentId !== "none" ? Number(data.parentId) : null,
        icon_url: data.iconUrl || null,
        sort_order: data.displayOrder,
        is_active: data.status === "Active",
        is_featured: data.featured,
        translations: [{ language_code: data.language, name: data.name, description: data.description || null }],
      });
      toast.success("Category saved");
      if (iconFile || videoFile) toast.info("Selected media will be uploaded after category upload endpoints are available.");
      navigate({ to: ROUTES.CATEGORIES });
    } catch (err) {
      toast.error(isAuthApiError(err) ? "Backend admin auth is required to save category." : "Unable to save category");
    }
  };

  const onInvalid = () => toast.error("Please complete the required category fields.");

  return (
    <form onSubmit={handleSubmit(onSubmit, onInvalid)}>
      <PageHeader
        title="Add Category"
        breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "Categories", to: ROUTES.CATEGORIES }, { label: "Add Category" }]}
        actions={
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => navigate({ to: ROUTES.CATEGORIES })}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button type="submit" disabled={createCategory.isPending}><Save className="mr-2 h-4 w-4" />{createCategory.isPending ? "Saving..." : "Save Category"}</Button>
          </div>
        }
      />
      <FormSection title="Category Details">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Category Name" error={errors.name?.message}><Input {...register("name")} placeholder="Politics" /></Field>
          <Field label="Slug" error={errors.slug?.message}><Input {...register("slug")} placeholder="politics" /></Field>
          <Field label="Language" error={errors.language?.message}><Select value={selectedLanguage} onValueChange={(v) => setValue("language", v, { shouldValidate: true })}><SelectTrigger><SelectValue placeholder="Select language" /></SelectTrigger><SelectContent>{(languagesQuery.data?.items ?? []).map((l) => <SelectItem key={l.id} value={l.code}>{l.name}</SelectItem>)}</SelectContent></Select></Field>
          <Field label="Parent Category"><Select defaultValue="none" onValueChange={(v) => setValue("parentId", v, { shouldValidate: true })}><SelectTrigger><SelectValue placeholder="Optional parent" /></SelectTrigger><SelectContent><SelectItem value="none">No Parent</SelectItem>{(categoriesQuery.data?.items ?? []).map((category) => <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>)}</SelectContent></Select></Field>
          <Field label="Status"><Select defaultValue="Active" onValueChange={(v) => setValue("status", v as FormValues["status"], { shouldValidate: true })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Active">Active</SelectItem><SelectItem value="Inactive">Inactive</SelectItem></SelectContent></Select></Field>
          <Field label="Display Order" error={errors.displayOrder?.message}><Input type="number" {...register("displayOrder")} /></Field>
          <Field label="Icon URL" error={errors.iconUrl?.message}><Input {...register("iconUrl")} placeholder="https://example.com/category.png" /></Field>
          <Field label="Upload Icon">
            <div className="space-y-2">
              {iconPreviewUrl && (
                <div className="h-20 w-20 rounded-md overflow-hidden border bg-muted">
                  <img src={iconPreviewUrl} alt="Icon Preview" className="h-full w-full object-cover" />
                </div>
              )}
              <MediaInput icon={<ImageIcon className="h-5 w-5" />} label={iconFile?.name || "Choose image file"} accept="image/*" onChange={setIconFile} />
            </div>
          </Field>
          <Field label="Category Video">
            <div className="space-y-2">
              {videoPreviewUrl && (
                <div className="h-20 w-32 rounded-md overflow-hidden border bg-muted">
                  <video src={videoPreviewUrl} controls className="h-full w-full object-cover" />
                </div>
              )}
              <MediaInput icon={<Video className="h-5 w-5" />} label={videoFile?.name || "Choose video file"} accept="video/*" onChange={setVideoFile} />
            </div>
          </Field>
          <label className="flex items-center justify-between rounded-lg border p-3 text-sm"><span>Featured Category</span><Switch onCheckedChange={(v) => setValue("featured", v)} /></label>
        </div>
        <Field label="Description"><Input {...register("description")} placeholder="Short category description" /></Field>
        <p className="text-xs text-muted-foreground">TODO: Backend category media supports `icon_url` only. Real image/video upload will be wired after upload endpoints are available for categories.</p>
      </FormSection>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label>{label}</Label>{children}{error && <p className="text-xs text-destructive">{error}</p>}</div>;
}

function MediaInput({ icon, label, accept, onChange }: { icon: React.ReactNode; label: string; accept: string; onChange: (file: File | null) => void }) {
  return (
    <label className="flex h-24 cursor-pointer items-center justify-center gap-3 rounded-md border border-dashed bg-background text-sm transition hover:border-primary/70 hover:bg-primary/5">
      <Input type="file" accept={accept} className="sr-only" onChange={(event) => onChange(event.target.files?.[0] ?? null)} />
      {icon}
      <span className="max-w-[220px] truncate">{label}</span>
    </label>
  );
}
