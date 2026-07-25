import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Activity,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Copy,
  ImagePlus,
  MapPin,
  MoreHorizontal,
  Pencil,
  Plus,
  Save,
  Trash2,
  User,
  X,
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
  submitted: "Draft",
  draft: "Draft",
  approved: "Approved",
  rejected: "Rejected",
};

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR - 1899 }, (_, i) => CURRENT_YEAR - i);
const VISARJAN_OPTIONS = ["1.5 / 2 Days", "5 Days", "7 Days", "11 Days"];

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "—";
  return (
    d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) +
    ", " +
    d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })
  );
}

type EditableForm = {
  name: string;
  established_year: number | null;
  committee_name: string;
  state_id: number | null;
  district_id: number | null;
  area_id: number | null;
  address: string;
  description: string;
  visarjan_days: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  participant_type: "individual" | "organization";
};

function toForm(entry: AdminEntryDetail): EditableForm {
  return {
    name: entry.name,
    established_year: entry.established_year ?? 2023,
    committee_name: entry.committee_name || "Lalbaugcha Raja Sarvajanik Ganeshotsav Mandal",
    state_id: entry.state_id,
    district_id: entry.district_id,
    area_id: entry.area_id,
    address: entry.address || "Lalbaug Market, Lalbaug, Mumbai - 400012, Maharashtra, India",
    description: entry.description || "Lalbaugcha Raja is one of the most popular and iconic Ganesh pandals in Mumbai. Known for its grand celebrations, cultural programs, and social initiatives, it devotes every year.",
    visarjan_days: entry.visarjan_days ?? entry.custom_fields?.visarjan_days ?? "11 Days",
    contact_name: entry.contact.name || "Suresh Jadhav",
    contact_phone: entry.contact.phone || "98765 43210",
    contact_email: entry.contact.email || "lalbaugcharaja@gmail.com",
    participant_type: entry.contact.participant_type === "organization" ? "organization" : "individual",
  };
}

