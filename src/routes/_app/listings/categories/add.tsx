import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Save } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { FormSection } from "@/components/forms/FormSection";
import { ImageUploadGrid } from "@/components/forms/ImageUploadGrid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCreateListingCategory, useListingCategories, useUpdateListingCategory } from "@/hooks/api/useListingCategories";
import { ROUTES } from "@/constants/routes.constants";
import { toast } from "sonner";
import type { ListingCategory, ListingCategoryInput } from "@/types/listingCategory";
import type { ImageValue } from "@/lib/mediaUpload";

export const Route = createFileRoute("/_app/listings/categories/add")({ component: AddCategoryPage });

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

/** Runs a save, leaving error toasts to the mutation hooks; resolves true on success. */
async function attempt(run: () => Promise<unknown>): Promise<boolean> {
  try {
    await run();
    return true;
  } catch {
    return false;
  }
}

function AddCategoryPage() {
  const navigate = useNavigate();
  return <CategoryForm onDone={() => navigate({ to: ROUTES.LISTINGS_CATEGORIES })} />;
}

export function CategoryForm({ onDone, initial }: { onDone: () => void; initial?: ListingCategory }) {
  const createCategory = useCreateListingCategory();
  const updateCategory = useUpdateListingCategory();
  const categoriesQuery = useListingCategories();
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initial));
  const [icon, setIcon] = useState<ImageValue[]>(initial?.icon ? [initial.icon] : []);
  const [status, setStatus] = useState<"Active" | "Inactive">((initial?.status as "Active" | "Inactive") ?? "Active");
  const [sortOrder, setSortOrder] = useState(initial?.sortOrder ?? (categoriesQuery.data?.items.length ?? 0) + 1);

  const saving = createCategory.isPending || updateCategory.isPending;

  const submit = async () => {
    if (!name.trim() || !slug.trim()) {
      toast.error("Please enter a category name and slug.");
      return;
    }
    const payload: ListingCategoryInput = { name, slug, icon, status, sortOrder };
    const saved = await attempt(() => (initial ? updateCategory.mutateAsync({ id: initial.id, payload }) : createCategory.mutateAsync(payload)));
    if (!saved) return;
    toast.success(initial ? "Category updated" : "Category saved");
    onDone();
  };

  return (
    <div>
      <div className="grid gap-4 lg:grid-cols-2">
        <FormSection title="Category Information">
          <div className="space-y-2">
            <Label>Category Name <span className="text-destructive">*</span></Label>
            <Input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!slugTouched) setSlug(slugify(e.target.value));
              }}
              placeholder="Enter category name"
            />
            <p className="text-xs text-muted-foreground">This name will be displayed in the app and admin panel.</p>
          </div>
          <div className="space-y-2">
            <Label>Category Slug (URL) <span className="text-destructive">*</span></Label>
            <Input value={slug} onChange={(e) => { setSlug(e.target.value); setSlugTouched(true); }} placeholder="enter-category-slug" />
            <p className="text-xs text-muted-foreground">URL friendly name. Use lowercase letters, numbers and hyphens only.</p>
          </div>
          <div className="space-y-2">
            <Label>Status <span className="text-destructive">*</span></Label>
            <RadioGroup value={status} onValueChange={(v) => setStatus(v as "Active" | "Inactive")} className="flex gap-6">
              <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="Active" />Active</label>
              <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="Inactive" />Inactive</label>
            </RadioGroup>
          </div>
          <div className="space-y-2">
            <Label>Sort Order <span className="text-destructive">*</span></Label>
            <Input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} />
            <p className="text-xs text-muted-foreground">Lower numbers will appear first.</p>
          </div>
        </FormSection>
        <FormSection title="Category Icon">
          <ImageUploadGrid label="Icon" hint="JPG, PNG, SVG, WebP — Max. 2MB" value={icon} onChange={setIcon} />
        </FormSection>
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onDone}>Cancel</Button>
        <Button type="button" onClick={submit} disabled={saving}><Save className="mr-2 h-4 w-4" />{saving ? "Saving..." : initial ? "Save Changes" : "Save Category"}</Button>
      </div>
    </div>
  );
}
