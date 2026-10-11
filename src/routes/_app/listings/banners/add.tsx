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
import type { Banner } from "@/types/banner";

export const Route = createFileRoute("/_app/listings/banners/add")({ component: AddBannerPage });

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
  const [image, setImage] = useState<File[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [link, setLink] = useState(initial?.link ?? "");
  const [status, setStatus] = useState<"Active" | "Inactive">((initial?.status as "Active" | "Inactive") ?? "Active");
  const [categoryIds, setCategoryIds] = useState<string[]>(initial?.categoryIds ?? []);
  const [subCategoryIds, setSubCategoryIds] = useState<string[]>(initial?.subCategoryIds ?? []);
  const [state, setState] = useState(initial?.state ?? "");
  const [district, setDistrict] = useState(initial?.district ?? "");
  const [area, setArea] = useState(initial?.area ?? "");
  const [sortOrder, setSortOrder] = useState(initial?.sortOrder ?? (bannersQuery.data?.items.length ?? 0) + 1);

  const saving = createBanner.isPending || updateBanner.isPending;

  useEffect(() => {
    if (image[0]) {
      const url = URL.createObjectURL(image[0]);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreviewUrl(null);
  }, [image]);

  const categoriesById = new Map((categoriesQuery.data?.items ?? []).map((c) => [c.id, c.name]));
  const subCategoriesById = new Map((subCategoriesQuery.data?.items ?? []).map((s) => [s.id, s.name]));

  const save = async (saveStatus: "Active" | "Inactive") => {
    if (!name.trim() || (image.length === 0 && !initial?.image) || !link.trim()) {
      toast.error("Please fill in banner name, image and link.");
      return;
    }
    const payload = {
      name,
      image: image[0]?.name ?? initial?.image,
      link,
      status: saveStatus,
      categoryIds,
      category: categoryIds.map((id) => categoriesById.get(id)).filter(Boolean).join(", "),
      subCategoryIds,
      subcategory: subCategoryIds.map((id) => subCategoriesById.get(id)).filter(Boolean).join(", "),
      stateIds: [], districtIds: [], areaIds: [],
      state, district, area,
      sortOrder,
    };
    if (initial) {
      await updateBanner.mutateAsync({ id: initial.id, payload });
    } else {
      await createBanner.mutateAsync(payload);
    }
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
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2"><Label>State</Label><Input value={state} onChange={(e) => setState(e.target.value)} placeholder="Select States" /></div>
              <div className="space-y-2"><Label>District</Label><Input value={district} onChange={(e) => setDistrict(e.target.value)} placeholder="Select Districts" /></div>
              <div className="space-y-2"><Label>Area / City</Label><Input value={area} onChange={(e) => setArea(e.target.value)} placeholder="Select Areas / Cities" /></div>
            </div>
            <p className="text-xs text-muted-foreground">You can select multiple states, districts and areas.</p>
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
        <Button type="button" variant="outline" onClick={() => save("Inactive")} disabled={saving}><Save className="mr-2 h-4 w-4" />Save as Draft</Button>
        <Button type="button" onClick={() => save(status)} disabled={saving}><Save className="mr-2 h-4 w-4" />{saving ? "Saving..." : initial ? "Save Changes" : "Save Banner"}</Button>
      </div>
    </div>
  );
}
