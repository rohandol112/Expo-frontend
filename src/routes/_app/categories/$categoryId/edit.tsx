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
});
type FormValues = z.infer<typeof schema>;

function EditCategoryPage() {
  const { categoryId } = Route.useParams();
  const navigate = useNavigate();
  const categoryQuery = useCategory(categoryId);
  const languagesQuery = useLanguages();
  const categoriesQuery = useCategories();
  const updateCategory = useUpdateCategory();
  const category = categoryQuery.data;
  const { register, setValue, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { status: "Active", displayOrder: 0, iconUrl: "", parentId: "none" },
  });

  useEffect(() => {
    if (!category) return;
    const languageCode = languagesQuery.data?.items.find((language) => language.name === category.language || language.code === category.language)?.code ?? "";
    reset({ name: category.name, slug: category.slug, language: languageCode, description: "", parentId: "none", status: category.status === "Inactive" ? "Inactive" : "Active", displayOrder: category.displayOrder, iconUrl: category.imageUrl || "" });
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
          translations: [{ language_code: data.language || "hi", name: data.name, description: data.description || null }],
        },
      });
      toast.success("Category updated");
      navigate({ to: ROUTES.CATEGORIES });
    } catch (err) {
      toast.error(isAuthApiError(err) ? "Backend admin auth is required to update category." : "Unable to update category");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <PageHeader title="Edit Category" breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "Categories", to: ROUTES.CATEGORIES }, { label: "Edit Category" }]} actions={<Button type="submit" disabled={updateCategory.isPending}><Save className="mr-2 h-4 w-4" />{updateCategory.isPending ? "Saving..." : "Save Changes"}</Button>} />
      <FormSection title="Category Details" description={categoryQuery.error ? "Unable to load category from backend." : categoryQuery.isLoading ? "Loading category details..." : "Backend supports icon_url only for category media right now."}>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Category Name" error={errors.name?.message}><Input {...register("name")} /></Field>
          <Field label="Slug" error={errors.slug?.message}><Input {...register("slug")} /></Field>
          <Field label="Language"><Select onValueChange={(v) => setValue("language", v)}><SelectTrigger><SelectValue placeholder={category?.language || "Select language"} /></SelectTrigger><SelectContent>{(languagesQuery.data?.items ?? []).map((l) => <SelectItem key={l.id} value={l.code}>{l.name}</SelectItem>)}</SelectContent></Select></Field>
          <Field label="Parent Category"><Select defaultValue="none" onValueChange={(v) => setValue("parentId", v)}><SelectTrigger><SelectValue placeholder="Optional parent" /></SelectTrigger><SelectContent><SelectItem value="none">No Parent</SelectItem>{(categoriesQuery.data?.items ?? []).filter((item) => item.id !== categoryId).map((item) => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}</SelectContent></Select></Field>
          <Field label="Status"><Select value={category?.status === "Inactive" ? "Inactive" : "Active"} onValueChange={(v) => setValue("status", v as FormValues["status"])}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Active">Active</SelectItem><SelectItem value="Inactive">Inactive</SelectItem></SelectContent></Select></Field>
          <Field label="Display Order" error={errors.displayOrder?.message}><Input type="number" {...register("displayOrder")} /></Field>
          <Field label="Icon URL" error={errors.iconUrl?.message}><Input {...register("iconUrl")} /></Field>
        </div>
        <Field label="Description"><Input {...register("description")} placeholder="Short category description" /></Field>
      </FormSection>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label>{label}</Label>{children}{error && <p className="text-xs text-destructive">{error}</p>}</div>;
}