function diff(original: EditableForm, next: EditableForm): UpdateEntryInput {
  const patch: UpdateEntryInput = {};
  if (next.name !== original.name) patch.name = next.name;
  if (next.established_year !== original.established_year && next.established_year != null)
    patch.established_year = next.established_year;
  if (next.committee_name !== original.committee_name) patch.committee_name = next.committee_name;
  if (next.address !== original.address) patch.address = next.address;
  if (next.description !== original.description) patch.description = next.description;
  if (next.visarjan_days !== original.visarjan_days) patch.visarjan_days = next.visarjan_days;
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
  const updateEntry = useUpdateEntry(participantId);
  const saveNote = useSaveEntryNote(participantId);
  const regionsQuery = useRegions();

  const [form, setForm] = useState<EditableForm | null>(null);
  const [noteText, setNoteText] = useState<string>("");
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
    if (!noteText.trim()) return toast.info("Enter a note");
    saveNote.mutate(noteText, {
      onSuccess: () => {
        toast.success("Note saved");
        setNoteText("");
      },
      onError: (err) => toast.error(err instanceof Error ? err.message : "Could not save note"),
    });
  };

  const copyCode = () => {
    const code = entry?.entry_code || `PB-GC-2025-000125`;
    navigator.clipboard?.writeText(code).then(() => toast.success("Entry ID copied"));
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Header */}
      <PageHeader
        title={
          <div className="flex items-center gap-3">
            <span>Participant Details</span>
            <span className="rounded-md bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700 border border-blue-200">
              {STATUS_LABELS[entry?.status ?? "submitted"] ?? "Draft"}
            </span>
          </div>
        }
        breadcrumbs={[
          { label: "Dashboard", to: ROUTES.DASHBOARD },
          { label: "Competitions", to: ROUTES.COMPETITION },
          { label: "Ganesh Competition", to: ROUTES.COMPETITION },
          { label: "Participants", to: ROUTES.COMPETITION_PARTICIPANTS },
          { label: "Participant Details" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate({ to: ROUTES.COMPETITION_PARTICIPANTS })}>
              Cancel
            </Button>
            <Button
              className="bg-blue-600 font-bold hover:bg-blue-700 text-white"
              onClick={handleSave}
              disabled={!dirty || updateEntry.isPending}
            >
              <Save className="mr-1.5 h-4 w-4" />
              Save Changes
            </Button>
            {entry?.status !== "approved" && (
              <Button
                className="bg-emerald-600 font-bold hover:bg-emerald-700 text-white"
                onClick={handleApprove}
                disabled={reviewEntry.isPending}
              >
                <CheckCircle2 className="mr-1.5 h-4 w-4" />
                Approve
              </Button>
            )}
            {entry?.status !== "rejected" && (
              <Button
                className="bg-red-600 font-bold hover:bg-red-700 text-white"
                onClick={() => setRejectOpen(true)}
                disabled={reviewEntry.isPending}
              >
                <XCircle className="mr-1.5 h-4 w-4" />
                Reject
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  More Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={copyCode}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Entry ID
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="link"
              className="text-xs text-slate-600 ml-2 font-semibold"
              onClick={() => navigate({ to: ROUTES.COMPETITION_PARTICIPANTS })}
            >
              ← Back to Participants
            </Button>
          </div>
        }
      />

      {entryQuery.error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          Unable to load participant details from backend.
        </div>
      )}

      {current && (
        <div className="grid gap-5 lg:grid-cols-3">
          {/* ---- LEFT COLUMN (2 COLS) ---- */}
          <div className="space-y-5 lg:col-span-2">
            {/* Basic Information */}
            <SectionCard title="Basic Information">
              <div className="space-y-4">
                <div>
                  <Label className="text-xs font-bold text-slate-800">Established In *</Label>
                  <Select
                    value={current.established_year ? String(current.established_year) : "2023"}
                    onValueChange={(v) => setField("established_year", Number(v))}
                  >
                    <SelectTrigger className="mt-1 text-xs">
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
                  <Label className="text-xs font-bold text-slate-800">Committee / Organization Name *</Label>
                  <Input
                    className="mt-1 text-xs"
                    value={current.committee_name}
                    onChange={(e) => setField("committee_name", e.target.value)}
                  />
                </div>

                <div>
                  <Label className="text-xs font-bold text-slate-800">Location *</Label>
                  <div className="mt-1 grid gap-2 sm:grid-cols-3">
                    <div>
                      <span className="text-[10px] text-muted-foreground font-semibold">State *</span>
                      <Select
                        value={current.state_id ? String(current.state_id) : undefined}
                        onValueChange={(v) => setForm((f) => ({ ...(f ?? original!), state_id: Number(v), district_id: null, area_id: null }))}
                      >
                        <SelectTrigger className="mt-0.5 text-xs"><SelectValue placeholder="Maharashtra" /></SelectTrigger>
                        <SelectContent>
                          {states.map((s) => (
                            <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground font-semibold">District *</span>
                      <Select
                        value={current.district_id ? String(current.district_id) : undefined}
                        onValueChange={(v) => setForm((f) => ({ ...(f ?? original!), district_id: Number(v), area_id: null }))}
                      >
                        <SelectTrigger className="mt-0.5 text-xs"><SelectValue placeholder="Mumbai Suburban" /></SelectTrigger>
                        <SelectContent>
                          {districts.map((d) => (
                            <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground font-semibold">Area *</span>
                      <Select
                        value={current.area_id ? String(current.area_id) : undefined}
                        onValueChange={(v) => setField("area_id", Number(v))}
                      >
                        <SelectTrigger className="mt-0.5 text-xs"><SelectValue placeholder="Lalbaug, Mumbai" /></SelectTrigger>
                        <SelectContent>
                          {areas.map((a) => (
                            <SelectItem key={a.id} value={String(a.id)}>{a.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-bold text-slate-800">Address *</Label>
                  <div className="relative mt-1">
                    <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-red-500" />
                    <Input
                      className="pl-9 text-xs"
                      value={current.address}
                      onChange={(e) => setField("address", e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-bold text-slate-800">Description *</Label>
                  <Textarea
                    className="mt-1 text-xs leading-relaxed"
                    rows={4}
                    maxLength={500}
                    value={current.description}
                    onChange={(e) => setField("description", e.target.value)}
                  />
                  <p className="mt-1 text-right text-[11px] text-muted-foreground font-semibold">
                    {current.description.length}/500
                  </p>
                </div>
              </div>
            </SectionCard>

            {/* Visarjan Days Option Selector Card */}
            <SectionCard title="Visarjan Days *" description="Select the number of days for visarjan.">
              <div className="grid gap-3 sm:grid-cols-4 pt-1">
                {VISARJAN_OPTIONS.map((opt) => {
                  const selected = current.visarjan_days === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setField("visarjan_days", opt)}
                      className={`flex items-center justify-between rounded-lg border p-3 text-xs font-bold transition-all ${
                        selected
                          ? "border-red-500 bg-red-50/50 text-red-700 shadow-sm"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Calendar className={`h-4 w-4 ${selected ? "text-red-600" : "text-slate-400"}`} />
                        <span>{opt}</span>
                      </div>
                      <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${selected ? "border-red-600 bg-red-600" : "border-slate-300"}`}>
                        {selected && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </SectionCard>

            {/* Contact Details Card */}
            <SectionCard title="Contact Details">
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label className="text-xs font-bold text-slate-800">Full Name *</Label>
                    <Input
                      className="mt-1 text-xs"
                      value={current.contact_name}
                      onChange={(e) => setField("contact_name", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-bold text-slate-800">Mobile Number *</Label>
                    <Input
                      className="mt-1 text-xs"
                      value={current.contact_phone}
                      onChange={(e) => setField("contact_phone", e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-bold text-slate-800">Email Address *</Label>
                  <Input
                    className="mt-1 text-xs"
                    value={current.contact_email}
                    onChange={(e) => setField("contact_email", e.target.value)}
                  />
                </div>

                <div className="grid gap-3 border-t pt-4 text-xs sm:grid-cols-3">
                  <div className="flex items-start gap-2.5 rounded-lg border bg-slate-50 p-2.5">
                    <Calendar className="h-4 w-4 text-slate-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-muted-foreground font-semibold">Submitted On</p>
                      <p className="font-bold text-slate-800">14 Jul 2025, 11:45 AM</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 rounded-lg border bg-slate-50 p-2.5">
                    <User className="h-4 w-4 text-slate-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-muted-foreground font-semibold">Submitted By</p>
                      <p className="font-bold text-slate-800">Ravi Sharma (97654 32109)</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 rounded-lg border bg-slate-50 p-2.5">
                    <MapPin className="h-4 w-4 text-slate-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-muted-foreground font-semibold">User Location</p>
                      <p className="font-bold text-slate-800">Mumbai, Maharashtra</p>
                    </div>
                  </div>
                </div>
              </div>
            </SectionCard>
          </div>

          {/* ---- RIGHT COLUMN (1 COL) ---- */}
          <div className="space-y-5">
            {/* Cover Image Card */}
            <SectionCard title="Cover Image">
              <div className="relative overflow-hidden rounded-lg border bg-slate-900 shadow-md">
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute right-2 top-2 z-10 bg-black/60 font-bold text-white hover:bg-black/80 text-xs backdrop-blur-sm"
                  onClick={() => toast.info("Change photo clicked")}
                >
                  <Pencil className="mr-1.5 h-3.5 w-3.5" />
                  Change Photo
                </Button>

                {entry?.cover_photo_url ? (
                  <img src={entry.cover_photo_url} alt="Cover" className="w-full h-56 object-cover" />
                ) : (
                  <div className="flex h-56 items-center justify-center text-sm text-slate-400">
                    No Cover Photo
                  </div>
                )}
              </div>

              <div className="mt-2.5 flex items-center justify-between text-xs">
                <span className="text-[11px] text-muted-foreground font-semibold">JPG, PNG (Max. 5MB)</span>
                <Button variant="ghost" size="sm" className="h-7 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50">
                  <Trash2 className="mr-1 h-3.5 w-3.5" />
                  Delete Photo
                </Button>
              </div>
            </SectionCard>

            {/* Uploaded Photos Card */}
            <SectionCard
              title="Uploaded Photos (Max. 5)"
              action={
                <Button variant="outline" size="sm" className="text-xs font-bold text-blue-700 border-blue-200">
                  <Plus className="mr-1 h-3.5 w-3.5" />
                  Add Photos
                </Button>
              }
            >
              <div className="space-y-2">
                <div className="grid grid-cols-4 gap-2">
                  {(entry?.photo_urls && entry.photo_urls.length > 0
                    ? entry.photo_urls
                    : [1, 2, 3, 4]
                  ).map((urlOrNum, idx) => (
                    <div key={idx} className="relative aspect-square overflow-hidden rounded-md border bg-slate-100 shadow-sm group">
                      <button
                        type="button"
                        className="absolute right-1 top-1 z-10 h-5 w-5 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                        onClick={() => toast.info("Photo removed")}
                      >
                        <X className="h-3 w-3" />
                      </button>
                      {typeof urlOrNum === "string" ? (
                        <img src={urlOrNum} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-amber-800 to-amber-950 flex items-center justify-center text-[10px] text-amber-200 font-bold">
                          Img {idx + 1}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  You can upload up to 5 photos. Supported formats: JPG, PNG (Max. 5MB each)
                </p>
              </div>
            </SectionCard>

            {/* Application Status & Notes Card (2 columns in right section) */}
            <div className="grid gap-3 sm:grid-cols-2">
              <SectionCard title="Application Status">
                <div className="space-y-2">
                  <StatusBadge status="Draft" variant="blue" />
                  <p className="text-[11px] text-muted-foreground">
                    This entry is in draft status and is pending review.
                  </p>

                  <div className="pt-2 border-t">
                    <p className="text-[10px] font-bold text-slate-500">Entry ID</p>
                    <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-900 mt-0.5">
                      <span>{entry?.entry_code || "PB-GC-2025-000125"}</span>
                      <button type="button" onClick={copyCode} className="text-slate-500 hover:text-slate-900">
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </SectionCard>

              <SectionCard title="Notes (Admin Only)">
                <div className="space-y-2">
                  <Textarea
                    rows={2}
                    className="text-xs"
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Add notes about this participant..."
                  />
                  <Button size="sm" className="bg-red-600 hover:bg-red-700 font-bold text-xs h-7 w-full" onClick={handleSaveNote}>
                    Save Note
                  </Button>
                </div>
              </SectionCard>
            </div>

            {/* Activity Log Card */}
            <SectionCard title="Activity Log">
              <div className="space-y-3 text-xs pt-1">
                {entry?.activity && entry.activity.length > 0 ? (
                  entry.activity.map((act) => (
                    <div key={act.id} className="flex items-start gap-2.5">
                      <div className="h-2 w-2 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />
                      <div>
                        <p className="font-bold text-slate-800">{act.message}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {formatDate(act.created_at)} {act.actor_name ? `by ${act.actor_name}` : ""}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="flex items-start gap-2.5">
                      <div className="h-2 w-2 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />
                      <div>
                        <p className="font-bold text-slate-800">
                          Entry submitted by {entry?.submitted_by || entry?.contact?.name || entry?.name || "Participant"}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {formatDate(entry?.submitted_on)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <div className="h-2 w-2 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />
                      <div>
                        <p className="font-bold text-slate-800">
                          Status changed to {STATUS_LABELS[entry?.status ?? "submitted"] ?? "Draft"}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {formatDate(entry?.submitted_on)}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </SectionCard>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        title="Reject Participant Entry"
        description="Please specify the reason for rejecting this participant entry:"
        confirmLabel="Confirm Rejection"
        destructive
        onConfirm={handleReject}
      >
        <Textarea
          rows={3}
          className="mt-2 text-xs"
          placeholder="Reason for rejection..."
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
        />
      </ConfirmDialog>
    </div>
  );
}
