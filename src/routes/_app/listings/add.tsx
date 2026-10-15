import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Store, Package, Wrench, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { FormSection } from "@/components/forms/FormSection";
import { ImageUploadGrid } from "@/components/forms/ImageUploadGrid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { MultiSelect } from "@/components/common/MultiSelect";
import { useListingCategories } from "@/hooks/api/useListingCategories";
import { useListingSubCategories } from "@/hooks/api/useListingSubCategories";
import { useCreateListing, useUpdateListing } from "@/hooks/api/useListings";
import { useListings } from "@/hooks/api/useListings";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/routes.constants";
import { toast } from "sonner";
import type { Listing, ListingType } from "@/types/listing";

export const Route = createFileRoute("/_app/listings/add")({ component: AddListingPage });

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function AddListingPage() {
  const navigate = useNavigate();
  const [type, setType] = useState<ListingType | null>(null);

  return (
    <div>
      <PageHeader
        title={type ? `Add New ${type}` : "Add New Listing"}
        breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "Listings", to: ROUTES.LISTINGS }, { label: type ? `Add New ${type}` : "Add New Listing" }]}
      />
      <FormSection title="Listing Type" description="Choose what you're adding — the form below adjusts to match.">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {([
            { value: "Shop" as const, label: "Shop", desc: "Physical or online stores", icon: Store },
            { value: "Product" as const, label: "Product", desc: "Sellable items", icon: Package },
            { value: "Service" as const, label: "Service", desc: "Services & solutions", icon: Wrench },
          ]).map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setType(opt.value)}
              className={cn(
                "flex flex-col items-center gap-2 rounded-lg border p-5 text-center transition",
                type === opt.value ? "border-primary bg-primary/5" : "border-input hover:bg-accent",
              )}
            >
              <opt.icon className="h-6 w-6 text-primary" />
              <span className="text-sm font-semibold">{opt.label}</span>
              <span className="text-xs text-muted-foreground">{opt.desc}</span>
            </button>
          ))}
        </div>
      </FormSection>

      {type === "Shop" && <ShopForm onDone={() => navigate({ to: ROUTES.LISTINGS })} />}
      {type === "Service" && <ServiceForm onDone={() => navigate({ to: ROUTES.LISTINGS })} />}
      {type === "Product" && <ProductForm onDone={() => navigate({ to: ROUTES.LISTINGS })} />}
    </div>
  );
}

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div className="space-y-2">
      <Label>{label}{required && <span className="text-destructive"> *</span>}</Label>
      {children}
    </div>
  );
}

function CounterTextarea({ value, onChange, max, placeholder, rows = 3 }: { value: string; onChange: (v: string) => void; max: number; placeholder?: string; rows?: number }) {
  return (
    <div className="relative">
      <Textarea value={value} onChange={(e) => onChange(e.target.value.slice(0, max))} placeholder={placeholder} rows={rows} />
      <span className="absolute bottom-2 right-3 text-xs text-muted-foreground">{value.length}/{max}</span>
    </div>
  );
}

