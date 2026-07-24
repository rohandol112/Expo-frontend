import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Activity,
  ArrowLeft,
  CheckCircle2,
  Copy,
  ImagePlus,
  MapPin,
  MoreHorizontal,
  Save,
  Trash2,
  User,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionCard } from "@/components/admin/SectionCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useCompetitionEntry,
  useReviewBanner,
  useReviewEntry,
  useSaveEntryNote,
  useUpdateEntry,
} from "@/hooks/api/useCompetition";
import { useRegions } from "@/hooks/api/useRegions";
import type { AdminEntryDetail, UpdateEntryInput } from "@/types/competitionAdmin";
import { ROUTES } from "@/constants/routes.constants";

export const Route = createFileRoute("/_app/competition/participants/$participantId")({
  component: ParticipantDetailPage,
});

const STATUS_LABELS: Record<string, string> = {
  submitted: "In Review",
  approved: "Active",
  rejected: "Rejected",
  in_review: "In Review",
};

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR - 1949 }, (_, i) => CURRENT_YEAR - i);

type EditableForm = {
  name: string;
  established_year: number | null;
  committee_name: string;
  state_id: number | null;
  district_id: number | null;
  area_id: number | null;
  address: string;
  description: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  participant_type: "individual" | "organization";
};

function toForm(entry: AdminEntryDetail): EditableForm {
  return {
    name: entry.name,
    established_year: entry.established_year,
    committee_name: entry.committee_name,
    state_id: entry.state_id,
    district_id: entry.district_id,
    area_id: entry.area_id,
    address: entry.address,
    description: entry.description,
    contact_name: entry.contact.name,
    contact_phone: entry.contact.phone,
    contact_email: entry.contact.email ?? "",
    participant_type: entry.contact.participant_type === "organization" ? "organization" : "individual",
  };
}

/** Only the fields that actually changed, mapped to the update payload. */
function diff(original: EditableForm, next: EditableForm): UpdateEntryInput {
  const patch: UpdateEntryInput = {};
  if (next.name !== original.name) patch.name = next.name;
  if (next.established_year !== original.established_year && next.established_year != null)
    patch.established_year = next.established_year;
  if (next.committee_name !== original.committee_name) patch.committee_name = next.committee_name;
  if (next.address !== original.address) patch.address = next.address;
  if (next.description !== original.description) patch.description = next.description;
  if (next.state_id !== original.state_id && next.state_id != null) patch.state_id = next.state_id;
  if (next.district_id !== original.district_id && next.district_id != null) patch.district_id = next.district_id;
  if (next.area_id !== original.area_id && next.area_id != null) patch.area_id = next.area_id;
  if (next.participant_type !== original.participant_type) patch.participant_type = next.participant_type;
  if (next.contact_name !== original.contact_name) patch.contact_name = next.contact_name;
  if (next.contact_phone !== original.contact_phone) patch.contact_phone = next.contact_phone;
  if (next.contact_email !== original.contact_email) patch.contact_email = next.contact_email || null;
  return patch;
}

