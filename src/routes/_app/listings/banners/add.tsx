import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Save, ImageIcon } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { FormSection } from "@/components/forms/FormSection";
import { ImageUploadGrid } from "@/components/forms/ImageUploadGrid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MultiSelect } from "@/components/common/MultiSelect";
import { useListingCategories } from "@/hooks/api/useListingCategories";
import { useListingSubCategories } from "@/hooks/api/useListingSubCategories";
import { useCreateBanner, useBanners, useUpdateBanner } from "@/hooks/api/useBanners";
import { ROUTES } from "@/constants/routes.constants";
import { toast } from "sonner";
import type { Banner, BannerInput, BannerStatus } from "@/types/banner";
import { isStoredImage, type ImageValue } from "@/lib/mediaUpload";
import { CascadingLocationPicker, type CascadingLocationValue } from "@/components/forms/CascadingLocationPicker";

export const Route = createFileRoute("/_app/listings/banners/add")({ component: AddBannerPage });

/** Runs a save, leaving error toasts to the mutation hooks; resolves true on success. */
async function attempt(run: () => Promise<unknown>): Promise<boolean> {
  try {
    await run();
    return true;
  } catch {
    return false;
  }
}

function AddBannerPage() {
  const navigate = useNavigate();
  return <BannerForm onDone={() => navigate({ to: ROUTES.LISTINGS_BANNERS })} />;
}

