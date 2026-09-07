import { Outlet, createFileRoute, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownUp,
  ArrowUpDown,
  CheckCircle2,
  Download,
  ExternalLink,
  Eye,
  FileSpreadsheet,
  FileText,
  Filter,
  MoreVertical,
  RotateCcw,
  Search,
  Send,
  X,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { StatusBadge } from "@/components/common/StatusBadge";
import {
  useCompetitionEntries,
  useCompetitionStats,
  useDeleteEntry,
  useMarkEntryViewed,
  useReviewEntry,
} from "@/hooks/api/useCompetition";
import { competitionAdminService } from "@/services/competitionAdmin.service";
import { useRegions } from "@/hooks/api/useRegions";
import type { AdminEntryListItem } from "@/types/competitionAdmin";
import { ROUTES } from "@/constants/routes.constants";

export const Route = createFileRoute("/_app/competition/participants")({ component: ParticipantsPage });

const PAGE_SIZE = 10;

/** CSV line ending. Excel on Windows expects CRLF. */
const CRLF = String.fromCharCode(13, 10);
/**
 * UTF-8 byte order mark. Without it Excel reads the file as the local codepage
 * and every Devanagari name arrives as mojibake — which is most of this data.
 */
const BOM = String.fromCharCode(0xfeff);

const STATUS_VARIANTS: Record<string, "blue" | "green" | "rose"> = {
  submitted: "blue",
  draft: "blue",
  approved: "green",
  rejected: "rose",
};

const STATUS_LABELS: Record<string, string> = {
  submitted: "Draft",
  draft: "Draft",
  approved: "Approved",
  rejected: "Rejected",
};

/**
 * Row tint for an entry the participant edited since an admin last opened it.
 * Red for approved entries (their change is already live to the public, so it
 * is the urgent one) and blue for drafts, per the client's colour rule.
 */
function highlightClass(row: AdminEntryListItem): string {
  if (!row.is_unviewed) return "hover:bg-slate-50/80";
  return row.status === "approved"
    ? "bg-red-50/70 hover:bg-red-50 border-l-2 border-l-red-500"
    : "bg-blue-50/70 hover:bg-blue-50 border-l-2 border-l-blue-500";
}

function formatDate(dateStr: string | null | undefined): { date: string; time: string } {
  if (!dateStr) return { date: "—", time: "" };
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return { date: "—", time: "" };
  const date = d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const time = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
  return { date, time };
}

/**
 * The route component is a layout: on a child route it renders the detail page
 * instead of the list.
 *
 * The switch has to live in its own component. It used to be an early return
 * inside the list component itself, which meant the same component rendered two
 * hooks on a child route and twenty on the list — navigating from the list into
 * a participant changes the hook count between renders of one component, which
 * is exactly the "rendered more hooks than during the previous render" crash.
 */
function ParticipantsPage() {
  const { pathname } = useLocation();
  if (pathname !== ROUTES.COMPETITION_PARTICIPANTS) return <Outlet />;
  return <ParticipantsList />;
}

function ParticipantsList() {
  const navigate = useNavigate();
  const [selectedState, setSelectedState] = useState<string>("all");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("all");
  const [selectedArea, setSelectedArea] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"recent" | "oldest" | null>(null);
  /** Free-text search. Debounced into `search` so every keystroke is not a request. */
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<AdminEntryListItem | null>(null);
  const [reviewTarget, setReviewTarget] = useState<{ row: AdminEntryListItem; status: "approved" | "rejected" } | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  /** "Option to see all highlighted entries" — narrows the list to unviewed edits. */
  const [unviewedOnly, setUnviewedOnly] = useState(false);
  const [exporting, setExporting] = useState(false);

  const statsQuery = useCompetitionStats();
  const deleteEntry = useDeleteEntry();
  const reviewEntry = useReviewEntry();
  const markViewed = useMarkEntryViewed();
  const regionsQuery = useRegions();
  const states = regionsQuery.data ?? [];
  const districts = useMemo(
    () => (selectedState !== "all" ? states.find((s) => String(s.id) === selectedState)?.districts ?? [] : states.flatMap((s) => s.districts)),
    [states, selectedState],
  );
  const areas = useMemo(
    () => (selectedDistrict !== "all" ? districts.find((d) => String(d.id) === selectedDistrict)?.areas ?? [] : districts.flatMap((d) => d.areas)),
    [districts, selectedDistrict],
  );

  // 350ms after typing stops. The API searches name, committee, phone and code.
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const params = useMemo(
    () => ({
      page,
      per_page: PAGE_SIZE,
      search: search || undefined,
      state_id: selectedState !== "all" ? Number(selectedState) : undefined,
      district_id: selectedDistrict !== "all" ? Number(selectedDistrict) : undefined,
      area_id: selectedArea !== "all" ? Number(selectedArea) : undefined,
      unviewed: unviewedOnly || undefined,
    }),
    [page, search, selectedState, selectedDistrict, selectedArea, unviewedOnly],
  );

  const entriesQuery = useCompetitionEntries(params);
  const data = entriesQuery.data;
  const rawItems = data?.items ?? [];

  // Local sorting if requested
  const items = useMemo(() => {
    if (!sortOrder) return rawItems;
    const sorted = [...rawItems];
    return sorted.sort((a, b) => {
      const ta = new Date(a.updated_at || a.created_at).getTime();
      const tb = new Date(b.updated_at || b.created_at).getTime();
      return sortOrder === "recent" ? tb - ta : ta - tb;
    });
  }, [rawItems, sortOrder]);

  const totalEntries = data?.total ?? 0;
  const unviewedTotal = data?.unviewed_total ?? 0;
  const totalPages = Math.ceil(totalEntries / PAGE_SIZE) || 1;

  const handleReset = () => {
    setSelectedState("all");
    setSelectedDistrict("all");
    setSelectedArea("all");
    setSortOrder(null);
    setSearchInput("");
    setSearch("");
    setUnviewedOnly(false);
    setPage(1);
  };

  const handleReview = async () => {
    if (!reviewTarget) return;
    try {
      await reviewEntry.mutateAsync({
        id: reviewTarget.row.id,
        status: reviewTarget.status,
        reason: reviewTarget.status === "rejected" ? rejectReason.trim() || undefined : undefined,
      });
      toast.success(reviewTarget.status === "approved" ? "Participant approved" : "Participant rejected");
      setReviewTarget(null);
      setRejectReason("");
    } catch {
      toast.error("Unable to update this participant");
    }
  };

  const handlePublishAllDrafts = () => {
    toast.success("Publish request submitted for all draft entries");
  };

  /**
   * Exports every entry matching the current filters, not just the page on
   * screen — walks the pages rather than assuming one request returns the lot.
   *
   * Two formats: .xlsx for Excel (a real workbook, so Devanagari names and long
   * numbers survive without any import wizard) and .csv as the portable option.
   */
  const handleExport = async (format: "xlsx" | "csv") => {
    if (exporting) return;
    setExporting(true);
    const toastId = toast.loading("Preparing export…");
    try {
      // Must not exceed the API's per_page cap (100) or every request 422s and
      // the export fails before writing a single row.
      const EXPORT_PAGE_SIZE = 100;
      const all: AdminEntryListItem[] = [];
      for (let p = 1; ; p += 1) {
        const chunk = await competitionAdminService.entries({
          ...params,
          page: p,
          per_page: EXPORT_PAGE_SIZE,
        });
        all.push(...(chunk.items ?? []));
        if (!chunk.has_more || (chunk.items ?? []).length === 0) break;
        if (p > 100) break; // hard stop; 10k rows is far past a sane export
      }
      if (all.length === 0) {
        toast.error("Nothing to export for the current filters", { id: toastId });
        return;
      }

      const columns: { header: string; value: (r: AdminEntryListItem) => string | number }[] = [
        { header: "Entry Code", value: (r) => r.entry_code ?? "" },
        { header: "Pandal Name", value: (r) => r.name ?? "" },
        { header: "Committee / Mandal Name", value: (r) => r.committee_name ?? "" },
        { header: "Established Year", value: (r) => r.established_year ?? "" },
        { header: "Visarjan Days", value: (r) => r.visarjan_days ?? "" },
        { header: "State", value: (r) => r.state_name ?? "" },
        { header: "District", value: (r) => r.district_name ?? "" },
        { header: "Area", value: (r) => r.area_name ?? "" },
        { header: "Contact Name", value: (r) => r.contact_name ?? "" },
        { header: "Contact Phone", value: (r) => r.contact_phone ?? "" },
        { header: "Contact Email", value: (r) => r.contact_email ?? "" },
        { header: "Submitted By", value: (r) => r.submitted_by ?? "" },
        { header: "Submitted By Phone", value: (r) => r.submitted_by_phone ?? "" },
        { header: "User Votes", value: (r) => r.actual_votes ?? 0 },
        { header: "Banner 1 Vote", value: (r) => r.banner1_votes ?? 0 },
        { header: "Banner 2 Vote", value: (r) => r.banner2_votes ?? 0 },
        { header: "Total Votes", value: (r) => r.total_votes ?? 0 },
        { header: "Rank", value: (r) => r.rank ?? "" },
        { header: "Status", value: (r) => STATUS_LABELS[r.status] ?? r.status ?? "" },
        { header: "Needs Review", value: (r) => (r.needs_review ? "Yes" : "No") },
        { header: "Registration Date", value: (r) => (r.created_at ? new Date(r.created_at).toLocaleString("en-IN") : "") },
        { header: "Last Updated Date", value: (r) => (r.updated_at ? new Date(r.updated_at).toLocaleString("en-IN") : "") },
      ];

      const fileBase = `participants-${new Date().toISOString().slice(0, 10)}`;
      if (format === "xlsx") {
        // Loaded on demand: the sheet writer is a large dependency and most
        // visits to this page never export anything.
        const XLSX = await import("xlsx");
        const rows = all.map((row) => {
          const record: Record<string, string | number> = {};
          columns.forEach((c) => {
            record[c.header] = c.value(row);
          });
          return record;
        });
        const sheet = XLSX.utils.json_to_sheet(rows, { header: columns.map((c) => c.header) });
        sheet["!cols"] = columns.map((c) => ({ wch: Math.min(38, Math.max(12, c.header.length + 4)) }));
        const book = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(book, sheet, "Participants");
        XLSX.writeFile(book, `${fileBase}.xlsx`);
      } else {
        // Quote everything and double inner quotes: names and addresses contain
        // commas, and one unescaped quote shifts every later column.
        const escape = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`;
        const csv = [
          columns.map((c) => escape(c.header)).join(","),
          ...all.map((row) => columns.map((c) => escape(c.value(row))).join(",")),
        ].join(CRLF);

        const blob = new Blob([BOM + csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${fileBase}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }

      toast.success(`Exported ${all.length} participant${all.length === 1 ? "" : "s"}`, { id: toastId });
    } catch (error) {
      toast.error("Export failed. Please try again.", { id: toastId });
      // eslint-disable-next-line no-console
      console.error("[Participants] export failed", error);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-5 pb-10">
      {/* Top Header */}
      <PageHeader
        title={
          <div className="flex items-center gap-3">
            <span>Ganesh Competition</span>
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
              ONGOING
            </span>
          </div>
        }
        breadcrumbs={[
          { label: "Dashboard", to: ROUTES.DASHBOARD },
          { label: "Competitions", to: ROUTES.COMPETITION },
          { label: "Ganesh Competition", to: ROUTES.COMPETITION },
          { label: "Participants" },
        ]}
        actions={
          <Button
            className="bg-red-600 font-bold hover:bg-red-700 text-white"
            onClick={() => window.open("/competition", "_blank")}
          >
            View Public Page
            <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        }
      />

      {/* Top Filter Card */}
      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-5">
          <div className="sm:col-span-2">
            <label className="text-xs font-bold text-slate-700">Search Participants</label>
            <div className="relative mt-1">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Name, entry code, committee, contact name or phone"
                className="h-9 pl-8 pr-8 text-xs"
              />
              {searchInput && (
                <button
                  type="button"
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-slate-900"
                  onClick={() => setSearchInput("")}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700">Select State</label>
            <Select value={selectedState} onValueChange={(v) => { setSelectedState(v); setSelectedDistrict("all"); setSelectedArea("all"); }}>
              <SelectTrigger className="mt-1 text-xs"><SelectValue placeholder="Select State" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All States</SelectItem>
                {states.map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700">Select District</label>
            <Select value={selectedDistrict} onValueChange={(v) => { setSelectedDistrict(v); setSelectedArea("all"); }}>
              <SelectTrigger className="mt-1 text-xs"><SelectValue placeholder="Select District" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Districts</SelectItem>
                {districts.map((d) => (
                  <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700">Select Area</label>
            <Select value={selectedArea} onValueChange={setSelectedArea}>
              <SelectTrigger className="mt-1 text-xs"><SelectValue placeholder="Select Area" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Areas</SelectItem>
                {areas.map((a) => (
                  <SelectItem key={a.id} value={String(a.id)}>{a.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end gap-2 sm:col-span-5">
            <Button className="bg-red-600 font-bold hover:bg-red-700 text-xs px-5" onClick={() => setPage(1)}>
              <Filter className="mr-1.5 h-3.5 w-3.5" />
              Apply Filter
            </Button>
            <Button variant="outline" className="text-xs" onClick={handleReset}>
              <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
              Reset
            </Button>
          </div>
        </div>
      </div>

      {/* Participants List Main Table Card */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        {/* Table Header Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b p-4">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">Participants List</h2>
            <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-700 border border-blue-200">
              {totalEntries} Total Entries
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Jumps straight to entries a participant changed since anyone last
                looked at them — the "see all highlighted entries" option. */}
            <Button
              variant={unviewedOnly ? "default" : "outline"}
              size="sm"
              className={`text-xs font-bold ${unviewedOnly ? "bg-amber-500 hover:bg-amber-600 text-white" : "border-amber-300 text-amber-700 hover:bg-amber-50"}`}
              onClick={() => {
                setUnviewedOnly((v) => !v);
                setPage(1);
              }}
            >
              <Eye className="mr-1.5 h-3.5 w-3.5" />
              {unviewedOnly ? "Showing Updated Only" : "Updated Entries"}
              {unviewedTotal > 0 && (
                <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] ${unviewedOnly ? "bg-white/25" : "bg-amber-100"}`}>
                  {unviewedTotal}
                </span>
              )}
            </Button>

            <div className="text-right">
              <Button
                variant="outline"
                size="sm"
                className="border-blue-300 font-bold text-blue-700 hover:bg-blue-50"
                onClick={handlePublishAllDrafts}
              >
                <Send className="mr-1.5 h-3.5 w-3.5" />
                Publish All Draft Entries
              </Button>
              <p className="text-[10px] text-muted-foreground">All draft entries will be published</p>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="text-xs" disabled={exporting}>
                  <Download className="mr-1.5 h-3.5 w-3.5" />
                  {exporting ? "Exporting…" : "Export"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="text-xs">
                <DropdownMenuItem onClick={() => handleExport("xlsx")}>
                  <FileSpreadsheet className="mr-2 h-3.5 w-3.5 text-emerald-600" />
                  Export as Excel (.xlsx)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("csv")}>
                  <FileText className="mr-2 h-3.5 w-3.5 text-slate-600" />
                  Export as CSV
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {unviewedTotal > 0 && !unviewedOnly && (
          <div className="flex items-center gap-2 border-b bg-amber-50/60 px-4 py-2 text-[11px] text-amber-900">
            <span className="inline-block h-2 w-2 rounded-full bg-red-500" />
            Approved entry edited
            <span className="ml-3 inline-block h-2 w-2 rounded-full bg-blue-500" />
            Draft entry edited
            <span className="ml-auto font-semibold">{unviewedTotal} entr{unviewedTotal === 1 ? "y" : "ies"} updated since last viewed</span>
          </div>
        )}

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b bg-slate-50 text-[11px] font-bold text-slate-700">
                <th className="py-3 px-3 w-10 text-center">#</th>
                <th className="py-3 px-3">Entry Code</th>
                <th className="py-3 px-3">Cover Image</th>
                <th className="py-3 px-3">
                  <div>Name</div>
                  <div className="text-[10px] font-normal text-muted-foreground">Area</div>
                </th>
                <th className="py-3 px-3">Committee Name</th>
                <th className="py-3 px-3">Visarjan Days</th>
                <th className="py-3 px-3">
                  <div>Person Name</div>
                  <div className="text-[10px] font-normal text-muted-foreground">Contact Number</div>
                </th>
                <th className="py-3 px-3">
                  <div>Uploaded By</div>
                  <div className="text-[10px] font-normal text-muted-foreground">User Name / Contact Number</div>
                </th>
                <th className="py-3 px-3">User Location</th>
                <th className="py-3 px-3">Registered On</th>
                <th className="py-3 px-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center gap-1 hover:text-slate-900 font-bold">
                        <span>Last Updated On</span>
                        <ArrowUpDown className="h-3 w-3 text-red-600" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="text-xs">
                      <DropdownMenuItem onClick={() => setSortOrder("recent")}>
                        <ArrowUpDown className="mr-2 h-3.5 w-3.5 text-red-600" />
                        Sort Recent First
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortOrder("oldest")}>
                        <ArrowDownUp className="mr-2 h-3.5 w-3.5 text-red-600" />
                        Sort Oldest First
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortOrder(null)}>
                        <RotateCcw className="mr-2 h-3.5 w-3.5" />
                        Clear Sorting
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {entriesQuery.isLoading ? (
                <tr>
                  <td colSpan={12} className="py-8 text-center text-muted-foreground">
                    Loading participants…
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-8 text-center text-muted-foreground">
                    {unviewedOnly ? "No entries have been updated since they were last viewed." : "No participants found."}
                  </td>
                </tr>
              ) : (
                items.map((row, idx) => {
                  const reg = formatDate(row.created_at);
                  const upd = formatDate(row.updated_at || row.created_at);
                  const statusKey = row.status === "submitted" ? "draft" : row.status;
                  const rowNum = (page - 1) * PAGE_SIZE + idx + 1;

                  return (
                    <tr key={row.id} className={`${highlightClass(row)} transition-colors`}>
                      <td className="py-3 px-3 text-center font-bold text-slate-700">{rowNum}</td>
                      <td className="py-3 px-3">
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] font-bold text-slate-700">
                          {row.entry_code || "—"}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        {row.cover_photo_url ? (
                          <img src={row.cover_photo_url} alt="" className="h-10 w-16 rounded border object-cover shadow-sm" />
                        ) : (
                          <div className="h-10 w-16 rounded border bg-amber-950/20 flex items-center justify-center text-[10px] text-amber-700 font-semibold">
                            Photo
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <p className="font-bold text-slate-900">{row.name}</p>
                          {row.is_unviewed && (
                            <span
                              title="Updated since it was last viewed"
                              className={`inline-block h-2 w-2 shrink-0 rounded-full ${row.status === "approved" ? "bg-red-500" : "bg-blue-500"}`}
                            />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500">{[row.area_name, row.district_name].filter(Boolean).join(", ") || "—"}</p>
                      </td>
                      <td className="py-3 px-3 text-slate-700">{row.committee_name || "—"}</td>
                      <td className="py-3 px-3 text-slate-700">{row.visarjan_days || "—"}</td>
                      <td className="py-3 px-3">
                        <p className="font-bold text-slate-900">{row.contact_name || "—"}</p>
                        <p className="text-[11px] text-slate-500 font-mono">{row.contact_phone || "—"}</p>
                      </td>
                      <td className="py-3 px-3">
                        <p className="font-bold text-slate-900">{row.submitted_by || "—"}</p>
                        <p className="text-[11px] text-slate-500 font-mono">{row.submitted_by_phone || "—"}</p>
                      </td>
                      <td className="py-3 px-3 text-slate-700">
                        {[row.area_name, row.district_name, row.state_name].filter(Boolean).join(", ") || "—"}
                      </td>
                      <td className="py-3 px-3">
                        <p className="font-semibold text-slate-800">{reg.date}</p>
                        <p className="text-[10px] text-muted-foreground">{reg.time}</p>
                      </td>
                      <td className="py-3 px-3">
                        <p className="font-semibold text-slate-800">{upd.date}</p>
                        <p className="text-[10px] text-muted-foreground">{upd.time}</p>
                      </td>
                      <td className="py-3 px-3">
                        <StatusBadge
                          status={STATUS_LABELS[statusKey] ?? statusKey}
                          variant={STATUS_VARIANTS[statusKey] ?? "blue"}
                        />
                        {row.needs_review && (
                          <p className="mt-1 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">
                            Needs Review
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="text-xs">
                            <DropdownMenuItem onClick={() => navigate({ to: "/competition/participants/$participantId", params: { participantId: String(row.id) } })}>
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate({ to: "/competition/participants/$participantId", params: { participantId: String(row.id) } })}>
                              Edit Participant
                            </DropdownMenuItem>
                            {row.status !== "approved" && (
                              <DropdownMenuItem
                                className="text-emerald-700"
                                onClick={() => setReviewTarget({ row, status: "approved" })}
                              >
                                <CheckCircle2 className="mr-2 h-3.5 w-3.5" />
                                Approve
                              </DropdownMenuItem>
                            )}
                            {row.status !== "rejected" && (
                              <DropdownMenuItem
                                className="text-rose-700"
                                onClick={() => {
                                  setRejectReason("");
                                  setReviewTarget({ row, status: "rejected" });
                                }}
                              >
                                <XCircle className="mr-2 h-3.5 w-3.5" />
                                Reject
                              </DropdownMenuItem>
                            )}
                            {row.is_unviewed && (
                              <DropdownMenuItem
                                onClick={async () => {
                                  try {
                                    await markViewed.mutateAsync(row.id);
                                  } catch {
                                    toast.error("Unable to clear the highlight");
                                  }
                                }}
                              >
                                <Eye className="mr-2 h-3.5 w-3.5" />
                                Mark as Viewed
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem className="text-red-600" onClick={() => setDeleteTarget(row)}>
                              Delete Participant
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between border-t p-3 text-xs bg-slate-50">
          <p className="text-muted-foreground">
            Showing {(page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, totalEntries)} of {totalEntries} entries
          </p>

          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" className="h-7 w-7 p-0" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              ‹
            </Button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((p) => (
              <Button
                key={p}
                variant={page === p ? "default" : "outline"}
                size="sm"
                className={`h-7 w-7 p-0 text-xs font-bold ${page === p ? "bg-red-600 hover:bg-red-700 text-white" : ""}`}
                onClick={() => setPage(p)}
              >
                {p}
              </Button>
            ))}
            {totalPages > 5 && <span className="px-1 text-muted-foreground">…</span>}
            {totalPages > 5 && (
              <Button
                variant={page === totalPages ? "default" : "outline"}
                size="sm"
                className={`h-7 w-7 p-0 text-xs font-bold ${page === totalPages ? "bg-red-600 hover:bg-red-700 text-white" : ""}`}
                onClick={() => setPage(totalPages)}
              >
                {totalPages}
              </Button>
            )}
            <Button variant="outline" size="sm" className="h-7 w-7 p-0" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              ›
            </Button>
          </div>
        </div>
      </div>

      {/* Approve / reject straight from the list. Rejection asks for a reason
          because the participant is shown it in the app. */}
      <ConfirmDialog
        open={Boolean(reviewTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setReviewTarget(null);
            setRejectReason("");
          }
        }}
        title={reviewTarget?.status === "approved" ? "Approve Participant?" : "Reject Participant?"}
        description={
          reviewTarget?.status === "approved"
            ? `"${reviewTarget?.row.name}" will be published and can start collecting votes.`
            : `"${reviewTarget?.row.name}" will be rejected and removed from the public list.`
        }
        confirmLabel={reviewEntry.isPending ? "Saving…" : reviewTarget?.status === "approved" ? "Approve" : "Reject"}
        destructive={reviewTarget?.status === "rejected"}
        onConfirm={handleReview}
      >
        {reviewTarget?.status === "rejected" && (
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Reason for rejection</label>
            <Input
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Shown to the participant in the app"
              className="text-xs"
            />
          </div>
        )}
      </ConfirmDialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Participant?"
        description={`This will permanently delete the participant "${deleteTarget?.name}".`}
        confirmLabel={deleteEntry.isPending ? "Deleting..." : "Delete"}
        destructive
        onConfirm={async () => {
          if (!deleteTarget) return;
          try {
            await deleteEntry.mutateAsync(deleteTarget.id);
            toast.success("Participant deleted");
            setDeleteTarget(null);
          } catch (err) {
            toast.error("Unable to delete participant");
          }
        }}
      />
    </div>
  );
}
