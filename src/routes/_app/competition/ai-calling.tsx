import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import {
  FileSpreadsheet,
  MessageCircle,
  Phone,
  PhoneCall,
  PhoneOutgoing,
  Upload,
  UserCheck,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { PageHeader } from "@/components/common/PageHeader";
import { StatsGrid } from "@/components/admin/StatsGrid";
import { SectionCard } from "@/components/admin/SectionCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { DataTable, type Column } from "@/components/tables/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  useCallContact,
  useCampaignContacts,
  useCampaignSettings,
  useCampaignStats,
  useCampaignUploads,
  useStartCampaign,
  useUpdateCampaignSettings,
  useUploadContacts,
} from "@/hooks/api/useCompetition";
import type { CampaignContact, CampaignContactInput, CampaignSettings } from "@/types/competitionAdmin";
import { ROUTES } from "@/constants/routes.constants";

export const Route = createFileRoute("/_app/competition/ai-calling")({ component: AiCallingPage });

const PAGE_SIZE = 10;

const CALL_STATUS_LABELS: Record<string, string> = {
  not_started: "Not Started",
  queued: "Queued",
  calling: "Calling",
  in_conversation: "In Conversation",
  completed: "Completed",
  no_answer: "No Answer",
  call_failed: "Call Failed",
};

const WHATSAPP_LABELS: Record<string, string> = {
  not_sent: "Not Sent",
  sent: "Sent",
  delivered: "Delivered",
  read: "Read",
  in_progress: "Conversation In Progress",
  manual_required: "Manual Interaction Required",
  failed: "Failed",
};

const PARTICIPATION_LABELS: Record<string, string> = {
  not_started: "Not Started",
  in_progress: "In Progress",
  form_started: "Form Started",
  form_filled: "Form Filled",
  completed: "Completed",
  registered: "Registered",
};

/** Reads mandal contacts out of the first sheet of an .xlsx/.xls/.csv file. */
function parseContactsFile(buffer: ArrayBuffer): CampaignContactInput[] {
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });

  const pick = (row: Record<string, unknown>, ...names: string[]) => {
    const keys = Object.keys(row);
    for (const name of names) {
      const key = keys.find((k) => k.toLowerCase().replace(/[^a-z]/g, "").includes(name));
      if (key && row[key] != null && String(row[key]).trim() !== "") return String(row[key]).trim();
    }
    return "";
  };

  return rows
    .map((row) => ({
      mandal_name: pick(row, "mandalname", "mandal", "name"),
      contact_person: pick(row, "contactperson", "person", "contactname"),
      phone: pick(row, "mobilenumber", "mobile", "phone", "number").replace(/[^\d+]/g, ""),
      position: pick(row, "position", "designation"),
      address: pick(row, "address"),
      area: pick(row, "area", "city"),
      district: pick(row, "district"),
      state: pick(row, "state"),
    }))
    .filter((row) => row.mandal_name && row.phone);
}

