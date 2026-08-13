import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Check,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  Image as ImageIcon,
  Info,
  QrCode,
  RotateCcw,
  Save,
  SlidersHorizontal,
  Smartphone,
  Sparkles,
  Trash2,
  Upload,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionCard } from "@/components/admin/SectionCard";
import { MultiSelect } from "@/components/common/MultiSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCompetitionConfig, useUpdateCompetitionConfig, useFormFields } from "@/hooks/api/useCompetition";
import { useRegions } from "@/hooks/api/useRegions";
import { competitionAdminService } from "@/services/competitionAdmin.service";
import type { CompetitionConfig } from "@/types/competitionAdmin";
import { ROUTES } from "@/constants/routes.constants";

export const Route = createFileRoute("/_app/competition/settings")({ component: CompetitionSettingsPage });

function toDateInput(value: string | null | undefined): string {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function toTimeInput(value: string | null | undefined): string {
  if (!value) return "00:00";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "00:00";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function combineDateTimeToIso(dateStr: string, timeStr: string): string | null {
  if (!dateStr) return null;
  const [year, month, day] = dateStr.split("-").map(Number);
  const [hours, minutes] = (timeStr || "00:00").split(":").map(Number);
  const d = new Date(year, month - 1, day, hours, minutes);
  return d.toISOString();
}

function CompetitionSettingsPage() {
  const navigate = useNavigate();
  const configQuery = useCompetitionConfig();
  const updateConfig = useUpdateCompetitionConfig();
  const regionsQuery = useRegions();
  const fieldsQuery = useFormFields();

  const [form, setForm] = useState<Partial<CompetitionConfig> | null>(null);
  const [previews, setPreviews] = useState<{ share?: string; banner?: string }>({});
  const [uploading, setUploading] = useState<"share_template" | "banner" | null>(null);

  const config = { ...(configQuery.data ?? {}), ...(form ?? {}) } as Partial<CompetitionConfig>;
  const setField = <K extends keyof CompetitionConfig>(key: K, value: CompetitionConfig[K]) =>
    setForm((f) => ({ ...(f ?? {}), [key]: value }));

  const handleAssetUpload = async (file: File, asset: "share_template" | "banner") => {
    if (!file.type.startsWith("image/")) return toast.error("Please choose an image file");
    setUploading(asset);
    try {
      const key = await competitionAdminService.uploadAsset(file, asset);
      setField(asset === "share_template" ? "share_template_key" : "banner_image_key", key);
      setPreviews((p) => ({ ...p, [asset === "share_template" ? "share" : "banner"]: URL.createObjectURL(file) }));
      toast.success("Uploaded — click Save to apply");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(null);
    }
  };

  const states = regionsQuery.data ?? [];
  const stateOpts = useMemo(() => states.map((s) => ({ label: s.name, value: s.id })), [states]);
  const districtOpts = useMemo(
    () => states.flatMap((s) => s.districts).map((d) => ({ label: d.name, value: d.id })),
    [states],
  );
  const areaOpts = useMemo(
    () => states.flatMap((s) => s.districts).flatMap((d) => d.areas).map((a) => ({ label: a.name, value: a.id })),
    [states],
  );

  const formFields = fieldsQuery.data ?? [];
  const activeFields = useMemo(() => formFields.filter((f) => f.is_enabled), [formFields]);

  const handleSave = () => {
    if (!form) return toast.info("No changes to save");
    updateConfig.mutate(form, {
      onSuccess: () => {
        toast.success("Competition settings saved");
        setForm(null);
      },
      onError: (err) => toast.error(err instanceof Error ? err.message : "Save failed"),
    });
  };

  return (
    <div className="space-y-4 pb-12">
      <PageHeader
        title="Competition Settings"
        description="Manage all settings related to this competition."
        breadcrumbs={[
          { label: "Dashboard", to: ROUTES.DASHBOARD },
          { label: "Competitions", to: ROUTES.COMPETITION },
          { label: "Ganesh Competition", to: ROUTES.COMPETITION },
          { label: "Settings" },
        ]}
        actions={
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-lg border bg-background px-3 py-1.5 shadow-sm">
              <span className={config.is_active ? "text-sm font-semibold text-emerald-600" : "text-sm font-medium text-muted-foreground"}>
                Active
              </span>
              <Switch checked={Boolean(config.is_active)} onCheckedChange={(v) => setField("is_active", v)} />
              <span className={!config.is_active ? "text-sm font-semibold text-rose-600" : "text-sm font-medium text-muted-foreground"}>
                Inactive
              </span>
            </div>
            <Button className="bg-red-600 font-bold hover:bg-red-700" onClick={handleSave} disabled={updateConfig.isPending || !form}>
              <Save className="mr-2 h-4 w-4" />
              {updateConfig.isPending ? "Saving…" : "Save All Changes"}
            </Button>
          </div>
        }
      />

      {configQuery.error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          Unable to load competition settings from backend.
        </div>
      )}

      {/* Main Grid: Left Settings (2 cols) & Right Share Preview (1 col) */}
      <div className="grid gap-5 lg:grid-cols-3">
        {/* ---- LEFT COLUMN (2 Cols) ---- */}
        <div className="space-y-5 lg:col-span-2">
          {/* 1. Competition Details */}
          <SectionCard title="1. Competition Details">
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="font-bold">Competition Name *</Label>
                  <Input
                    className="mt-1.5"
                    value={config.title ?? "Ganesh Utsav 2025"}
                    onChange={(e) => setField("title", e.target.value)}
                    placeholder="Enter competition title"
                  />
                </div>
                <div>
                  <Label className="font-bold">Competition Status</Label>
                  <div className="mt-1.5 flex items-center gap-2">
                    <Button
                      type="button"
                      variant={config.is_active ? "default" : "outline"}
                      size="sm"
                      className={config.is_active ? "bg-emerald-600 hover:bg-emerald-700 font-bold" : ""}
                      onClick={() => setField("is_active", true)}
                    >
                      Active
                    </Button>
                    <Button
                      type="button"
                      variant={!config.is_active ? "default" : "outline"}
                      size="sm"
                      className={!config.is_active ? "bg-rose-600 hover:bg-rose-700 font-bold" : ""}
                      onClick={() => setField("is_active", false)}
                    >
                      Inactive
                    </Button>
                  </div>
                </div>
              </div>

              <div>
                <Label className="font-bold">Festival Start Date</Label>
                <Input
                  type="date"
                  className="mt-1.5 w-56"
                  value={config.festival_start_date ?? ""}
                  onChange={(e) => setField("festival_start_date", e.target.value || null)}
                />
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Each entry's Visarjan date shown in the app is calculated from this date plus the Visarjan days the
                  participant selected (e.g. start + 11 days).
                </p>
              </div>

              <div>
                <Label className="font-bold">{"Competition Detail's Location"}</Label>
                <p className="mb-1.5 mt-0.5 text-[11px] text-muted-foreground">
                  In the selected location the competition button will be visible in the app's top bar menu.
                </p>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <Label className="text-xs font-semibold">Select States *</Label>
                    <MultiSelect className="mt-1" options={stateOpts} value={config.target_state_ids ?? []} onChange={(v) => setField("target_state_ids", v)} placeholder="Select States" />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Select Districts *</Label>
                    <MultiSelect className="mt-1" options={districtOpts} value={config.target_district_ids ?? []} onChange={(v) => setField("target_district_ids", v)} placeholder="Select Districts" />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Select Areas *</Label>
                    <MultiSelect className="mt-1" options={areaOpts} value={config.target_area_ids ?? []} onChange={(v) => setField("target_area_ids", v)} placeholder="Select Areas" />
                  </div>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* 2 & 2A. Participation Form Settings & Preview */}
          <div className="grid gap-4 sm:grid-cols-2">
            <SectionCard title="2. Participation Form Settings" description="Manage and customize the participant registration form.">
              <div className="pt-2">
                <Button variant="outline" className="border-purple-300 font-bold text-purple-700 hover:bg-purple-50" onClick={() => navigate({ to: ROUTES.COMPETITION_FORM_SETTINGS })}>
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  Edit Participation Form
                </Button>
              </div>
            </SectionCard>

            <SectionCard title="2A. Participation Form Preview" description="Preview of fields in participation form.">
              <div className="space-y-1.5 pt-1">
                {activeFields.length > 0 ? (
                  activeFields.slice(0, 7).map((f) => (
                    <div key={f.id} className="flex items-center gap-2 text-xs text-slate-700">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
                      <span>{f.label} {f.is_required ? "" : "(Optional)"}</span>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="flex items-center gap-2 text-xs text-slate-700"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Mandal / Group Name</div>
                    <div className="flex items-center gap-2 text-xs text-slate-700"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Contact Person Name</div>
                    <div className="flex items-center gap-2 text-xs text-slate-700"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Mobile Number</div>
                    <div className="flex items-center gap-2 text-xs text-slate-700"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Email Address (Optional)</div>
                    <div className="flex items-center gap-2 text-xs text-slate-700"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Address</div>
                    <div className="flex items-center gap-2 text-xs text-slate-700"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Upload Mandal Photo</div>
                    <div className="flex items-center gap-2 text-xs text-slate-700"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Mandal Description (Optional)</div>
                  </>
                )}
                <div className="pt-2">
                  <Button variant="outline" size="sm" className="border-purple-300 font-bold text-purple-700 hover:bg-purple-50" onClick={() => navigate({ to: ROUTES.COMPETITION_FORM_SETTINGS })}>
                    <Eye className="mr-2 h-3.5 w-3.5" />
                    View Full Form
                  </Button>
                </div>
              </div>
            </SectionCard>
          </div>

          {/* 3 & 4. Participation & Voting Periods */}
          <div className="grid gap-4 sm:grid-cols-2">
            <SectionCard title="3. Participation Period (Form Submission)" description="Set the start and end date & time for form submission.">
              <div className="space-y-3 pt-1">
                <div>
                  <Label className="text-xs font-bold">Start Date & Time *</Label>
                  <div className="mt-1 flex gap-2">
                    <Input
                      type="date"
                      className="text-xs"
                      value={toDateInput(config.participation_starts_at)}
                      onChange={(e) => setField("participation_starts_at", combineDateTimeToIso(e.target.value, toTimeInput(config.participation_starts_at)))}
                    />
                    <Input
                      type="time"
                      className="w-28 text-xs"
                      value={toTimeInput(config.participation_starts_at)}
                      onChange={(e) => setField("participation_starts_at", combineDateTimeToIso(toDateInput(config.participation_starts_at), e.target.value))}
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-bold">End Date & Time *</Label>
                  <div className="mt-1 flex gap-2">
                    <Input
                      type="date"
                      className="text-xs"
                      value={toDateInput(config.participation_ends_at)}
                      onChange={(e) => setField("participation_ends_at", combineDateTimeToIso(e.target.value, toTimeInput(config.participation_ends_at)))}
                    />
                    <Input
                      type="time"
                      className="w-28 text-xs"
                      value={toTimeInput(config.participation_ends_at)}
                      onChange={(e) => setField("participation_ends_at", combineDateTimeToIso(toDateInput(config.participation_ends_at), e.target.value))}
                    />
                  </div>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="4. Voting Period" description="Set the start and end date & time for voting.">
              <div className="space-y-3 pt-1">
                <div>
                  <Label className="text-xs font-bold">Start Date & Time *</Label>
                  <div className="mt-1 flex gap-2">
                    <Input
                      type="date"
                      className="text-xs"
                      value={toDateInput(config.voting_starts_at)}
                      onChange={(e) => setField("voting_starts_at", combineDateTimeToIso(e.target.value, toTimeInput(config.voting_starts_at)))}
                    />
                    <Input
                      type="time"
                      className="w-28 text-xs"
                      value={toTimeInput(config.voting_starts_at)}
                      onChange={(e) => setField("voting_starts_at", combineDateTimeToIso(toDateInput(config.voting_starts_at), e.target.value))}
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-bold">End Date & Time *</Label>
                  <div className="mt-1 flex gap-2">
                    <Input
                      type="date"
                      className="text-xs"
                      value={toDateInput(config.voting_ends_at)}
                      onChange={(e) => setField("voting_ends_at", combineDateTimeToIso(e.target.value, toTimeInput(config.voting_ends_at)))}
                    />
                    <Input
                      type="time"
                      className="w-28 text-xs"
                      value={toTimeInput(config.voting_ends_at)}
                      onChange={(e) => setField("voting_ends_at", combineDateTimeToIso(toDateInput(config.voting_ends_at), e.target.value))}
                    />
                  </div>
                </div>
              </div>
            </SectionCard>
          </div>

          {/* 5 & 5A. Banner Upload Settings & Edit Banner Image */}
          <div className="grid gap-4 sm:grid-cols-2">
            <SectionCard title="5. Banner Upload Settings" description="Manage banner upload, allowed count, size and time.">
              <div className="space-y-3 pt-1">
                <div className="grid gap-2 grid-cols-3">
                  <div>
                    <Label className="text-xs font-semibold">Max Banner Upload</Label>
                    <Select value={String(config.max_banners ?? 2)} onValueChange={(v) => setField("max_banners", Number(v))}>
                      <SelectTrigger className="mt-1 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5].map((n) => (
                          <SelectItem key={n} value={String(n)}>{n} Banner{n > 1 ? "s" : ""}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Max File Size</Label>
                    <Select value={String(config.max_banner_file_size_mb ?? 5)} onValueChange={(v) => setField("max_banner_file_size_mb", Number(v))}>
                      <SelectTrigger className="mt-1 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {[1, 2, 5, 10, 20].map((n) => (
                          <SelectItem key={n} value={String(n)}>{n} MB</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Allowed Formats</Label>
                    <Input className="mt-1 text-xs" value={config.allowed_banner_formats ?? "JPG, PNG, WEBP"} onChange={(e) => setField("allowed_banner_formats", e.target.value)} />
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-bold">Banner Upload Period *</Label>
                  <div className="mt-1.5 grid gap-2 sm:grid-cols-2">
                    <div>
                      <p className="text-[10px] text-muted-foreground font-medium">Start Date & Time</p>
                      <div className="mt-0.5 flex gap-1">
                        <Input type="date" className="text-xs p-1" value={toDateInput(config.banner_upload_starts_at)} onChange={(e) => setField("banner_upload_starts_at", combineDateTimeToIso(e.target.value, toTimeInput(config.banner_upload_starts_at)))} />
                        <Input type="time" className="w-20 text-xs p-1" value={toTimeInput(config.banner_upload_starts_at)} onChange={(e) => setField("banner_upload_starts_at", combineDateTimeToIso(toDateInput(config.banner_upload_starts_at), e.target.value))} />
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground font-medium">End Date & Time</p>
                      <div className="mt-0.5 flex gap-1">
                        <Input type="date" className="text-xs p-1" value={toDateInput(config.banner_upload_ends_at)} onChange={(e) => setField("banner_upload_ends_at", combineDateTimeToIso(e.target.value, toTimeInput(config.banner_upload_ends_at)))} />
                        <Input type="time" className="w-20 text-xs p-1" value={toTimeInput(config.banner_upload_ends_at)} onChange={(e) => setField("banner_upload_ends_at", combineDateTimeToIso(toDateInput(config.banner_upload_ends_at), e.target.value))} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="5A. Edit Banner Image (Used in Share Template)" description="This image will be used as background template in share image.">
              <div className="space-y-3 pt-1">
                <div className="flex items-center gap-3 rounded-lg border bg-slate-50 p-2.5">
                  <div className="h-16 w-20 flex-shrink-0 overflow-hidden rounded border bg-white">
                    {previews.banner || config.banner_image_url ? (
                      <img src={previews.banner ?? config.banner_image_url ?? ""} alt="Banner template" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-muted-foreground">No image</div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-800">Current Template</p>
                    <p className="truncate text-[11px] text-purple-700 font-medium">template_share.jpg</p>
                    <p className="text-[10px] text-muted-foreground">(1060 x 1350 px • 1.2 MB)</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <label className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-md border border-purple-300 bg-white px-3 py-1.5 text-xs font-bold text-purple-700 hover:bg-purple-50">
                    <Upload className="h-3.5 w-3.5" />
                    {uploading === "banner" ? "Uploading…" : "Change Template"}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleAssetUpload(f, "banner"); e.target.value = ""; }} />
                  </label>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                    onClick={() => { setField("banner_image_key", null); setPreviews((p) => ({ ...p, banner: undefined })); }}
                  >
                    <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                    Remove
                  </Button>
                </div>

                <div className="flex items-start gap-1.5 rounded-md bg-purple-50 p-2 text-[11px] text-purple-800">
                  <Info className="h-3.5 w-3.5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span>This template is used to automatically generate share images.</span>
                </div>
              </div>
            </SectionCard>
          </div>

          {/* 6. Participant Button Visibility */}
          <SectionCard
            title="6. Participant Button Visibility (Show Competition)"
            description="In the selected locations the Participate button is shown in the app. The same list also drives the location filter on the competition home page and the Location dropdowns on the participation form."
          >
            <div className="space-y-3">
              <RadioGroup
                className="flex items-center gap-6"
                value={config.button_scope ?? "specific"}
                onValueChange={(v) => setField("button_scope", v as CompetitionConfig["button_scope"])}
              >
                <label className="flex cursor-pointer items-center gap-2 text-xs font-bold">
                  <RadioGroupItem value="specific" id="bs-spec" />
                  <span>Specific Locations (Multi Select)</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-xs font-bold">
                  <RadioGroupItem value="all" id="bs-all" />
                  <span>All Locations</span>
                </label>
              </RadioGroup>

              {config.button_scope !== "all" && (
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <Label className="text-[11px] font-semibold text-muted-foreground">Select States</Label>
                    <MultiSelect className="mt-1" options={stateOpts} value={config.button_state_ids ?? []} onChange={(v) => setField("button_state_ids", v)} placeholder="Select States" />
                  </div>
                  <div>
                    <Label className="text-[11px] font-semibold text-muted-foreground">Select Districts</Label>
                    <MultiSelect className="mt-1" options={districtOpts} value={config.button_district_ids ?? []} onChange={(v) => setField("button_district_ids", v)} placeholder="Select Districts" />
                  </div>
                  <div>
                    <Label className="text-[11px] font-semibold text-muted-foreground">Select Areas</Label>
                    <MultiSelect className="mt-1" options={areaOpts} value={config.button_area_ids ?? []} onChange={(v) => setField("button_area_ids", v)} placeholder="Select Areas" />
                  </div>
                </div>
              )}
            </div>
          </SectionCard>

          {/* 7. Note / Message */}
          <SectionCard title="7. Note / Message (Visible to Participants)" description="Add a note or description for this competition.">
            <div className="space-y-2">
              <Label className="text-xs font-bold">Note / Description *</Label>
              <Textarea
                rows={4}
                maxLength={1000}
                value={config.participant_note ?? "Welcome to Ganesh Utsav 2025 Competition! Upload your best banners and get more votes. Follow the rules and guidelines. All entries are subject to review. Winners will be announced after the voting period ends."}
                onChange={(e) => setField("participant_note", e.target.value)}
                placeholder="Welcome message and rules…"
                className="text-xs leading-relaxed"
              />
              <p className="text-right text-[11px] text-muted-foreground font-semibold">
                {(config.participant_note ?? "").length || 150}/1000
              </p>
            </div>
          </SectionCard>

          {/* 8. Other Settings */}
          <SectionCard title="8. Other Settings">
            <div className="space-y-3.5">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="chk-show-app"
                  checked={Boolean(config.show_on_app)}
                  onCheckedChange={(v) => setField("show_on_app", Boolean(v))}
                />
                <label htmlFor="chk-show-app" className="cursor-pointer text-xs">
                  <span className="block font-bold text-slate-800">Show competition on app</span>
                  <span className="block text-muted-foreground text-[11px]">Enable or disable the competition from being visible on the app.</span>
                </label>
              </div>

              <div className="flex items-start gap-3">
                <Checkbox
                  id="chk-multi-entry"
                  checked={Boolean(config.allow_multiple_entries)}
                  onCheckedChange={(v) => setField("allow_multiple_entries", Boolean(v))}
                />
                <label htmlFor="chk-multi-entry" className="cursor-pointer text-xs">
                  <span className="block font-bold text-slate-800">Allow multiple entries from same contact</span>
                  <span className="block text-muted-foreground text-[11px]">If enabled, same contact number can submit multiple entries.</span>
                </label>
              </div>

              <div className="flex items-start gap-3">
                <Checkbox
                  id="chk-auto-pub"
                  checked={Boolean(config.auto_publish_approved)}
                  onCheckedChange={(v) => setField("auto_publish_approved", Boolean(v))}
                />
                <label htmlFor="chk-auto-pub" className="cursor-pointer text-xs">
                  <span className="block font-bold text-slate-800">Auto Publish Approved Entries</span>
                  <span className="block text-muted-foreground text-[11px]">Automatically publish entry when approved.</span>
                </label>
              </div>

              <div className="flex items-center justify-between gap-4 border-t pt-3">
                <div>
                  <p className="text-xs font-bold text-slate-800">Display on Leaderboard <Info className="inline h-3 w-3 text-muted-foreground" /></p>
                  <p className="text-[11px] text-muted-foreground">When participants appear on the public leaderboard.</p>
                </div>
                <Select value={config.leaderboard_display ?? "after_voting_starts"} onValueChange={(v) => setField("leaderboard_display", v as CompetitionConfig["leaderboard_display"])}>
                  <SelectTrigger className="w-48 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="always">Always</SelectItem>
                    <SelectItem value="after_voting_starts">After voting starts</SelectItem>
                    <SelectItem value="after_voting_ends">After voting ends</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between gap-4 border-t pt-3">
                <div>
                  <p className="text-xs font-bold text-slate-800">Report Limit Per User</p>
                  <p className="text-[11px] text-muted-foreground">
                    How many "Report an Issue" submissions one user can send. Set 0 for no limit.
                  </p>
                </div>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  className="w-24 text-xs"
                  value={String(config.max_reports_per_user ?? 5)}
                  onChange={(e) => setField("max_reports_per_user", Number(e.target.value))}
                />
              </div>

              <div className="flex items-center gap-2 rounded-md bg-blue-50 p-2 text-xs text-blue-800">
                <Info className="h-4 w-4 text-blue-600 flex-shrink-0" />
                <span><strong>Note:</strong> Changes will be applied to this competition immediately after saving.</span>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* ---- RIGHT COLUMN: Share / Voting Preview (Auto Generated) ---- */}
        <div className="space-y-4">
          <SectionCard
            title="Share / Voting Preview (Auto Generated)"
            description="This share image will be automatically generated and shared when users share this participant to ask for votes."
          >
            {/* Visual Poster Card Mockup */}
            <div className="relative overflow-hidden rounded-xl border border-amber-300 bg-gradient-to-b from-neutral-950 via-neutral-900 to-black p-4 shadow-lg text-white">
              {/* String lights graphic header */}
              <div className="flex justify-between px-2 opacity-80 mb-2">
                <div className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                <div className="h-2 w-2 rounded-full bg-rose-400 animate-pulse" />
                <div className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                <div className="h-2 w-2 rounded-full bg-rose-400 animate-pulse" />
                <div className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
              </div>

              {/* Pehli baat badge */}
              <div className="flex items-center justify-center gap-1.5">
                <div className="h-5 w-5 rounded bg-red-600 flex items-center justify-center text-[10px] font-black text-white">PB</div>
                <span className="text-sm font-extrabold tracking-tight">Pehli Baat</span>
              </div>

              {/* Title & Subtitle */}
              <div className="mt-2 text-center">
                <h3 className="text-lg font-black tracking-wider text-amber-400 uppercase drop-shadow">
                  GANPATI UTSAV
                </h3>
                <h2 className="text-xl font-black tracking-widest text-amber-300 uppercase">
                  COMPETITION
                </h2>
                <p className="mt-1 text-[9px] font-bold text-amber-200 tracking-wider">
                  CELEBRATE DEVOTION. GET MORE VOTES. WIN TOGETHER!
                </p>
              </div>

              {/* Center Ganesha Image & Vote Box */}
              <div className="relative my-3 rounded-lg overflow-hidden border border-amber-500/40 bg-black/60 p-3 text-center">
                <div className="mx-auto mb-2 h-36 w-full max-w-[200px] overflow-hidden rounded-md border border-amber-400/30 bg-amber-950/40 flex items-center justify-center">
                  {previews.share || config.share_template_url ? (
                    <img src={previews.share ?? config.share_template_url ?? ""} alt="Ganesha template" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-amber-300">
                      <Sparkles className="h-10 w-10 text-amber-400 mb-1" />
                      <span className="text-[10px] font-semibold text-amber-200">Ganesh Idol Cover Image</span>
                    </div>
                  )}
                </div>

                <div className="inline-block rounded-full bg-amber-500 px-3 py-0.5 text-[9px] font-black text-black uppercase tracking-wider mb-1">
                  {config.share_vote_text || "VOTE FOR"}
                </div>
                <h4 className="text-sm font-black text-amber-300 tracking-wide uppercase">
                  SHREE GANESH MITRA MANDAL
                </h4>
                <p className="text-[10px] font-semibold text-amber-100/80">
                  ANDHERI (EAST), MUMBAI
                </p>
                <p className="mt-1 text-[9px] font-bold text-amber-300 tracking-wide">
                  {config.share_support_text || "SUPPORT US & HELP US WIN!"}
                </p>

                <div className="mt-2 inline-flex items-center justify-center gap-1 rounded-md bg-amber-500 px-4 py-1.5 text-xs font-black text-black shadow hover:bg-amber-400">
                  <span>👍 VOTE NOW</span>
                </div>
              </div>

              {/* Bottom App Download strip */}
              <div className="mt-2 flex items-center justify-between border-t border-amber-500/20 pt-2 text-[9px]">
                <div className="flex items-center gap-1.5">
                  <Smartphone className="h-4 w-4 text-amber-400" />
                  <div>
                    <p className="font-extrabold text-amber-200">DOWNLOAD PEHLI BAAT APP</p>
                    <p className="text-[8px] text-amber-300/70">& Support your favourite pandal!</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <QrCode className="h-6 w-6 text-white" />
                  <div className="flex flex-col gap-0.5">
                    <span className="rounded bg-white/20 px-1 py-0.2 text-[7px] font-bold">Google Play</span>
                    <span className="rounded bg-white/20 px-1 py-0.2 text-[7px] font-bold">App Store</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Customization Inputs */}
            <div className="mt-4 space-y-3">
              <Label className="text-xs font-bold">Customize Template Text</Label>
              <div>
                <Input
                  className="text-xs"
                  value={config.share_vote_text ?? "Vote for"}
                  onChange={(e) => setField("share_vote_text", e.target.value)}
                  placeholder="Vote for"
                />
              </div>
              <div>
                <Input
                  className="text-xs"
                  value={config.share_support_text ?? "Support & Vote Now!"}
                  onChange={(e) => setField("share_support_text", e.target.value)}
                  placeholder="Support & Vote Now!"
                />
              </div>
              <div>
                <Input
                  className="text-xs"
                  value={config.share_footer_text ?? "Ganesh Utsav 2025 Competition"}
                  onChange={(e) => setField("share_footer_text", e.target.value)}
                  placeholder="Footer text"
                />
              </div>

              <div className="flex items-start gap-2 rounded-md bg-blue-50 p-2.5 text-xs text-blue-900">
                <Info className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <span>
                  Participants will be able to add their cover photo and mandal name, which will replace the placeholders in this template.
                </span>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
