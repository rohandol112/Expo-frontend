import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ArrowLeft, Save, ImageIcon, Video } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { FormSection } from "@/components/forms/FormSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ROUTES } from "@/constants/routes.constants";
import { isAuthApiError } from "@/lib/apiError";
import { useCategories, useCategory, useUpdateCategory } from "@/hooks/api/useCategories";
import { useLanguages } from "@/hooks/api/useLanguages";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/categories/$categoryId/edit")({ component: EditCategoryPage });

const schema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  language: z.string().min(1),
  description: z.string().optional(),
  parentId: z.string().optional(),
  status: z.enum(["Active", "Inactive"]),
  displayOrder: z.coerce.number().min(0),
  iconUrl: z.string().url().or(z.literal("")),
  featured: z.boolean(),
});
type FormValues = z.infer<typeof schema>;

function EditCategoryPage() {
  const { categoryId } = Route.useParams();
  const navigate = useNavigate();
  const categoryQuery = useCategory(categoryId);
  const languagesQuery = useLanguages();
  const categoriesQuery = useCategories();
  const updateCategory = useUpdateCategory();
  
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [iconPreviewUrl, setIconPreviewUrl] = useState<string | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);

  const category = categoryQuery.data;

  const { register, setValue, watch, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { status: "Active", displayOrder: 0, iconUrl: "", parentId: "none", featured: false },
  });

  const selectedLanguage = watch("language");
  const featured = watch("featured");

  useEffect(() => {
    if (iconFile) {
      const url = URL.createObjectURL(iconFile);
      setIconPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else if (category?.imageUrl) {
      setIconPreviewUrl(category.imageUrl);
    } else {
      setIconPreviewUrl(null);
    }
  }, [iconFile, category?.imageUrl]);

  useEffect(() => {
    if (videoFile) {
      const url = URL.createObjectURL(videoFile);
      setVideoPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setVideoPreviewUrl(null);
    }
  }, [videoFile]);

  useEffect(() => {
    if (!category) return;
    const languageCode = languagesQuery.data?.items.find((l) => l.name === category.language || l.code === category.language)?.code ?? "hi";
    reset({
      name: category.name,
      slug: category.slug,
      language: languageCode,
      description: "",
      parentId: "none",
      status: category.status === "Inactive" ? "Inactive" : "Active",
      displayOrder: category.displayOrder,
      iconUrl: category.imageUrl || "",
      featured: category.featured || false,
    });
  }, [category, languagesQuery.data?.items, reset]);

  const onSubmit = async (data: FormValues) => {
    try {
      await updateCategory.mutateAsync({
        id: categoryId,
        payload: {
          slug: data.slug,
          parent_id: data.parentId && data.parentId !== "none" ? Number(data.parentId) : null,
          icon_url: data.iconUrl || null,
          sort_order: data.displayOrder,
          is_active: data.status === "Active",
          is_featured: data.featured,
          translations: [{ language_code: data.language || "hi", name: data.name, description: data.description || null }],
        },
      });
      toast.success("Category updated");
      if (iconFile || videoFile) {
        toast.info("Selected media uploaded (simulated).");
      }
      navigate({ to: ROUTES.CATEGORIES });
    } catch (err) {
      toast.error(isAuthApiError(err) ? "Backend admin auth is required to update category." : "Unable to update category");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <PageHeader
        title="Edit Category"
        breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "Categories", to: ROUTES.CATEGORIES }, { label: "Edit Category" }]}
        actions={
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => navigate({ to: ROUTES.CATEGORIES })}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button type="submit" disabled={updateCategory.isPending}>
              <Save className="mr-2 h-4 w-4" /> {updateCategory.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        }
      />
      <FormSection title="Category Details" description={categoryQuery.error ? "Unable to load category." : categoryQuery.isLoading ? "Loading..." : undefined}>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Category Name" error={errors.name?.message}><Input {...register("name")} /></Field>
          <Field label="Slug" error={errors.slug?.message}><Input {...register("slug")} /></Field>
          <Field label="Language">
            <Select value={selectedLanguage} onValueChange={(v) => setValue("language", v)}>
              <SelectTrigger><SelectValue placeholder="Select language" /></SelectTrigger>
              <SelectContent>
                {(languagesQuery.data?.items ?? []).map((l) => (
                  <SelectItem key={l.id} value={l.code}>{l.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Parent Category">
            <Select value={watch("parentId")} onValueChange={(v) => setValue("parentId", v)}>
              <SelectTrigger><SelectValue placeholder="Optional parent" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Parent</SelectItem>
                {(categoriesQuery.data?.items ?? [])
                  .filter((item) => item.id !== categoryId)
                  .map((item) => (
                    <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Status">
            <Select value={watch("status")} onValueChange={(v) => setValue("status", v as FormValues["status"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Display Order" error={errors.displayOrder?.message}><Input type="number" {...register("displayOrder")} /></Field>
          <Field label="Icon URL" error={errors.iconUrl?.message}><Input {...register("iconUrl")} /></Field>
          
          <Field label="Category Icon">
            <div className="space-y-2">
              {iconPreviewUrl && (
                <div className="h-20 w-20 rounded-md overflow-hidden border bg-muted">
                  <img src={iconPreviewUrl} alt="Icon Preview" className="h-full w-full object-cover" />
                </div>
              )}
              <MediaInput icon={<ImageIcon className="h-5 w-5" />} label={iconFile ? iconFile.name : "Choose icon image"} accept="image/*" onChange={setIconFile} />
            </div>
          </Field>

          <Field label="Category Video">
            <div className="space-y-2">
              {videoPreviewUrl && (
                <div className="h-20 w-32 rounded-md overflow-hidden border bg-muted">
                  <video src={videoPreviewUrl} controls className="h-full w-full object-cover" />
                </div>
              )}
              <MediaInput icon={<Video className="h-5 w-5" />} label={videoFile ? videoFile.name : "Choose video file"} accept="video/*" onChange={setVideoFile} />
            </div>
          </Field>
          
          <label className="flex items-center justify-between rounded-lg border p-3 text-sm h-12 mt-8">
            <span>Featured Category</span>
            <Switch checked={featured} onCheckedChange={(v) => setValue("featured", v)} />
          </label>
        </div>
        <Field label="Description"><Input {...register("description")} placeholder="Short category description" /></Field>
      </FormSection>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label>{label}</Label>{children}{error && <p className="text-xs text-destructive">{error}</p>}</div>;
}

function MediaInput({ icon, label, accept, onChange }: { icon: React.ReactNode; label: string; accept: string; onChange: (file: File | null) => void }) {
  return (
    <label className="flex h-20 cursor-pointer items-center justify-center gap-3 rounded-md border border-dashed bg-background text-sm transition hover:border-primary/70 hover:bg-primary/5">
      <Input type="file" accept={accept} className="sr-only" onChange={(event) => onChange(event.target.files?.[0] ?? null)} />
      {icon}
      <span className="max-w-[220px] truncate">{label}</span>
    </label>
  );
}
