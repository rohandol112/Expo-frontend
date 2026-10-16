import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Save, Store, Package, Wrench } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { FormSection } from "@/components/forms/FormSection";
import { ImageUploadGrid } from "@/components/forms/ImageUploadGrid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useListingCategories } from "@/hooks/api/useListingCategories";
import { useCreateListingSubCategory, useListingSubCategories, useUpdateListingSubCategory } from "@/hooks/api/useListingSubCategories";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/routes.constants";
import { toast } from "sonner";
import type { ListingType } from "@/types/listing";
import type { ListingSubCategory, ListingSubCategoryInput } from "@/types/listingCategory";
import type { ImageValue } from "@/lib/mediaUpload";

export const Route = createFileRoute("/_app/listings/sub-categories/add")({ component: AddSubCategoryPage });

const TYPES: { value: ListingType; label: string; desc: string; icon: typeof Store }[] = [
  { value: "Shop", label: "Shops", desc: "Physical or online stores", icon: Store },
  { value: "Product", label: "Products", desc: "Sellable items", icon: Package },
  { value: "Service", label: "Services", desc: "Services & solutions", icon: Wrench },
];

/** Runs a save, leaving error toasts to the mutation hooks; resolves true on success. */
async function attempt(run: () => Promise<unknown>): Promise<boolean> {
  try {
    await run();
    return true;
  } catch {
    return false;
  }
}

function AddSubCategoryPage() {
  const navigate = useNavigate();
  return <SubCategoryForm onDone={() => navigate({ to: ROUTES.LISTINGS_SUB_CATEGORIES })} />;
}

export function SubCategoryForm({ onDone, initial }: { onDone: () => void; initial?: ListingSubCategory }) {
  const categoriesQuery = useListingCategories();
  const subCategoriesQuery = useListingSubCategories();
  const createSubCategory = useCreateListingSubCategory();
  const updateSubCategory = useUpdateListingSubCategory();
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? "");
  const [name, setName] = useState(initial?.name ?? "");
  const [type, setType] = useState<ListingType>(initial?.type ?? "Shop");
  const [icon, setIcon] = useState<ImageValue[]>(initial?.icon ? [initial.icon] : []);
  const [status, setStatus] = useState<"Active" | "Inactive">((initial?.status as "Active" | "Inactive") ?? "Active");
  const [sortOrder, setSortOrder] = useState(initial?.sortOrder ?? (subCategoriesQuery.data?.items.length ?? 0) + 1);
  const [displayOnHome, setDisplayOnHome] = useState(initial?.displayOnHome ?? true);

  const saving = createSubCategory.isPending || updateSubCategory.isPending;

  const submit = async () => {
    const category = categoriesQuery.data?.items.find((c) => c.id === categoryId);
    if (!category || !name.trim()) {
      toast.error("Please select a category and enter a sub category name.");
      return;
    }
    const payload: ListingSubCategoryInput = { categoryId, name, type, icon, status, sortOrder, displayOnHome };
    const saved = await attempt(() => (initial ? updateSubCategory.mutateAsync({ id: initial.id, payload }) : createSubCategory.mutateAsync(payload)));
    if (!saved) return;
    toast.success(initial ? "Sub category updated" : "Sub category saved");
    onDone();
  };

  return (
    <div>
      <div className="grid gap-4 lg:grid-cols-2">
        <FormSection title="Sub Category Information">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category <span className="text-destructive">*</span></Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
                <SelectContent>{(categoriesQuery.data?.items ?? []).map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Select the parent category under which this sub category will be added.</p>
            </div>
            <div className="space-y-2">
              <Label>Sub Category Name <span className="text-destructive">*</span></Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter sub category name" />
              <p className="text-xs text-muted-foreground">This name will be displayed in the app and admin panel.</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Type <span className="text-destructive">*</span></Label>
            <div className="grid grid-cols-3 gap-3">
              {TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setType(t.value)}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-lg border p-4 text-center transition",
                    type === t.value ? "border-primary bg-primary/5" : "border-input hover:bg-accent",
                  )}
                >
                  <t.icon className="h-5 w-5 text-primary" />
                  <span className="text-sm font-semibold">{t.label}</span>
                  <span className="text-xs text-muted-foreground">{t.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Status <span className="text-destructive">*</span></Label>
            <RadioGroup value={status} onValueChange={(v) => setStatus(v as "Active" | "Inactive")} className="flex gap-6">
              <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="Active" />Active</label>
              <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="Inactive" />Inactive</label>
            </RadioGroup>
            <p className="text-xs text-muted-foreground">Inactive sub categories will not be visible in the app.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Sort Order <span className="text-destructive">*</span></Label>
              <Input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} />
              <p className="text-xs text-muted-foreground">Lower numbers will appear first.</p>
            </div>
            <label className="flex items-center justify-between self-end rounded-md border p-3 text-sm">
              <span>Display On Home</span>
              <Switch checked={displayOnHome} onCheckedChange={setDisplayOnHome} />
            </label>
          </div>
        </FormSection>
        <FormSection title="Sub Category Icon">
          <ImageUploadGrid label="Icon" hint="JPG, PNG, SVG, WebP — Max. 2MB" value={icon} onChange={setIcon} />
        </FormSection>
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onDone}>Cancel</Button>
        <Button type="button" onClick={submit} disabled={saving}><Save className="mr-2 h-4 w-4" />{saving ? "Saving..." : initial ? "Save Changes" : "Save Sub Category"}</Button>
      </div>
    </div>
  );
}
