import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Eye, Save, SlidersHorizontal, Trash2, Upload } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCompetitionConfig, useUpdateCompetitionConfig } from "@/hooks/api/useCompetition";
import { useRegions } from "@/hooks/api/useRegions";
import { competitionAdminService } from "@/services/competitionAdmin.service";
import type { CompetitionConfig } from "@/types/competitionAdmin";
import { ROUTES } from "@/constants/routes.constants";

export const Route = createFileRoute("/_app/competition/settings")({ component: CompetitionSettingsPage });

function toLocalInput(value: string | null | undefined) {
  if (!value) return "";
  const date = new Date(value);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
const toIso = (v: string) => (v ? new Date(v).toISOString() : null);

function CompetitionSettingsPage() {
  const navigate = useNavigate();
  const configQuery = useCompetitionConfig();
  const updateConfig = useUpdateCompetitionConfig();
  const regionsQuery = useRegions();
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
    <div>
      <PageHeader
        title="Competition Settings"
        breadcrumbs={[
          { label: "Dashboard", to: ROUTES.DASHBOARD },
          { label: "Competition", to: ROUTES.COMPETITION },
          { label: "Settings" },
        ]}
        actions={
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-md border px-3 py-1.5">
              <span className={config.is_active ? "text-sm font-medium text-emerald-600" : "text-sm text-muted-foreground"}>
                {config.is_active ? "Active" : "Inactive"}
              </span>
              <Switch checked={Boolean(config.is_active)} onCheckedChange={(v) => setField("is_active", v)} />
            </div>
            <Button variant="destructive" onClick={handleSave} disabled={updateConfig.isPending || !form}>
              <Save className="mr-2 h-4 w-4" />
              {updateConfig.isPending ? "Saving…" : "Save All Changes"}
            </Button>
          </div>
        }
      />

      {configQuery.error && (
        <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          Unable to load competition settings from backend.
        </div>
      )}

      {/* 1. Competition Details + Share preview */}
      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard title="1. Competition Details" className="lg:col-span-2" description="Manage all settings related to this competition.">
          <div className="space-y-4">
            <div>
              <Label>Competition Name</Label>
              <Input className="mt-1" value={config.title ?? ""} onChange={(e) => setField("title", e.target.value)} />
            </div>
            <div>
              <Label>Subtitle</Label>
              <Input className="mt-1" value={config.subtitle ?? ""} onChange={(e) => setField("subtitle", e.target.value)} />
            </div>
            <div>
              <Label>Competition Banner (hero image shown in the app)</Label>
              <div className="mt-1 flex items-center gap-3">
                <div className="h-20 w-32 overflow-hidden rounded-lg border bg-muted">
                  {previews.banner || config.banner_image_url ? (
                    <img src={previews.banner ?? config.banner_image_url ?? ""} alt="Competition banner" className="h-full w-full object-cover" />
                  ) : null}
                </div>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 text-sm hover:bg-accent">
                  <Upload className="h-4 w-4" />
                  {uploading === "banner" ? "Uploading…" : "Upload Banner"}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleAssetUpload(f, "banner"); e.target.value = ""; }} />
                </label>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <Label>Select States</Label>
                <MultiSelect className="mt-1" options={stateOpts} value={config.target_state_ids ?? []} onChange={(v) => setField("target_state_ids", v)} placeholder="States" />
              </div>
              <div>
                <Label>Select Districts</Label>
                <MultiSelect className="mt-1" options={districtOpts} value={config.target_district_ids ?? []} onChange={(v) => setField("target_district_ids", v)} placeholder="Districts" />
              </div>
              <div>
                <Label>Select Areas</Label>
                <MultiSelect className="mt-1" options={areaOpts} value={config.target_area_ids ?? []} onChange={(v) => setField("target_area_ids", v)} placeholder="Areas" />
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Share / Voting Preview" description="Auto-generated share image shown when a participant asks for votes.">
          <div className="overflow-hidden rounded-lg border">
            {previews.share || config.share_template_url ? (
              <img src={previews.share ?? config.share_template_url ?? ""} alt="Share template" className="w-full object-cover" />
            ) : (
              <div className="flex h-56 items-center justify-center bg-gradient-to-b from-amber-500 to-rose-600 text-center text-primary-foreground">
                <div>
                  <p className="text-xs uppercase tracking-widest opacity-80">Pehli Baat</p>
                  <p className="text-2xl font-extrabold">COMPETITION</p>
                  <p className="mt-2 text-sm">{config.share_vote_text ?? "Vote for"}</p>
                  <p className="text-lg font-bold">YOUR PANDAL</p>
                </div>
              </div>
            )}
          </div>
          <div className="mt-3 space-y-2">
            <label className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed px-3 py-2 text-sm hover:bg-accent">
              <Upload className="h-4 w-4" />
              {uploading === "share_template" ? "Uploading…" : "Upload Master Template"}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleAssetUpload(f, "share_template"); e.target.value = ""; }} />
            </label>
            <div>
              <Label className="text-xs">Customize Template Text</Label>
              <Input className="mt-1" value={config.share_vote_text ?? ""} onChange={(e) => setField("share_vote_text", e.target.value)} placeholder="Vote for" />
            </div>
            <Input value={config.share_support_text ?? ""} onChange={(e) => setField("share_support_text", e.target.value)} placeholder="Support & Vote Now!" />
            <Input value={config.share_footer_text ?? ""} onChange={(e) => setField("share_footer_text", e.target.value)} placeholder="Footer text" />
          </div>
        </SectionCard>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {/* 2. Participation Form Settings */}
        <SectionCard title="2. Participation Form Settings" description="Manage and customize the participant registration form.">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => navigate({ to: ROUTES.COMPETITION_FORM_SETTINGS })}>
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Edit Participation Form
            </Button>
            <Button variant="ghost" onClick={() => navigate({ to: ROUTES.COMPETITION_FORM_SETTINGS })}>
              <Eye className="mr-2 h-4 w-4" />
              View Full Form
            </Button>
          </div>
        </SectionCard>

        {/* 3. Participation Period */}
        <SectionCard title="3. Participation Period (Form Submission)" description="Set the start and end date & time for form submission.">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Start Date & Time</Label>
              <Input className="mt-1" type="datetime-local" value={toLocalInput(config.participation_starts_at)} onChange={(e) => setField("participation_starts_at", toIso(e.target.value))} />
            </div>
            <div>
              <Label>End Date & Time</Label>
              <Input className="mt-1" type="datetime-local" value={toLocalInput(config.participation_ends_at)} onChange={(e) => setField("participation_ends_at", toIso(e.target.value))} />
            </div>
          </div>
        </SectionCard>

        {/* 4. Voting Period */}
        <SectionCard title="4. Voting Period" description="The participant list becomes visible and Vote Now enables when voting starts.">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Start Date & Time</Label>
              <Input className="mt-1" type="datetime-local" value={toLocalInput(config.voting_starts_at)} onChange={(e) => setField("voting_starts_at", toIso(e.target.value))} />
            </div>
            <div>
              <Label>End Date & Time</Label>
              <Input className="mt-1" type="datetime-local" value={toLocalInput(config.voting_ends_at)} onChange={(e) => setField("voting_ends_at", toIso(e.target.value))} />
            </div>
          </div>
        </SectionCard>

        {/* 5. Banner Upload Settings */}
        <SectionCard title="5. Banner Upload Settings" description="Manage banner upload, allowed count, size and time.">
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <Label>Max Banners</Label>
                <Input className="mt-1" type="number" min={1} max={10} value={config.max_banners ?? 2} onChange={(e) => setField("max_banners", Number(e.target.value))} />
              </div>
              <div>
                <Label>Max File Size (MB)</Label>
                <Input className="mt-1" type="number" min={1} max={50} value={config.max_banner_file_size_mb ?? 5} onChange={(e) => setField("max_banner_file_size_mb", Number(e.target.value))} />
              </div>
              <div>
                <Label>Points / Banner</Label>
                <Input className="mt-1" type="number" min={0} value={config.banner_points ?? 25} onChange={(e) => setField("banner_points", Number(e.target.value))} />
              </div>
            </div>
            <div>
              <Label>Allowed Formats</Label>
              <Input className="mt-1" value={config.allowed_banner_formats ?? ""} onChange={(e) => setField("allowed_banner_formats", e.target.value)} placeholder="JPG,PNG,WEBP" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>Upload Start</Label>
                <Input className="mt-1" type="datetime-local" value={toLocalInput(config.banner_upload_starts_at)} onChange={(e) => setField("banner_upload_starts_at", toIso(e.target.value))} />
              </div>
              <div>
                <Label>Upload End</Label>
                <Input className="mt-1" type="datetime-local" value={toLocalInput(config.banner_upload_ends_at)} onChange={(e) => setField("banner_upload_ends_at", toIso(e.target.value))} />
              </div>
            </div>
          </div>
        </SectionCard>

        {/* 6. Participant Button Visibility */}
        <SectionCard title="6. Participant Button Visibility (Show Competition)" description="Select where the competition button is visible on the app.">
          <RadioGroup className="mb-3 flex gap-6" value={config.button_scope ?? "all"} onValueChange={(v) => setField("button_scope", v as CompetitionConfig["button_scope"])}>
            <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="specific" id="bs-spec" /> Specific Locations</label>
            <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="all" id="bs-all" /> All Locations</label>
          </RadioGroup>
          {config.button_scope === "specific" && (
            <div className="grid gap-3 sm:grid-cols-3">
              <MultiSelect options={stateOpts} value={config.button_state_ids ?? []} onChange={(v) => setField("button_state_ids", v)} placeholder="States" />
              <MultiSelect options={districtOpts} value={config.button_district_ids ?? []} onChange={(v) => setField("button_district_ids", v)} placeholder="Districts" />
              <MultiSelect options={areaOpts} value={config.button_area_ids ?? []} onChange={(v) => setField("button_area_ids", v)} placeholder="Areas" />
            </div>
          )}
        </SectionCard>

        {/* 7. Note / Message */}
        <SectionCard title="7. Note / Message (Visible to Participants)" description="Add a note or description for this competition.">
          <Textarea rows={5} maxLength={1000} value={config.participant_note ?? ""} onChange={(e) => setField("participant_note", e.target.value)} placeholder="Welcome message and rules…" />
          <p className="mt-1 text-right text-xs text-muted-foreground">{(config.participant_note ?? "").length}/1000</p>
        </SectionCard>

        {/* 7b. AdMob interstitial */}
        <SectionCard title="Ad Settings (AdMob Interstitial)" description="Full-screen interstitial ad shown periodically as users browse the competition.">
          <div className="space-y-3">
            <div>
              <Label>Interstitial Frequency</Label>
              <Input
                className="mt-1"
                type="number"
                min={0}
                max={100}
                value={config.interstitial_frequency ?? 0}
                onChange={(e) => setField("interstitial_frequency", Number(e.target.value))}
              />
              <p className="mt-1 text-xs text-muted-foreground">Show an interstitial after every N pandal opens. 0 disables interstitials.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>Android Interstitial Unit ID</Label>
                <Input className="mt-1" value={config.interstitial_unit_id_android ?? ""} onChange={(e) => setField("interstitial_unit_id_android", e.target.value || null)} placeholder="ca-app-pub-…/…" />
              </div>
              <div>
                <Label>iOS Interstitial Unit ID</Label>
                <Input className="mt-1" value={config.interstitial_unit_id_ios ?? ""} onChange={(e) => setField("interstitial_unit_id_ios", e.target.value || null)} placeholder="ca-app-pub-…/…" />
              </div>
            </div>
          </div>
        </SectionCard>

        {/* 8. Other Settings */}
        <SectionCard title="8. Other Settings">
          <div className="space-y-4">
            <ToggleRow label="Show competition on app" description="Enable or disable the competition from being visible on the app." checked={Boolean(config.show_on_app)} onChange={(v) => setField("show_on_app", v)} />
            <ToggleRow label="Allow multiple entries from same contact" description="If enabled, same contact number can submit multiple entries." checked={Boolean(config.allow_multiple_entries)} onChange={(v) => setField("allow_multiple_entries", v)} />
            <ToggleRow label="Auto Publish Approved Entries" description="Automatically publish entry when approved." checked={Boolean(config.auto_publish_approved)} onChange={(v) => setField("auto_publish_approved", v)} />
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium">Display on Leaderboard</p>
                <p className="text-xs text-muted-foreground">When participants appear on the public leaderboard.</p>
              </div>
              <Select value={config.leaderboard_display ?? "after_voting_starts"} onValueChange={(v) => setField("leaderboard_display", v as CompetitionConfig["leaderboard_display"])}>
                <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="always">Always</SelectItem>
                  <SelectItem value="after_voting_starts">After voting starts</SelectItem>
                  <SelectItem value="after_voting_ends">After voting ends</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

function ToggleRow({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