function HighlightsField({ highlights, onChange }: { highlights: string[]; onChange: (next: string[]) => void }) {
  return (
    <div className="space-y-2">
      <Label>Highlights (Optional)</Label>
      {highlights.map((h, i) => (
        <div key={i} className="flex gap-2">
          <Input value={h} onChange={(e) => onChange(highlights.map((v, idx) => (idx === i ? e.target.value : v)))} placeholder="Enter highlight" />
          <Button type="button" variant="outline" size="icon" onClick={() => onChange(highlights.filter((_, idx) => idx !== i))}><Trash2 className="h-4 w-4" /></Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={() => onChange([...highlights, ""])}><Plus className="mr-2 h-4 w-4" />Add Highlight</Button>
    </div>
  );
}

function useCategoryOptions() {
  const categoriesQuery = useListingCategories();
  const subCategoriesQuery = useListingSubCategories();
  return {
    categoryOptions: (categoriesQuery.data?.items ?? []).map((c) => ({ label: c.name, value: c.id })),
    subCategoryOptions: (subCategoriesQuery.data?.items ?? []).map((s) => ({ label: s.name, value: s.id })),
    categoriesById: new Map((categoriesQuery.data?.items ?? []).map((c) => [c.id, c.name])),
    subCategoriesById: new Map((subCategoriesQuery.data?.items ?? []).map((s) => [s.id, s.name])),
  };
}

function baseListingPayload(opts: {
  name: string; type: ListingType; categoryIds: string[]; subCategoryIds: string[];
  categoriesById: Map<string, string>; subCategoriesById: Map<string, string>;
  location: Listing["location"]; status: "Active" | "Inactive";
}): Omit<Listing, "id" | "createdOn" | "views"> {
  return {
    name: opts.name,
    type: opts.type,
    categoryIds: opts.categoryIds,
    category: opts.categoryIds.map((id) => opts.categoriesById.get(id)).filter(Boolean).join(", "),
    subCategoryIds: opts.subCategoryIds,
    subcategory: opts.subCategoryIds.map((id) => opts.subCategoriesById.get(id)).filter(Boolean).join(", "),
    images: [],
    location: opts.location,
    city: opts.location.district || opts.location.area || "Online",
    contact: "",
    status: opts.status,
  };
}

export function ShopForm({ onDone, initial }: { onDone: () => void; initial?: Listing }) {
  const { categoryOptions, subCategoryOptions, categoriesById, subCategoriesById } = useCategoryOptions();
  const createListing = useCreateListing();
  const updateListing = useUpdateListing();
  const isEdit = Boolean(initial);
  const [name, setName] = useState(initial?.name ?? "");
  const [categoryIds, setCategoryIds] = useState<string[]>(initial?.categoryIds ?? []);
  const [subCategoryIds, setSubCategoryIds] = useState<string[]>(initial?.subCategoryIds ?? []);
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [whatsapp, setWhatsapp] = useState(initial?.whatsapp ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [pincode, setPincode] = useState(initial?.pincode ?? "");
  const [state, setState] = useState(initial?.location.state ?? "");
  const [district, setDistrict] = useState(initial?.location.district ?? "");
  const [area, setArea] = useState(initial?.location.area ?? "");
  const [address, setAddress] = useState(initial?.location.address ?? "");
  const [images, setImages] = useState<File[]>([]);
  const [timingsMode, setTimingsMode] = useState<"all_days" | "custom">(initial?.timings?.mode ?? "all_days");
  const [open24, setOpen24] = useState(initial?.timings?.open24Hours ?? false);
  const [openingTime, setOpeningTime] = useState(initial?.timings?.openingTime ?? "09:00");
  const [closingTime, setClosingTime] = useState(initial?.timings?.closingTime ?? "22:00");
  const [offerMessage, setOfferMessage] = useState(initial?.offerMessage ?? "");
  const [shortDescription, setShortDescription] = useState(initial?.shortDescription ?? "");
  const [status, setStatus] = useState<"Active" | "Inactive">((initial?.status as "Active" | "Inactive") ?? "Active");

  const saving = createListing.isPending || updateListing.isPending;

  const submit = async () => {
    if (!name.trim() || categoryIds.length === 0 || (images.length === 0 && !initial?.images.length)) {
      toast.error("Please fill in shop name, category and at least one image.");
      return;
    }
    const payload = {
      ...baseListingPayload({ name, type: "Shop", categoryIds, subCategoryIds, categoriesById, subCategoriesById, location: { state, district, area, address }, status }),
      phone, whatsapp, email, pincode,
      images: images.length ? images.map((f) => f.name) : initial?.images ?? [],
      offerMessage, shortDescription,
      timings: { mode: timingsMode, open24Hours: open24, openingTime, closingTime },
    };
    if (initial) {
      await updateListing.mutateAsync({ id: initial.id, payload });
    } else {
      await createListing.mutateAsync(payload);
    }
    toast.success(isEdit ? "Shop updated" : "Shop saved");
    onDone();
  };

  return (
    <>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <FormSection title="Basic Information">
          <Field label="Shop Name" required><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter shop name" /></Field>
          <Field label="Categories (Select multiple)" required><MultiSelect options={categoryOptions} value={categoryIds} onChange={setCategoryIds} placeholder="Select categories" /></Field>
          <Field label="Sub Categories (Select multiple)"><MultiSelect options={subCategoryOptions} value={subCategoryIds} onChange={setSubCategoryIds} placeholder="Select sub categories" /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Phone Number"><Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Enter phone number" /></Field>
            <Field label="WhatsApp Number"><Input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="Enter WhatsApp number" /></Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Email (Optional)"><Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter email" /></Field>
            <Field label="Pincode" required><Input value={pincode} onChange={(e) => setPincode(e.target.value)} placeholder="Enter pincode" /></Field>
          </div>
        </FormSection>

        <FormSection title="Location Details">
          <div className="grid grid-cols-2 gap-4">
            <Field label="State" required><Input value={state} onChange={(e) => setState(e.target.value)} placeholder="Select state" /></Field>
            <Field label="District" required><Input value={district} onChange={(e) => setDistrict(e.target.value)} placeholder="Select district" /></Field>
          </div>
          <Field label="Area / Locality" required><Input value={area} onChange={(e) => setArea(e.target.value)} placeholder="Enter area / locality" /></Field>
          <Field label="Full Address" required><Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Enter full address" /></Field>
        </FormSection>
      </div>

      <div className="mt-4">
        <ImageUploadGrid label="Shop Images" hint="You can upload up to 10 images (JPG, PNG — Max. 2MB each)" value={images} onChange={setImages} multiple max={10} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <FormSection title="Shop Timings">
          <RadioGroup value={timingsMode} onValueChange={(v) => setTimingsMode(v as "all_days" | "custom")} className="flex gap-6">
            <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="all_days" />All Days</label>
            <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="custom" />Custom Days</label>
          </RadioGroup>
          <label className="flex items-center justify-between rounded-md border p-3 text-sm">
            <span>Open 24 Hours</span>
            <Switch checked={open24} onCheckedChange={setOpen24} />
          </label>
          {!open24 && (
            <div className="grid grid-cols-2 gap-4">
              <Field label="Opening Time"><Input type="time" value={openingTime} onChange={(e) => setOpeningTime(e.target.value)} /></Field>
              <Field label="Closing Time"><Input type="time" value={closingTime} onChange={(e) => setClosingTime(e.target.value)} /></Field>
            </div>
          )}
        </FormSection>

        <FormSection title="Offer & Description">
          <Field label="Offer Message" required><Input value={offerMessage} onChange={(e) => setOfferMessage(e.target.value)} placeholder="e.g. Get 10% OFF on all groceries" /></Field>
          <Field label="Short Description" required><CounterTextarea value={shortDescription} onChange={setShortDescription} max={150} placeholder="Enter short description" /></Field>
        </FormSection>
      </div>

      <FormSection title="Status" className="mt-4">
        <RadioGroup value={status} onValueChange={(v) => setStatus(v as "Active" | "Inactive")} className="flex gap-6">
          <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="Active" />Active</label>
          <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="Inactive" />Inactive</label>
        </RadioGroup>
      </FormSection>

      <div className="mt-6 flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onDone}>Cancel</Button>
        <Button type="button" onClick={submit} disabled={saving}>{saving ? "Saving..." : isEdit ? "Save Changes" : "Save & Publish"}</Button>
      </div>
    </>
  );
}

export function ServiceForm({ onDone, initial }: { onDone: () => void; initial?: Listing }) {
  const { categoryOptions, subCategoryOptions, categoriesById, subCategoriesById } = useCategoryOptions();
  const createListing = useCreateListing();
  const updateListing = useUpdateListing();
  const isEdit = Boolean(initial);
  const [name, setName] = useState(initial?.name ?? "");
  const [categoryIds, setCategoryIds] = useState<string[]>(initial?.categoryIds ?? []);
  const [subCategoryIds, setSubCategoryIds] = useState<string[]>(initial?.subCategoryIds ?? []);
  const [coverImage, setCoverImage] = useState<File[]>([]);
  const [shortDescription, setShortDescription] = useState(initial?.shortDescription ?? "");
  const [fullDescription, setFullDescription] = useState(initial?.fullDescription ?? "");
  const [offerShortMessage, setOfferShortMessage] = useState("");
  const [offerMessage, setOfferMessage] = useState(initial?.offerMessage ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [whatsapp, setWhatsapp] = useState(initial?.whatsapp ?? "");
  const [state, setState] = useState(initial?.location.state ?? "");
  const [district, setDistrict] = useState(initial?.location.district ?? "");
  const [area, setArea] = useState(initial?.location.area ?? "");
  const [images, setImages] = useState<File[]>([]);
  const [highlights, setHighlights] = useState<string[]>(initial?.highlights ?? []);
  const [days, setDays] = useState<string[]>(initial?.availability?.days ?? DAYS);
  const [startTime, setStartTime] = useState(initial?.availability?.startTime ?? "09:00");
  const [endTime, setEndTime] = useState(initial?.availability?.endTime ?? "18:00");
  const [is24Hours, setIs24Hours] = useState(initial?.availability?.is24Hours ?? false);
  const [status, setStatus] = useState<"Active" | "Inactive">((initial?.status as "Active" | "Inactive") ?? "Active");
  const [featured, setFeatured] = useState(initial?.featured ?? false);

  const saving = createListing.isPending || updateListing.isPending;

  const submit = async () => {
    if (!name.trim() || categoryIds.length === 0 || !shortDescription.trim()) {
      toast.error("Please fill in service name, category and short description.");
      return;
    }
    const payload = {
      ...baseListingPayload({ name, type: "Service", categoryIds, subCategoryIds, categoriesById, subCategoriesById, location: { state, district, area }, status }),
      coverImage: coverImage[0]?.name ?? initial?.coverImage,
      images: images.length ? images.map((f) => f.name) : initial?.images ?? [],
      shortDescription, fullDescription,
      offerMessage: offerMessage || offerShortMessage,
      phone, whatsapp, featured, highlights: highlights.filter(Boolean),
      availability: { days, startTime, endTime, is24Hours },
    };
    if (initial) {
      await updateListing.mutateAsync({ id: initial.id, payload });
    } else {
      await createListing.mutateAsync(payload);
    }
    toast.success(isEdit ? "Service updated" : "Service saved");
    onDone();
  };

  return (
    <>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <FormSection title="Basic Information">
          <Field label="Service Name" required><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter service name" /></Field>
          <Field label="Service Category (Select multiple)" required><MultiSelect options={categoryOptions} value={categoryIds} onChange={setCategoryIds} placeholder="Select categories" /></Field>
          <Field label="Service Sub Category (Select multiple)"><MultiSelect options={subCategoryOptions} value={subCategoryIds} onChange={setSubCategoryIds} placeholder="Select sub categories" /></Field>
        </FormSection>
        <FormSection title="Service Cover Image">
          <ImageUploadGrid label="Cover Image" hint="This image will be shown as the main service image. JPG, PNG — Max. 2MB" value={coverImage} onChange={setCoverImage} />
        </FormSection>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <FormSection title="Service Details">
          <Field label="Short Description" required><CounterTextarea value={shortDescription} onChange={setShortDescription} max={150} placeholder="Enter short description" /></Field>
          <Field label="Full Description"><CounterTextarea value={fullDescription} onChange={setFullDescription} max={2000} placeholder="Enter full description of the service" rows={4} /></Field>
        </FormSection>
        <FormSection title="Offer Details (Optional)">
          <Field label="Offer Short Message"><Input value={offerShortMessage} onChange={(e) => setOfferShortMessage(e.target.value.slice(0, 60))} placeholder="Eg. 20% OFF, Flat ₹100 OFF" /></Field>
          <Field label="Offer Message"><CounterTextarea value={offerMessage} onChange={setOfferMessage} max={500} placeholder="Enter offer details, terms & conditions, validity etc." /></Field>
        </FormSection>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <FormSection title="Contact Information">
          <Field label="Contact Number" required><Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Enter contact number" /></Field>
          <Field label="WhatsApp Number"><Input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="Enter WhatsApp number" /></Field>
        </FormSection>
        <FormSection title="Service Location">
          <div className="grid grid-cols-2 gap-4">
            <Field label="State"><Input value={state} onChange={(e) => setState(e.target.value)} placeholder="Select state" /></Field>
            <Field label="District"><Input value={district} onChange={(e) => setDistrict(e.target.value)} placeholder="Select district" /></Field>
          </div>
          <Field label="Area"><Input value={area} onChange={(e) => setArea(e.target.value)} placeholder="Enter area" /></Field>
        </FormSection>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <FormSection title="Service Images (Optional)">
          <ImageUploadGrid label="Service Images" hint="You can upload up to 10 images (JPG, PNG — Max. 2MB each)" value={images} onChange={setImages} multiple max={10} />
        </FormSection>
        <FormSection title="Service Highlights (Optional)">
          <HighlightsField highlights={highlights} onChange={setHighlights} />
        </FormSection>
      </div>

      <FormSection title="Availability (Optional)" className="mt-4">
        <div className="flex flex-wrap gap-4">
          {DAYS.map((day) => (
            <label key={day} className="flex items-center gap-2 text-sm">
              <Checkbox checked={days.includes(day)} onCheckedChange={(c) => setDays(c ? [...days, day] : days.filter((d) => d !== day))} />
              {day}
            </label>
          ))}
        </div>
        <label className="flex items-center justify-between rounded-md border p-3 text-sm">
          <span>24 Hours Service</span>
          <Switch checked={is24Hours} onCheckedChange={setIs24Hours} />
        </label>
        {!is24Hours && (
          <div className="grid grid-cols-2 gap-4">
            <Field label="Start Time"><Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} /></Field>
            <Field label="End Time"><Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} /></Field>
          </div>
        )}
      </FormSection>

      <FormSection title="Status" className="mt-4">
        <RadioGroup value={status} onValueChange={(v) => setStatus(v as "Active" | "Inactive")} className="flex gap-6">
          <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="Active" />Active</label>
          <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="Inactive" />Inactive</label>
        </RadioGroup>
        <label className="flex items-center justify-between rounded-md border p-3 text-sm">
          <span>Show this service as featured</span>
          <Switch checked={featured} onCheckedChange={setFeatured} />
        </label>
      </FormSection>

      <div className="mt-6 flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onDone}>Cancel</Button>
        <Button type="button" onClick={submit} disabled={saving}>{saving ? "Saving..." : isEdit ? "Save Changes" : "Save & Publish"}</Button>
      </div>
    </>
  );
}

export function ProductForm({ onDone, initial }: { onDone: () => void; initial?: Listing }) {
  const { categoryOptions, subCategoryOptions, categoriesById, subCategoriesById } = useCategoryOptions();
  const shopsQuery = useListings({ type: "Shop" });
  const createListing = useCreateListing();
  const updateListing = useUpdateListing();
  const isEdit = Boolean(initial);
  const [name, setName] = useState(initial?.name ?? "");
  const [shopIds, setShopIds] = useState<string[]>(initial?.shopIds ?? []);
  const [categoryIds, setCategoryIds] = useState<string[]>(initial?.categoryIds ?? []);
  const [subCategoryIds, setSubCategoryIds] = useState<string[]>(initial?.subCategoryIds ?? []);
  const [price, setPrice] = useState(initial?.price != null ? String(initial.price) : "");
  const [salePrice, setSalePrice] = useState(initial?.salePrice != null ? String(initial.salePrice) : "");
  const [discountShortMessage, setDiscountShortMessage] = useState(initial?.discountShortMessage ?? "");
  const [discountMessage, setDiscountMessage] = useState(initial?.discountMessage ?? "");
  const [coverImage, setCoverImage] = useState<File[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [shortDescription, setShortDescription] = useState(initial?.shortDescription ?? "");
  const [fullDescription, setFullDescription] = useState(initial?.fullDescription ?? "");
  const [highlights, setHighlights] = useState<string[]>(initial?.highlights ?? []);
  const [status, setStatus] = useState<"Active" | "Inactive">((initial?.status as "Active" | "Inactive") ?? "Active");
  const [featured, setFeatured] = useState(initial?.featured ?? false);

  const saving = createListing.isPending || updateListing.isPending;
  const shopOptions = (shopsQuery.data?.items ?? []).map((s) => ({ label: s.name, value: s.id }));

  const submit = async () => {
    if (!name.trim() || categoryIds.length === 0 || !price || (coverImage.length === 0 && !initial?.coverImage)) {
      toast.error("Please fill in product name, category, price and cover image.");
      return;
    }
    const payload = {
      ...baseListingPayload({ name, type: "Product", categoryIds, subCategoryIds, categoriesById, subCategoriesById, location: {}, status }),
      shopIds,
      coverImage: coverImage[0]?.name ?? initial?.coverImage,
      images: images.length ? images.map((f) => f.name) : initial?.images ?? [],
      price: Number(price), salePrice: salePrice ? Number(salePrice) : undefined,
      discountShortMessage, discountMessage,
      shortDescription, fullDescription,
      highlights: highlights.filter(Boolean),
      featured,
    };
    if (initial) {
      await updateListing.mutateAsync({ id: initial.id, payload });
    } else {
      await createListing.mutateAsync(payload);
    }
    toast.success(isEdit ? "Product updated" : "Product saved");
    onDone();
  };

  return (
    <>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <FormSection title="Basic Information">
          <Field label="Product Name" required><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter product name" /></Field>
          <Field label="Select Shops" required><MultiSelect options={shopOptions} value={shopIds} onChange={setShopIds} placeholder="Select one or more shops" /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Product Category (Select multiple)" required><MultiSelect options={categoryOptions} value={categoryIds} onChange={setCategoryIds} placeholder="Select categories" /></Field>
            <Field label="Product Sub Category (Select multiple)"><MultiSelect options={subCategoryOptions} value={subCategoryIds} onChange={setSubCategoryIds} placeholder="Select sub categories" /></Field>
          </div>
        </FormSection>
        <FormSection title="Pricing & Discount">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Price" required><Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Enter price" /></Field>
            <Field label="Sale Price (Optional)"><Input type="number" value={salePrice} onChange={(e) => setSalePrice(e.target.value)} placeholder="Enter sale price" /></Field>
          </div>
          <Field label="Discount Short Message (e.g. 20% OFF, Flat 100 OFF)"><Input value={discountShortMessage} onChange={(e) => setDiscountShortMessage(e.target.value.slice(0, 30))} /></Field>
          <Field label="Discount Message (Optional)"><CounterTextarea value={discountMessage} onChange={setDiscountMessage} max={200} placeholder="Enter discount message" /></Field>
        </FormSection>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <FormSection title="Product Cover Image">
          <ImageUploadGrid label="Cover Image" hint="This image will be shown as the main product image." value={coverImage} onChange={setCoverImage} />
        </FormSection>
        <FormSection title="Product Details">
          <Field label="Short Description" required><CounterTextarea value={shortDescription} onChange={setShortDescription} max={150} placeholder="Enter short description" /></Field>
          <Field label="Full Description (Optional)"><CounterTextarea value={fullDescription} onChange={setFullDescription} max={2000} placeholder="Enter full description" rows={4} /></Field>
        </FormSection>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <FormSection title="Product Images">
          <ImageUploadGrid label="Product Images" hint="You can upload up to 10 images (JPG, PNG — Max. 2MB each)" value={images} onChange={setImages} multiple max={10} />
        </FormSection>
        <FormSection title="Product Highlights (Optional)">
          <HighlightsField highlights={highlights} onChange={setHighlights} />
        </FormSection>
      </div>

      <FormSection title="Status" className="mt-4">
        <RadioGroup value={status} onValueChange={(v) => setStatus(v as "Active" | "Inactive")} className="flex gap-6">
          <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="Active" />Active</label>
          <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="Inactive" />Inactive</label>
        </RadioGroup>
        <label className="flex items-center justify-between rounded-md border p-3 text-sm">
          <span>Show this product as featured</span>
          <Switch checked={featured} onCheckedChange={setFeatured} />
        </label>
      </FormSection>

      <div className="mt-6 flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onDone}>Cancel</Button>
        <Button type="button" onClick={submit} disabled={saving}>{saving ? "Saving..." : isEdit ? "Save Changes" : "Save & Publish"}</Button>
      </div>
    </>
  );
}
