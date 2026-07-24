import { useMemo, useRef, useState } from "react";
import { UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { SectionCard } from "@/components/admin/SectionCard";
import { MultiSelect } from "@/components/common/MultiSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { advertisementService } from "@/services/advertisement.service";
import { useRegions } from "@/hooks/api/useRegions";
import type { AdBannerInput, BannerType } from "@/types/advertisement";

const EMPTY: AdBannerInput = {
  name: "",
  banner_type: "main_slider",
  external_link: false,
  link_url: null,
  display_order: 0,
  status: "active",
  image_key: null,
  state_ids: [],
  district_ids: [],
  area_ids: [],
};

export function BannerForm({
  initial,
  initialImageUrl,
  submitting,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial?: Partial<AdBannerInput>;
  initialImageUrl?: string | null;
  submitting?: boolean;
  submitLabel: string;
  onSubmit: (data: AdBannerInput) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<AdBannerInput>({ ...EMPTY, ...initial });
  const [preview, setPreview] = useState<string | null>(initialImageUrl ?? null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const regionsQuery = useRegions();
  const states = regionsQuery.data ?? [];
  const stateOpts = useMemo(() => states.map((s) => ({ label: s.name, value: s.id })), [states]);
  const districtOpts = useMemo(() => states.flatMap((s) => s.districts).map((d) => ({ label: d.name, value: d.id })), [states]);
  const areaOpts = useMemo(
    () => states.flatMap((s) => s.districts).flatMap((d) => d.areas).map((a) => ({ label: a.name, value: a.id })),
    [states],
  );

  const set = <K extends keyof AdBannerInput>(key: K, value: AdBannerInput[K]) => setForm((f) => ({ ...f, [key]: value }));

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const { upload_url, file_key } = await advertisementService.uploadUrl(file.name, file.type);
      const put = await fetch(upload_url, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
      if (!put.ok) throw new Error("Upload failed");
      set("image_key", file_key);
      setPreview(URL.createObjectURL(file));
      toast.success("Image uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const submit = () => {
    if (!form.name.trim()) return toast.info("Enter a banner name");
    if (form.external_link && !form.link_url) return toast.info("Link URL is required when external link is Yes");
    onSubmit(form);
  };

  return (
    <div className="space-y-4">
      <SectionCard title="1. Banner Details" description="Create a banner and set its visibility.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Banner Name *</Label>
            <Input className="mt-1" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Enter banner name" />
          </div>
          <div>
            <Label>Banner Type *</Label>
            <Select value={form.banner_type} onValueChange={(v) => set("banner_type", v as BannerType)}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Select banner type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="main_slider">Main Page Slider</SelectItem>
                <SelectItem value="in_list">In List</SelectItem>
                <SelectItem value="in_detail">In Detail Page</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>External Link</Label>
            <Select value={form.external_link ? "yes" : "no"} onValueChange={(v) => set("external_link", v === "yes")}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="no">No</SelectItem>
                <SelectItem value="yes">Yes</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Link URL (Optional)</Label>
            <Input className="mt-1" value={form.link_url ?? ""} onChange={(e) => set("link_url", e.target.value || null)} placeholder="https://example.com" />
            <p className="mt-1 text-xs text-muted-foreground">Required if External Link is Yes</p>
          </div>
          <div>
            <Label>Display Order *</Label>
            <Input className="mt-1" type="number" min={0} value={form.display_order} onChange={(e) => set("display_order", Number(e.target.value))} />
            <p className="mt-1 text-xs text-muted-foreground">Lower number will show first</p>
          </div>
          <div>
            <Label>Status *</Label>
            <Select value={form.status} onValueChange={(v) => set("status", v as AdBannerInput["status"])}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Banner Image *</Label>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="mt-1 flex h-40 w-full flex-col items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground hover:bg-muted/40"
            >
              <UploadCloud className="mb-2 h-6 w-6" />
              {uploading ? "Uploading…" : "Click to upload or drag and drop"}
              <span className="mt-1 text-xs">JPG, JPEG, PNG, WebP (Max 2 MB)</span>
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
          </div>
          <div>
            <Label>Preview</Label>
            <div className="mt-1 flex h-40 items-center justify-center overflow-hidden rounded-lg border bg-muted/40">
              {preview ? <img src={preview} alt="" className="h-full w-full object-cover" /> : <span className="text-xs text-muted-foreground">No image</span>}
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="2. Visibility Area" description="Leave empty to show in all locations.">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label>Select State(s)</Label>
            <MultiSelect className="mt-1" options={stateOpts} value={form.state_ids} onChange={(v) => set("state_ids", v)} placeholder="Select State(s)" />
          </div>
          <div>
            <Label>Select District(s)</Label>
            <MultiSelect className="mt-1" options={districtOpts} value={form.district_ids} onChange={(v) => set("district_ids", v)} placeholder="Select District(s)" />
          </div>
          <div>
            <Label>Select Area(s)</Label>
            <MultiSelect className="mt-1" options={areaOpts} value={form.area_ids} onChange={(v) => set("area_ids", v)} placeholder="Select Area(s)" />
            <p className="mt-1 text-xs text-muted-foreground">If multiple districts are selected, area selection will not be applicable.</p>
          </div>
        </div>
      </SectionCard>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={submit} disabled={submitting || uploading}>{submitting ? "Saving…" : submitLabel}</Button>
      </div>
    </div>
  );
}