function AiCallingPage() {
  const statsQuery = useCampaignStats();
  const settingsQuery = useCampaignSettings();
  const uploadsQuery = useCampaignUploads();
  const updateSettings = useUpdateCampaignSettings();
  const uploadContacts = useUploadContacts();
  const startCampaign = useStartCampaign();
  const callContact = useCallContact();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [callStatus, setCallStatus] = useState("");
  const [form, setForm] = useState<Partial<CampaignSettings> | null>(null);

  const settings = useMemo(
    () => ({ ...(settingsQuery.data ?? {}), ...(form ?? {}) }) as Partial<CampaignSettings>,
    [settingsQuery.data, form],
  );

  const contactsQuery = useCampaignContacts({
    page,
    per_page: PAGE_SIZE,
    search: search || undefined,
    call_status: callStatus || undefined,
  });
  const stats = statsQuery.data;
  const contacts = contactsQuery.data;

  const setField = <K extends keyof CampaignSettings>(key: K, value: CampaignSettings[K]) =>
    setForm((f) => ({ ...(f ?? {}), [key]: value }));

  const handleSaveSettings = () => {
    if (!form) return toast.info("No changes to save");
    updateSettings.mutate(form, {
      onSuccess: () => {
        toast.success("Campaign settings saved");
        setForm(null);
      },
      onError: (err) => toast.error(err instanceof Error ? err.message : "Save failed"),
    });
  };

  const handleFile = async (file: File) => {
    try {
      const contactsParsed = parseContactsFile(await file.arrayBuffer());
      if (contactsParsed.length === 0) {
        toast.error("No valid rows found. Ensure the sheet has Mandal Name and Mobile Number columns.");
        return;
      }
      uploadContacts.mutate(
        { fileName: file.name, contacts: contactsParsed },
        {
          onSuccess: (res) => toast.success(`Uploaded ${res.inserted} contacts from ${file.name}`),
          onError: (err) => toast.error(err instanceof Error ? err.message : "Upload failed"),
        },
      );
    } catch {
      toast.error("Could not read the file. Upload a valid .xlsx, .xls or .csv file.");
    }
  };

  const columns: Column<CampaignContact>[] = [
    {
      key: "mandal",
      header: "Mandal Name",
      cell: (r) => (
        <div>
          <p className="font-medium">{r.mandal_name}</p>
          <p className="text-xs text-muted-foreground">{[r.area, r.district].filter(Boolean).join(", ")}</p>
        </div>
      ),
    },
    {
      key: "contact",
      header: "Contact Person",
      cell: (r) => (
        <div>
          <p>{r.contact_person || "—"}</p>
          <p className="text-xs text-muted-foreground">{r.position}</p>
        </div>
      ),
    },
    { key: "phone", header: "Contact Number", cell: (r) => `+91 ${r.phone}` },
    {
      key: "call",
      header: "AI Call Status",
      cell: (r) => (
        <div>
          <StatusBadge status={CALL_STATUS_LABELS[r.call_status] ?? r.call_status} />
          {r.call_outcome && <p className="mt-1 text-xs capitalize text-muted-foreground">{r.call_outcome.replace(/_/g, " ")}</p>}
          {r.call_attempts > 0 && <p className="text-xs text-muted-foreground">{r.call_attempts} attempt(s)</p>}
        </div>
      ),
    },
    {
      key: "whatsapp",
      header: "WhatsApp Status",
      cell: (r) => <StatusBadge status={WHATSAPP_LABELS[r.whatsapp_status] ?? r.whatsapp_status} />,
    },
    {
      key: "participation",
      header: "Participation",
      cell: (r) => <StatusBadge status={PARTICIPATION_LABELS[r.participation_status] ?? r.participation_status} />,
    },
    {
      key: "actions",
      header: "Actions",
      cell: (r) => (
        <Button
          size="sm"
          variant="outline"
          disabled={callContact.isPending || r.call_status === "calling" || r.call_status === "in_conversation"}
          onClick={() =>
            callContact.mutate(r.id, {
              onSuccess: () => toast.success(`Calling ${r.mandal_name}…`),
              onError: (err) => toast.error(err instanceof Error ? err.message : "Call failed to start"),
            })
          }
        >
          <PhoneOutgoing className="mr-1 h-3.5 w-3.5" />
          Call
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="AI Calling Campaign"
        breadcrumbs={[
          { label: "Dashboard", to: ROUTES.DASHBOARD },
          { label: "Competition", to: ROUTES.COMPETITION },
          { label: "AI Calling Campaign" },
        ]}
        actions={
          <Button
            disabled={startCampaign.isPending}
            onClick={() =>
              startCampaign.mutate(undefined, {
                onSuccess: (res) => toast.success(`Campaign started — ${res.queued} call(s) queued`),
                onError: (err) => toast.error(err instanceof Error ? err.message : "Could not start campaign"),
              })
            }
          >
            <PhoneCall className="mr-2 h-4 w-4" />
            {startCampaign.isPending ? "Starting…" : "Start AI Calling Campaign"}
          </Button>
        }
      />

      <StatsGrid
        items={[
          { title: "Total Contacts", value: stats?.total_contacts ?? 0, subtitle: "From uploaded files", icon: Users, variant: "blue" },
          { title: "Calls Initiated", value: stats?.calls_initiated ?? 0, icon: Phone, variant: "violet" },
          { title: "Calls Completed", value: stats?.calls_completed ?? 0, subtitle: `${stats?.in_conversation ?? 0} in conversation`, icon: PhoneCall, variant: "green" },
          { title: "WhatsApp Sent", value: stats?.whatsapp_sent ?? 0, icon: MessageCircle, variant: "amber" },
          { title: "Registered", value: stats?.registered ?? 0, subtitle: `${stats?.forms_completed ?? 0} forms completed`, icon: UserCheck, variant: "rose" },
        ]}
      />

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <SectionCard
          title="AI Calling Configuration"
          description="Set how the Bolna AI agent talks to mandals. The agent itself is configured on the Bolna dashboard."
          action={
            <div className="flex items-center gap-2">
              <Label htmlFor="campaign-active" className="text-xs text-muted-foreground">Active</Label>
              <Switch
                id="campaign-active"
                checked={Boolean(settings.is_active)}
                onCheckedChange={(v) => setField("is_active", v)}
              />
            </div>
          }
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label>Bolna Agent ID</Label>
              <Input
                className="mt-1"
                placeholder="Paste the agent id from the Bolna dashboard"
                value={settings.bolna_agent_id ?? ""}
                onChange={(e) => setField("bolna_agent_id", e.target.value)}
              />
            </div>
            <div>
              <Label>AI Voice</Label>
              <Input className="mt-1" value={settings.voice_label ?? ""} onChange={(e) => setField("voice_label", e.target.value)} />
            </div>
            <div>
              <Label>Language</Label>
              <Input className="mt-1" placeholder="hi" value={settings.language ?? ""} onChange={(e) => setField("language", e.target.value)} />
            </div>
            <div>
              <Label>Calling Time (start)</Label>
              <Input className="mt-1" type="time" value={settings.calling_start_time ?? "10:00"} onChange={(e) => setField("calling_start_time", e.target.value)} />
            </div>
            <div>
              <Label>Calling Time (end)</Label>
              <Input className="mt-1" type="time" value={settings.calling_end_time ?? "20:00"} onChange={(e) => setField("calling_end_time", e.target.value)} />
            </div>
            <div>
              <Label>Call Retry Attempts</Label>
              <Input
                className="mt-1"
                type="number"
                min={1}
                max={10}
                value={settings.retry_attempts ?? 3}
                onChange={(e) => setField("retry_attempts", Number(e.target.value))}
              />
            </div>
            <div>
              <Label>Delay Between Calls (seconds)</Label>
              <Input
                className="mt-1"
                type="number"
                min={0}
                max={3600}
                value={settings.retry_delay_seconds ?? 30}
                onChange={(e) => setField("retry_delay_seconds", Number(e.target.value))}
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Registration Link (sent on WhatsApp)</Label>
              <Input
                className="mt-1"
                placeholder="https://..."
                value={settings.registration_link ?? ""}
                onChange={(e) => setField("registration_link", e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Campaign Details & Description</Label>
              <Textarea
                className="mt-1"
                rows={5}
                placeholder="Competition highlights the AI agent should mention…"
                value={settings.campaign_description ?? ""}
                onChange={(e) => setField("campaign_description", e.target.value)}
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={handleSaveSettings} disabled={updateSettings.isPending || !form}>
              {updateSettings.isPending ? "Saving…" : "Save Configuration"}
            </Button>
          </div>
        </SectionCard>

        <div className="space-y-4">
          <SectionCard
            title="Upload Contact List"
            description="Excel (.xlsx/.xls) or CSV with columns: Mandal Name, Contact Person Name, Mobile Number, Position, Address, Area, District, State."
          >
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
            >
              <Upload className="h-8 w-8" />
              {uploadContacts.isPending ? "Uploading…" : "Click to choose an Excel file"}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleFile(file);
                e.target.value = "";
              }}
            />
          </SectionCard>

          <SectionCard title="Campaign History" description="All uploaded files.">
            {(uploadsQuery.data?.length ?? 0) === 0 ? (
              <p className="text-sm text-muted-foreground">No files uploaded yet.</p>
            ) : (
              <ul className="space-y-2">
                {uploadsQuery.data?.map((upload) => (
                  <li key={upload.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                    <span className="flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                      {upload.file_name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {upload.total_contacts} contacts · {new Date(upload.created_at).toLocaleDateString("en-IN")}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </div>
      </div>

      <SectionCard title="Contact List" description="AI calling, WhatsApp and registration status per contact. Refreshes automatically.">
        <div className="mb-4 flex flex-wrap gap-2">
          <Input
            className="max-w-xs"
            placeholder="Search by mandal, person or number…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
          <select
            className="h-9 rounded-md border bg-transparent px-3 text-sm"
            value={callStatus}
            onChange={(e) => {
              setCallStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All AI Call Status</option>
            {Object.entries(CALL_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        <DataTable
          columns={columns}
          data={contacts?.items ?? []}
          rowKey={(r) => String(r.id)}
          loading={contactsQuery.isLoading}
          page={page}
          pageSize={PAGE_SIZE}
          total={contacts?.total ?? 0}
          onPageChange={setPage}
          serverPaged
        />
      </SectionCard>
    </div>
  );
}
