import { useMemo, useRef, useState } from "react";
import { UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MultiSelect } from "@/components/common/MultiSelect";
import { monetizationService } from "@/services/monetization.service";
import { useLanguages } from "@/hooks/api/useLanguages";
import { useRegions } from "@/hooks/api/useRegions";
import { PLACEMENT_LABELS, type AdPlacementKey, type ManualAd, type ManualAdInput, type ManualAdStatus } from "@/types/monetization";

const ALL_PLACEMENTS = Object.keys(PLACEMENT_LABELS) as AdPlacementKey[];

export function AdForm({
  initial,
  saving,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial?: ManualAd;
  saving?: boolean;
  submitLabel: string;
  onSubmit: (data: ManualAdInput) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<ManualAdInput>({
    name: initial?.name ?? "",
    description: initial?.description ?? "",
    image_key: initial?.image_key ?? null,
    target_url: initial?.target_url ?? null,
    language_code: initial?.language_code ?? null,
    state_ids: initial?.state_ids ?? [],
    district_ids: initial?.district_ids ?? [],
    area_ids: initial?.area_ids ?? [],
    placements: initial?.placements ?? ["news_feed"],
    frequency: initial?.frequency ?? 5,
    display_order: initial?.display_order ?? 0,
    status: initial?.status ?? "active",
    starts_at: initial?.starts_at ?? null,
    ends_at: initial?.ends_at ?? null,
  });
  const [preview, setPreview] = useState<string | null>(initial?.image_url ?? null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const languagesQuery = useLanguages();
  const regionsQuery = useRegions();
  const states = regionsQuery.data ?? [];

  const stateOpts = useMemo(() => states.map((s) => ({ label: s.name, value: s.id })), [states]);
  const districtOpts = useMemo(() => {
    const scoped = form.state_ids?.length ? states.filter((s) => form.state_ids!.includes(s.id)) : states;
    return scoped.flatMap((s) => s.districts).map((d) => ({ label: d.name, value: d.id }));
  }, [states, form.state_ids]);
  const areaOpts = useMemo(() => {
    const districts = states.flatMap((s) => s.districts);
    const scoped = form.district_ids?.length ? districts.filter((d) => form.district_ids!.includes(d.id)) : districts;
    return scoped.flatMap((d) => d.areas).map((a) => ({ label: a.name, value: a.id }));
  }, [states, form.district_ids]);

  const handleFile = async (file: File) => {
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be 2 MB or smaller");
      return;
    }
    setUploading(true);
    try {
      const key = await monetizationService.uploadImage(file);
      setForm((f) => ({ ...f, image_key: key }));
      setPreview(URL.createObjectURL(file));
      toast.success("Image uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const togglePlacement = (p: AdPlacementKey, checked: boolean) =>
    setForm((f) => {
      const set = new Set(f.placements ?? []);
      if (checked) set.add(p);
      else set.delete(p);
      return { ...f, placements: [...set] };
    });

  const submit = () => {
    if (!form.name?.trim()) return toast.info("Enter an ad name");
    if (!form.placements?.length) return toast.info("Select at least one placement");
    onSubmit({ ...form, target_url: form.target_url || null });
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Ad Name *</Label>
          <Input className="mt-1" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Clean City Campaign" />
        </div>
        <div>
          <Label>Description</Label>
          <Input
            className="mt-1"
            value={form.description ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Short line shown under the ad name"
          />
        </div>
        <div>
          <Label>Target URL</Label>
          <Input
            className="mt-1"
            value={form.target_url ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, target_url: e.target.value || null }))}
            placeholder="https://example.com"
          />
        </div>
        <div>
          <Label>Language</Label>
          <Select
            value={form.language_code ?? "all"}
            onValueChange={(v) => setForm((f) => ({ ...f, language_code: v === "all" ? null : v }))}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="All Languages" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Languages</SelectItem>
              {(languagesQuery.data?.items ?? []).map((l) => (
                <SelectItem key={l.code} value={l.code}>
                  {l.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label>State(s)</Label>
          <MultiSelect
            className="mt-1"
            options={stateOpts}
            value={form.state_ids ?? []}
            onChange={(v) => setForm((f) => ({ ...f, state_ids: v, district_ids: [], area_ids: [] }))}
            placeholder="All States"
          />
        </div>
        <div>
          <Label>District(s)</Label>
          <MultiSelect
            className="mt-1"
            options={districtOpts}
            value={form.district_ids ?? []}
            onChange={(v) => setForm((f) => ({ ...f, district_ids: v, area_ids: [] }))}
            placeholder="All Districts"
          />
        </div>
        <div>
          <Label>Area(s)</Label>
          <MultiSelect
            className="mt-1"
            options={areaOpts}
            value={form.area_ids ?? []}
            onChange={(v) => setForm((f) => ({ ...f, area_ids: v }))}
            placeholder="All Areas"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label>Placement Area *</Label>
          <div className="mt-2 space-y-2">
            {ALL_PLACEMENTS.map((p) => (
              <label key={p} className="flex items-center gap-2 text-sm">
                <Checkbox checked={form.placements?.includes(p)} onCheckedChange={(v) => togglePlacement(p, v === true)} />
                {PLACEMENT_LABELS[p]}
              </label>
            ))}
          </div>
        </div>
        <div>
          <Label>Frequency</Label>
          <Input
            className="mt-1"
            type="number"
            min={1}
            max={50}
            value={form.frequency ?? 5}
            onChange={(e) => setForm((f) => ({ ...f, frequency: Number(e.target.value) || 1 }))}
          />
          <p className="mt-1 text-xs text-muted-foreground">Shown after every N posts</p>
        </div>
        <div>
          <Label>Status</Label>
          <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v as ManualAdStatus }))}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {form.status === "scheduled" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Starts At</Label>
            <Input
              className="mt-1"
              type="datetime-local"
              value={form.starts_at ? form.starts_at.slice(0, 16) : ""}
              onChange={(e) => setForm((f) => ({ ...f, starts_at: e.target.value ? new Date(e.target.value).toISOString() : null }))}
            />
          </div>
          <div>
            <Label>Ends At</Label>
            <Input
              className="mt-1"
              type="datetime-local"
              value={form.ends_at ? form.ends_at.slice(0, 16) : ""}
              onChange={(e) => setForm((f) => ({ ...f, ends_at: e.target.value ? new Date(e.target.value).toISOString() : null }))}
            />
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Ad Image *</Label>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="mt-1 flex h-32 w-full flex-col items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground hover:bg-muted/40"
          >
            <UploadCloud className="mb-2 h-6 w-6" />
            {uploading ? "Uploading…" : "Click to upload ad creative"}
            <span className="mt-1 text-xs">JPG, PNG, WebP (Max 2 MB)</span>
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
          <div className="mt-1 flex h-32 items-center justify-center overflow-hidden rounded-lg border bg-muted/40">
            {preview ? <img src={preview} alt="" className="h-full w-full object-contain" /> : <span className="text-xs text-muted-foreground">No image</span>}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={submit} disabled={saving || uploading}>
          {saving ? "Saving…" : submitLabel}
        </Button>
      </div>
    </div>
  );
}