function ParticipantDetailPage() {
  const { participantId } = Route.useParams();
  const navigate = useNavigate();
  const entryQuery = useCompetitionEntry(participantId);
  const reviewEntry = useReviewEntry();
  const reviewBanner = useReviewBanner();
  const updateEntry = useUpdateEntry(participantId);
  const saveNote = useSaveEntryNote(participantId);
  const regionsQuery = useRegions();

  const [form, setForm] = useState<EditableForm | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const entry = entryQuery.data;
  const original = useMemo(() => (entry ? toForm(entry) : null), [entry]);
  const current = form ?? original;

  const states = regionsQuery.data ?? [];
  const districts = useMemo(
    () => states.find((s) => s.id === current?.state_id)?.districts ?? [],
    [states, current?.state_id],
  );
  const areas = useMemo(
    () => districts.find((d) => d.id === current?.district_id)?.areas ?? [],
    [districts, current?.district_id],
  );

  const setField = <K extends keyof EditableForm>(key: K, value: EditableForm[K]) =>
    setForm((f) => ({ ...(f ?? original!), [key]: value }));

  const dirty = Boolean(original && current && Object.keys(diff(original, current)).length > 0);

  const handleSave = () => {
    if (!original || !current) return;
    const patch = diff(original, current);
    if (Object.keys(patch).length === 0) return toast.info("No changes to save");
    updateEntry.mutate(patch, {
      onSuccess: () => {
        toast.success("Changes saved");
        setForm(null);
      },
      onError: (err) => toast.error(err instanceof Error ? err.message : "Save failed"),
    });
  };

  const handleApprove = () =>
    reviewEntry.mutate(
      { id: Number(participantId), status: "approved" },
      {
        onSuccess: () => toast.success("Participant approved"),
        onError: (err) => toast.error(err instanceof Error ? err.message : "Approval failed"),
      },
    );

  const handleReject = () =>
    reviewEntry.mutate(
      { id: Number(participantId), status: "rejected", reason: rejectReason || "Entry rejected by admin" },
      {
        onSuccess: () => {
          toast.success("Participant rejected");
          setRejectOpen(false);
        },
        onError: (err) => toast.error(err instanceof Error ? err.message : "Rejection failed"),
      },
    );

  const handleSaveNote = () => {
    if (note == null) return;
    saveNote.mutate(note, {
      onSuccess: () => toast.success("Note saved"),
      onError: (err) => toast.error(err instanceof Error ? err.message : "Could not save note"),
    });
  };

  const copyCode = () => {
    if (!entry) return;
    navigator.clipboard?.writeText(entry.entry_code).then(() => toast.success("Entry ID copied"));
  };

  return (
    <div>
      <PageHeader
        title="Participant Details"
        breadcrumbs={[
          { label: "Dashboard", to: ROUTES.DASHBOARD },
          { label: "Competition", to: ROUTES.COMPETITION },
          { label: "Participants", to: ROUTES.COMPETITION_PARTICIPANTS },
          { label: entry?.name ?? participantId },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate({ to: ROUTES.COMPETITION_PARTICIPANTS })}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!dirty || updateEntry.isPending}>
              <Save className="mr-2 h-4 w-4" />
              {updateEntry.isPending ? "Saving…" : "Save Changes"}
            </Button>
            {entry && entry.status !== "approved" && (
              <Button
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={handleApprove}
                disabled={reviewEntry.isPending}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Approve
              </Button>
            )}
            {entry && entry.status !== "rejected" && (
              <Button variant="destructive" onClick={() => setRejectOpen(true)} disabled={reviewEntry.isPending}>
                <XCircle className="mr-2 h-4 w-4" />
                Reject
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={copyCode}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Entry ID
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        }
      />

      {entryQuery.isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {entryQuery.error && (
        <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          Unable to load participant from backend.
        </div>
      )}

      {entry && current && (
        <div className="grid gap-4 lg:grid-cols-3">
          {/* ---- Left column ---- */}
          <div className="space-y-4 lg:col-span-2">
            <SectionCard title="Basic Information">
              <div className="space-y-4">
                <div>
                  <Label>Established In</Label>
                  <Select
                    value={current.established_year ? String(current.established_year) : undefined}
                    onValueChange={(v) => setField("established_year", Number(v))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {YEARS.map((y) => (
                        <SelectItem key={y} value={String(y)}>
                          {y}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Committee / Organization Name</Label>
                  <Input
                    className="mt-1"
                    value={current.committee_name}
                    onChange={(e) => setField("committee_name", e.target.value)}
                  />
                </div>

                <div>
                  <Label>Location</Label>
                  <div className="mt-1 grid gap-2 sm:grid-cols-3">
                    <Select
                      value={current.state_id ? String(current.state_id) : undefined}
                      onValueChange={(v) => setForm((f) => ({ ...(f ?? original!), state_id: Number(v), district_id: null, area_id: null }))}
                    >
                      <SelectTrigger><SelectValue placeholder="State" /></SelectTrigger>
                      <SelectContent>
                        {states.map((s) => (
                          <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={current.district_id ? String(current.district_id) : undefined}
                      onValueChange={(v) => setForm((f) => ({ ...(f ?? original!), district_id: Number(v), area_id: null }))}
                      disabled={!current.state_id}
                    >
                      <SelectTrigger><SelectValue placeholder="District" /></SelectTrigger>
                      <SelectContent>
                        {districts.map((d) => (
                          <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={current.area_id ? String(current.area_id) : undefined}
                      onValueChange={(v) => setField("area_id", Number(v))}
                      disabled={!current.district_id}
                    >
                      <SelectTrigger><SelectValue placeholder="Area" /></SelectTrigger>
                      <SelectContent>
                        {areas.map((a) => (
                          <SelectItem key={a.id} value={String(a.id)}>{a.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Address</Label>
                  <Input className="mt-1" value={current.address} onChange={(e) => setField("address", e.target.value)} />
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea
                    className="mt-1"
                    rows={4}
                    maxLength={500}
                    value={current.description}
                    onChange={(e) => setField("description", e.target.value)}
                  />
                  <p className="mt-1 text-right text-xs text-muted-foreground">{current.description.length}/500</p>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Contact Details">
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label>Full Name</Label>
                    <Input className="mt-1" value={current.contact_name} onChange={(e) => setField("contact_name", e.target.value)} />
                  </div>
                  <div>
                    <Label>Mobile Number</Label>
                    <Input className="mt-1" value={current.contact_phone} onChange={(e) => setField("contact_phone", e.target.value)} />
                  </div>
                </div>
                <div>
                  <Label>Email Address</Label>
                  <Input className="mt-1" value={current.contact_email} onChange={(e) => setField("contact_email", e.target.value)} />
                </div>
                <div>
                  <Label>Participating As</Label>
                  <RadioGroup
                    className="mt-2 grid gap-3 sm:grid-cols-2"
                    value={current.participant_type}
                    onValueChange={(v) => setField("participant_type", v as EditableForm["participant_type"])}
                  >
                    <label className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 has-[:checked]:border-primary">
                      <RadioGroupItem value="organization" id="pt-org" className="mt-0.5" />
                      <span>
                        <span className="block text-sm font-medium">Organization / Committee</span>
                        <span className="block text-xs text-muted-foreground">Participate on behalf of an organization or committee</span>
                      </span>
                    </label>
                    <label className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 has-[:checked]:border-primary">
                      <RadioGroupItem value="individual" id="pt-ind" className="mt-0.5" />
                      <span>
                        <span className="block text-sm font-medium">Individual</span>
                        <span className="block text-xs text-muted-foreground">Participate as an individual</span>
                      </span>
                    </label>
                  </RadioGroup>
                </div>

                <div className="grid gap-3 border-t pt-4 text-sm sm:grid-cols-3">
                  <MetaItem label="Submitted On" value={entry.submitted_on ? new Date(entry.submitted_on).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"} />
                  <MetaItem label="Submitted By" value={entry.submitted_by ? `${entry.submitted_by}${entry.submitted_by_phone ? ` (${entry.submitted_by_phone})` : ""}` : "—"} />
                  <MetaItem label="User Location" value={[entry.district_name, entry.state_name].filter(Boolean).join(", ") || "—"} />
                </div>
              </div>
            </SectionCard>

            {entry.custom_fields && Object.keys(entry.custom_fields).length > 0 && (
              <SectionCard title="Additional Form Fields">
                <div className="grid gap-4 sm:grid-cols-2">
                  {Object.entries(entry.custom_fields).map(([key, value]) => (
                    <MetaItem key={key} label={key.replace(/_/g, " ")} value={value || "—"} />
                  ))}
                </div>
              </SectionCard>
            )}
          </div>

          {/* ---- Right column ---- */}
          <div className="space-y-4">
            <SectionCard
              title="Cover Image"
              action={
                <Button variant="outline" size="sm" onClick={() => toast.info("Photo management via participant app")}>
                  <ImagePlus className="mr-2 h-4 w-4" />
                  Change Photo
                </Button>
              }
            >
              {entry.cover_photo_url ? (
                <img src={entry.cover_photo_url} alt="" className="w-full rounded-lg object-cover" />
              ) : (
                <div className="flex h-40 items-center justify-center rounded-lg bg-muted text-sm text-muted-foreground">
                  No cover image
                </div>
              )}
            </SectionCard>

            <SectionCard
              title={`Uploaded Photos (${entry.photo_urls.length})`}
              description="Max 5. Supported: JPG, PNG (5 MB each)."
            >
              {entry.photo_urls.length === 0 ? (
                <p className="text-sm text-muted-foreground">No photos uploaded.</p>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {entry.photo_urls.map((url) => (
                    <img key={url} src={url} alt="" className="aspect-square w-full rounded object-cover" />
                  ))}
                </div>
              )}
            </SectionCard>

            <SectionCard title="Application Status">
              <div className="flex items-center justify-between">
                <StatusBadge status={STATUS_LABELS[entry.status] ?? entry.status} />
                <span className="text-3xl font-bold">{entry.total_votes.toLocaleString("en-IN")}<span className="ml-1 text-xs font-normal text-muted-foreground">votes</span></span>
              </div>
              {entry.status === "submitted" && (
                <p className="mt-2 text-sm text-muted-foreground">This entry is pending review.</p>
              )}
              {entry.status === "rejected" && entry.rejection_reason && (
                <p className="mt-2 text-sm text-destructive">{entry.rejection_reason}</p>
              )}
              {entry.rank != null && <p className="mt-1 text-sm text-muted-foreground">Rank #{entry.rank} overall</p>}
            </SectionCard>

            <SectionCard title="Entry ID">
              <div className="flex items-center justify-between rounded-md border bg-muted/40 px-3 py-2">
                <span className="font-mono text-sm">{entry.entry_code}</span>
                <Button variant="ghost" size="icon" onClick={copyCode}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </SectionCard>

            <SectionCard title="Notes (Admin Only)">
              <Textarea
                rows={4}
                placeholder="Add notes about this participant…"
                value={note ?? entry.admin_notes ?? ""}
                onChange={(e) => setNote(e.target.value)}
              />
              <Button
                className="mt-3"
                variant="outline"
                size="sm"
                onClick={handleSaveNote}
                disabled={note == null || saveNote.isPending}
              >
                {saveNote.isPending ? "Saving…" : "Save Note"}
              </Button>
            </SectionCard>

            <SectionCard title="Activity Log">
              {entry.activity.length === 0 ? (
                <p className="text-sm text-muted-foreground">No activity yet.</p>
              ) : (
                <ol className="space-y-4">
                  {entry.activity.map((a) => (
                    <li key={a.id} className="flex gap-3">
                      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        {a.type === "status_changed" ? <CheckCircle2 className="h-3.5 w-3.5" /> : a.type === "edited" ? <User className="h-3.5 w-3.5" /> : <Activity className="h-3.5 w-3.5" />}
                      </div>
                      <div className="text-sm">
                        <p className="font-medium">{a.message || a.type}</p>
                        <p className="text-xs text-muted-foreground">
                          {a.actor_name ? `${a.actor_name} · ` : ""}
                          {new Date(a.created_at).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </SectionCard>
          </div>
        </div>
      )}

      {/* Banners moved below the two-column grid so the review actions stay available */}
      {entry && entry.banners.length > 0 && (
        <SectionCard
          className="mt-4"
          title={`Banners (${entry.banners.length})`}
          description="Each approved banner earns bonus vote points. AI reviews first; uncertain cases need manual review."
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {entry.banners.map((banner) => (
              <div key={banner.id} className="rounded-lg border p-3">
                {banner.image_url ? (
                  <img src={banner.image_url} alt="" className="mb-3 h-40 w-full rounded object-cover" />
                ) : (
                  <div className="mb-3 h-40 w-full rounded bg-muted" />
                )}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Banner {banner.slot}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(banner.uploaded_at).toLocaleDateString("en-IN")} · {banner.points} pts
                    </p>
                  </div>
                  <StatusBadge status={STATUS_LABELS[banner.status] ?? banner.status} />
                </div>
                {banner.status === "in_review" && (
                  <div className="mt-3 flex gap-2">
                    <Button
                      size="sm"
                      disabled={reviewBanner.isPending}
                      onClick={() =>
                        reviewBanner.mutate({ id: banner.id, status: "approved" }, { onSuccess: () => toast.success("Banner approved") })
                      }
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={reviewBanner.isPending}
                      onClick={() =>
                        reviewBanner.mutate(
                          { id: banner.id, status: "rejected", reason: "Rejected by admin" },
                          { onSuccess: () => toast.success("Banner rejected") },
                        )
                      }
                    >
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      <ConfirmDialog
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        title="Reject participant?"
        description="The participant will see the rejection reason in the app."
        confirmLabel="Reject"
        onConfirm={handleReject}
      >
        <Textarea
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="Rejection reason"
          className="mt-2"
        />
      </ConfirmDialog>
    </div>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  );
}
