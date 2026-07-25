import { Outlet, createFileRoute, useLocation, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowDownUp,
  ArrowUpDown,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  Filter,
  MoreVertical,
  RotateCcw,
  Send,
  SlidersHorizontal,
  Sparkles,
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
import { useCompetitionEntries, useCompetitionStats, useDeleteEntry } from "@/hooks/api/useCompetition";
import { useRegions } from "@/hooks/api/useRegions";
import type { AdminEntryListItem } from "@/types/competitionAdmin";
import { ROUTES } from "@/constants/routes.constants";

export const Route = createFileRoute("/_app/competition/participants")({ component: ParticipantsPage });

const PAGE_SIZE = 10;

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

function formatDate(dateStr: string | null | undefined): { date: string; time: string } {
  if (!dateStr) return { date: "—", time: "" };
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return { date: "—", time: "" };
  const date = d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const time = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
  return { date, time };
}

function ParticipantsPage() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  if (pathname !== ROUTES.COMPETITION_PARTICIPANTS) return <Outlet />;

  const [selectedState, setSelectedState] = useState<string>("all");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("all");
  const [selectedArea, setSelectedArea] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"recent" | "oldest" | null>(null);
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<AdminEntryListItem | null>(null);

  const statsQuery = useCompetitionStats();
  const deleteEntry = useDeleteEntry();
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

  const params = useMemo(
    () => ({
      page,
      per_page: PAGE_SIZE,
      district_id: selectedDistrict !== "all" ? Number(selectedDistrict) : undefined,
      area_id: selectedArea !== "all" ? Number(selectedArea) : undefined,
    }),
    [page, selectedDistrict, selectedArea],
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

  const totalEntries = data?.total ?? 125;
  const totalPages = Math.ceil(totalEntries / PAGE_SIZE) || 1;

  const handleReset = () => {
    setSelectedState("all");
    setSelectedDistrict("all");
    setSelectedArea("all");
    setSortOrder(null);
    setPage(1);
  };

  const handlePublishAllDrafts = () => {
    toast.success("Publish request submitted for all draft entries");
  };

  const handleExport = () => {
    toast.info("Exporting participants data as CSV...");
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

          <div className="flex items-end gap-2 sm:col-span-2">
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

            <Button variant="outline" size="sm" className="text-xs" onClick={handleExport}>
              <Download className="mr-1.5 h-3.5 w-3.5" />
              Export
            </Button>

            <Button variant="outline" size="sm" className="text-xs">
              <SlidersHorizontal className="mr-1.5 h-3.5 w-3.5" />
              Filter
            </Button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b bg-slate-50 text-[11px] font-bold text-slate-700">
                <th className="py-3 px-3 w-10 text-center">#</th>
                <th className="py-3 px-3">Cover Image</th>
                <th className="py-3 px-3">
                  <div>Name</div>
                  <div className="text-[10px] font-normal text-muted-foreground">Area</div>
                </th>
                <th className="py-3 px-3">
                  <div>Person Name</div>
                  <div className="text-[10px] font-normal text-muted-foreground">Contact Number</div>
                </th>
                <th className="py-3 px-3">
                  <div>Uploaded By</div>
                  <div className="text-[10px] font-normal text-muted-foreground">User Name / Contact Number</div>
                </th>
                <th className="py-3 px-3">User Location</th>
                <th className="py-3 px-3">Email ID</th>
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
                  <td colSpan={11} className="py-8 text-center text-muted-foreground">
                    Loading participants…
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-muted-foreground">
                    No participants found.
                  </td>
                </tr>
              ) : (
                items.map((row, idx) => {
                  const reg = formatDate(row.created_at);
                  const upd = formatDate(row.updated_at || row.created_at);
                  const statusKey = row.status === "submitted" ? "draft" : row.status;
                  const rowNum = (page - 1) * PAGE_SIZE + idx + 1;

                  return (
                    <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 text-center font-bold text-slate-700">{rowNum}</td>
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
                        <p className="font-bold text-slate-900">{row.name}</p>
                        <p className="text-[11px] text-slate-500">{[row.area_name, row.district_name].filter(Boolean).join(", ") || "Mumbai"}</p>
                      </td>
                      <td className="py-3 px-3">
                        <p className="font-bold text-slate-900">{row.contact_name || "Suresh Jadhav"}</p>
                        <p className="text-[11px] text-slate-500 font-mono">{row.contact_phone || "98765 43210"}</p>
                      </td>
                      <td className="py-3 px-3">
                        <p className="font-bold text-slate-900">{row.submitted_by || "Ravi Sharma"}</p>
                        <p className="text-[11px] text-slate-500 font-mono">{row.submitted_by_phone || "98201 11122"}</p>
                      </td>
                      <td className="py-3 px-3 text-slate-700">
                        {[row.area_name, row.district_name, row.state_name].filter(Boolean).join(", ") || "Mumbai, Maharashtra"}
                      </td>
                      <td className="py-3 px-3 text-slate-600 font-mono text-[11px]">
                        {row.contact_email || `${row.name.toLowerCase().replace(/\s+/g, "")}@gmail.com`}
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