export function BannerForm({ onDone, initial }: { onDone: () => void; initial?: Banner }) {
  const navigate = useNavigate();
  const categoriesQuery = useListingCategories();
  const subCategoriesQuery = useListingSubCategories();
  const bannersQuery = useBanners();
  const createBanner = useCreateBanner();
  const updateBanner = useUpdateBanner();

  const [name, setName] = useState(initial?.name ?? "");
  const [image, setImage] = useState<ImageValue[]>(initial?.image ? [initial.image] : []);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [link, setLink] = useState(initial?.link ?? "");
  const [status, setStatus] = useState<"Active" | "Inactive">(initial?.status === "Inactive" ? "Inactive" : "Active");
  const [categoryIds, setCategoryIds] = useState<string[]>(initial?.categoryIds ?? []);
  const [subCategoryIds, setSubCategoryIds] = useState<string[]>(initial?.subCategoryIds ?? []);
  const [regions, setRegions] = useState<CascadingLocationValue>({
    states: initial?.stateIds ?? [],
    districts: initial?.districtIds ?? [],
    areas: initial?.areaIds ?? [],
  });
  const [sortOrder, setSortOrder] = useState(initial?.sortOrder ?? (bannersQuery.data?.items.length ?? 0) + 1);

  const saving = createBanner.isPending || updateBanner.isPending;

  useEffect(() => {
    const first = image[0];
    if (!first) {
      setPreviewUrl(null);
      return;
    }
    if (isStoredImage(first)) {
      setPreviewUrl(first.url);
      return;
    }
    const url = URL.createObjectURL(first);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  const save = async (saveStatus: BannerStatus) => {
    if (!name.trim()) {
      toast.error("Please enter a banner name.");
      return;
    }
    // A draft may be incomplete; publishing needs the image, link and a category.
    if (saveStatus !== "Draft" && (image.length === 0 || !link.trim() || categoryIds.length === 0)) {
      toast.error("Please add the banner image, link and at least one category, or save it as a draft.");
      return;
    }
    const payload: BannerInput = {
      name,
      image,
      link,
      status: saveStatus,
      categoryIds,
      subCategoryIds,
      stateIds: regions.states,
      districtIds: regions.districts,
      areaIds: regions.areas,
      sortOrder,
    };
    const saved = await attempt(() => (initial ? updateBanner.mutateAsync({ id: initial.id, payload }) : createBanner.mutateAsync(payload)));
    if (!saved) return;
    toast.success(initial ? "Banner updated" : "Banner saved");
    onDone();
  };

  return (
    <div>
      <PageHeader
        title={initial ? "Edit Banner" : "Add New Banner"}
        description={initial ? "Update the banner details below." : "Create a new banner to be displayed in the app."}
        breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "Banners", to: ROUTES.LISTINGS_BANNERS }, { label: initial ? "Edit" : "Add New Banner" }]}
        actions={<Button type="button" variant="outline" onClick={() => navigate({ to: ROUTES.LISTINGS_BANNERS })}><ArrowLeft className="mr-2 h-4 w-4" />Back to Banners</Button>}
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <FormSection title="Banner Information">
          <div className="space-y-2">
            <Label>Banner Name <span className="text-destructive">*</span></Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter banner name" />
            <p className="text-xs text-muted-foreground">This name is for internal reference only.</p>
          </div>
          <ImageUploadGrid label="Banner Image" hint="Recommended size: 1920 x 600 px — Max 2MB (JPG, PNG, WebP)" value={image} onChange={setImage} />
          <div className="space-y-2">
            <Label>URL in App / Link <span className="text-destructive">*</span></Label>
            <Input value={link} onChange={(e) => setLink(e.target.value)} placeholder="Enter URL or link" />
            <p className="text-xs text-muted-foreground">Enter the URL where users will be redirected on banner click.</p>
          </div>
          <div className="space-y-2">
            <Label>Status <span className="text-destructive">*</span></Label>
            <RadioGroup value={status} onValueChange={(v) => setStatus(v as "Active" | "Inactive")} className="flex gap-6">
              <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="Active" />Active</label>
              <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="Inactive" />Inactive</label>
            </RadioGroup>
            <p className="text-xs text-muted-foreground">Inactive banners will not be displayed in the app.</p>
          </div>
        </FormSection>

        <div className="space-y-4">
          <FormSection title="Category & Sub Category">
            <div className="space-y-2">
              <Label>Category</Label>
              <MultiSelect options={(categoriesQuery.data?.items ?? []).map((c) => ({ label: c.name, value: c.id }))} value={categoryIds} onChange={setCategoryIds} placeholder="Select Categories" />
            </div>
            <div className="space-y-2">
              <Label>Sub Category</Label>
              <MultiSelect options={(subCategoriesQuery.data?.items ?? []).map((s) => ({ label: s.name, value: s.id }))} value={subCategoryIds} onChange={setSubCategoryIds} placeholder="Select Sub Categories" />
            </div>
            <p className="text-xs text-muted-foreground">You can select multiple categories and sub categories.</p>
          </FormSection>

          <FormSection title="Location">
            <CascadingLocationPicker value={regions} onChange={setRegions} />
            <p className="text-xs text-muted-foreground">Leave everything empty to show the banner everywhere.</p>
          </FormSection>

          <FormSection title="Display & Order">
            <div className="space-y-2">
              <Label>Select Order <span className="text-destructive">*</span></Label>
              <Input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} placeholder="Enter order" />
              <p className="text-xs text-muted-foreground">Lower numbers will be displayed first.</p>
            </div>
          </FormSection>
        </div>
      </div>

      <FormSection title="Preview" className="mt-4">
        <div className="flex h-40 items-center justify-center rounded-md border bg-muted/40 text-sm text-muted-foreground">
          {previewUrl ? <img src={previewUrl} alt="Banner preview" className="h-full w-full rounded-md object-cover" /> : (
            <div className="flex flex-col items-center gap-2">
              <ImageIcon className="h-6 w-6" />
              <span>Upload an image to see preview</span>
            </div>
          )}
        </div>
      </FormSection>

      <div className="mt-6 flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => navigate({ to: ROUTES.LISTINGS_BANNERS })}>Cancel</Button>
        <Button type="button" variant="outline" onClick={() => save("Draft")} disabled={saving}><Save className="mr-2 h-4 w-4" />Save as Draft</Button>
        <Button type="button" onClick={() => save(status)} disabled={saving}><Save className="mr-2 h-4 w-4" />{saving ? "Saving..." : initial ? "Save Changes" : "Save Banner"}</Button>
      </div>
    </div>
  );
}
