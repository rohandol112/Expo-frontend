import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Bot,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  Filter,
  HelpCircle,
  Image as ImageIcon,
  Info,
  MinusSquare,
  MoreVertical,
  RotateCw,
  Send,
  UserCheck,
  X,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  useAiReviewBanner,
  useAiReviewPending,
  useCompetitionBanners,
  useCompetitionConfig,
  useReviewBanner,
} from "@/hooks/api/useCompetition";
import { useUsers } from "@/hooks/api/useUsers";
import { useRegions } from "@/hooks/api/useRegions";
import type { BannerListParams } from "@/services/competitionAdmin.service";
import type { AdminBannerListItem } from "@/types/competitionAdmin";
import { ROUTES } from "@/constants/routes.constants";
import { cn } from "@/lib/utils";
import {
  AI_LABELS,
  AiResultBadge,
  BANNER_STATUS_LABELS,
  BannerThumb,
  ConfidenceBar,
  PriorityBadge,
  QueueStatCard,
  SlotBadge,
  TableFooter,
  bannerCode,
  bannerExportRow,
  exportRowsToExcel,
  formatDateTime,
  getPriority,
  getWaiting,
} from "@/components/competition/bannerReview";

export const Route = createFileRoute("/_app/competition/banner-review")({
  component: BannerReviewPage,
});

type TabType = "overview" | "ai-queue" | "manual-queue" | "reviewed";

const BREADCRUMBS = [
  { label: "Dashboard", to: ROUTES.DASHBOARD },
  { label: "Competition", to: ROUTES.COMPETITION },
  { label: "Banner Review" },
];

/** Common per-screen filter state driving the server-side banner query. */
interface QueueFilters {
  areaId?: number;
  slot?: number;
  priority?: "high" | "medium" | "low";
  dateFrom?: string;
  dateTo?: string;
  reason?: string;
}

const REASON_OPTIONS = [
  "Text clarity",
  "Text overlapping",
  "Quality",
  "Background",
  "Phone number",
  "Contrast",
  "Duplicate",
];

function useAreaOptions() {
  const regionsQuery = useRegions();
  return useMemo(
    () =>
      (regionsQuery.data ?? [])
        .flatMap((s) => s.districts)
        .flatMap((d) => d.areas.map((a) => ({ label: a.name, value: String(a.id) }))),
    [regionsQuery.data],
  );
}

function FilterSelect({
  value,
  placeholder,
  options,
  onChange,
  width = "w-[150px]",
}: {
  value: string;
  placeholder: string;
  options: { label: string; value: string }[];
  onChange: (v: string) => void;
  width?: string;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={cn("h-9 text-xs", width)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{placeholder}</SelectItem>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function DateRangeInputs({
  from,
  to,
  onFrom,
  onTo,
}: {
  from: string;
  to: string;
  onFrom: (v: string) => void;
  onTo: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="relative">
        <Calendar className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input type="date" value={from} max={to || undefined} onChange={(e) => onFrom(e.target.value)} className="h-9 w-[145px] pl-8 text-xs" aria-label="From date" />
      </div>
      <span className="text-xs text-muted-foreground">–</span>
      <div className="relative">
        <Calendar className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input type="date" value={to} min={from || undefined} onChange={(e) => onTo(e.target.value)} className="h-9 w-[145px] pl-8 text-xs" aria-label="To date" />
      </div>
    </div>
  );
}

/** Shared row-identity cell: thumb, mandal name, location, PMM id. */
function MandalCell({ r, showId = true }: { r: AdminBannerListItem; showId?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <BannerThumb src={r.image_url} />
      <div className="min-w-0">
        <p className="truncate text-xs font-bold text-foreground">{r.pandal_name}</p>
        <p className="truncate text-[11px] text-muted-foreground">
          {[r.area_name, r.district_name].filter(Boolean).join(", ") || "—"}
        </p>
        {showId && <p className="font-mono text-[10px] text-slate-400">ID: {bannerCode(r.id)}</p>}
      </div>
    </div>
  );
}

function useReviewActions(onDone?: () => void) {
  const reviewBanner = useReviewBanner();

  const approve = (banner: AdminBannerListItem) =>
    reviewBanner.mutate(
      { id: banner.id, status: "approved" },
      {
        onSuccess: () => {
          toast.success("Banner approved & bonus points credited");
          onDone?.();
        },
        onError: (err) => toast.error(err instanceof Error ? err.message : "Approval failed"),
      },
    );

  const reject = (banner: AdminBannerListItem, note?: string) => {
    const reason = note?.trim() || window.prompt("Reason for rejecting this banner:", banner.ai_reasons[0] ?? "");
    if (reason == null) return;
    if (!reason.trim()) return toast.error("A rejection reason is required");
    reviewBanner.mutate(
      { id: banner.id, status: "rejected", reason: reason.trim() },
      {
        onSuccess: () => {
          toast.success("Banner rejected");
          onDone?.();
        },
        onError: (err) => toast.error(err instanceof Error ? err.message : "Rejection failed"),
      },
    );
  };

  const sendToManual = (banner: AdminBannerListItem) => {
    if (banner.status === "in_review") {
      toast.info("Banner is already in the manual review queue");
      return;
    }
    if (banner.status === "approved") {
      toast.error("Approved banners cannot be sent back to review");
      return;
    }
    reviewBanner.mutate(
      { id: banner.id, status: "in_review" },
      {
        onSuccess: () => {
          toast.success("Banner sent to the manual review queue");
          onDone?.();
        },
        onError: (err) => toast.error(err instanceof Error ? err.message : "Could not send to manual review"),
      },
    );
  };

  return { approve, reject, sendToManual, isPending: reviewBanner.isPending };
}

function BannerReviewPage() {
  const searchParams = useSearch({ from: "/_app/competition/banner-review" }) as { tab?: string };
  const activeTab: TabType = (searchParams.tab as TabType) || "overview";

  if (activeTab === "ai-queue") return <AiQueueScreen />;
  if (activeTab === "manual-queue") return <ManualQueueScreen />;
  return <OverviewScreen reviewedOnly={activeTab === "reviewed"} />;
}

/* ------------------------------------------------------------------ */
/* Screen 1 — Banner Review Dashboard (Overview + Reviewed Banners)    */
/* ------------------------------------------------------------------ */

type OverviewTab = "all" | "ai_approved" | "ai_uncertain" | "ai_rejected" | "manual_reviewed";

function OverviewScreen({ reviewedOnly }: { reviewedOnly: boolean }) {
  const navigate = useNavigate();
  const [statusTab, setStatusTab] = useState<OverviewTab>(reviewedOnly ? "manual_reviewed" : "all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [filters, setFilters] = useState<QueueFilters>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selected, setSelected] = useState<AdminBannerListItem | null>(null);
  const [panelClosed, setPanelClosed] = useState(false);
  const [note, setNote] = useState("");
  const [assignTo, setAssignTo] = useState("unassigned");
  const [priority, setPriority] = useState("normal");

  const configQuery = useCompetitionConfig();
  const competitionTitle = configQuery.data?.title || "Ganpati Utsav Competition 2025";
  const areaOptions = useAreaOptions();
  const adminsQuery = useUsers({ role: "admin", per_page: 50 });
  const admins = adminsQuery.data?.items ?? [];

  const params: BannerListParams = useMemo(
    () => ({
      page,
      per_page: pageSize,
      ai_status:
        statusTab === "ai_approved" ? "approved" : statusTab === "ai_uncertain" ? "uncertain" : statusTab === "ai_rejected" ? "rejected" : undefined,
      reviewed: statusTab === "manual_reviewed" ? true : undefined,
      status: statusFilter !== "all" ? statusFilter : undefined,
      area_id: filters.areaId,
      slot: filters.slot,
      date_from: filters.dateFrom,
      date_to: filters.dateTo,
    }),
    [page, pageSize, statusTab, statusFilter, filters],
  );

  const bannersQuery = useCompetitionBanners(params);
  const aiReview = useAiReviewBanner();
  const aiReviewAll = useAiReviewPending();
  const actions = useReviewActions(() => setSelected(null));

  const data = bannersQuery.data;
  const counts = data?.counts;
  const items = data?.items ?? [];

  useEffect(() => {
    if (!panelClosed && items.length > 0 && (!selected || !items.some((i) => i.id === selected.id))) {
      setSelected(items[0]);
    }
    if (items.length === 0) setSelected(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  const changeTab = (tab: OverviewTab) => {
    setStatusTab(tab);
    setPage(1);
    if (reviewedOnly && tab !== "manual_reviewed") {
      navigate({ to: ROUTES.COMPETITION_BANNER_REVIEW, search: { tab: "overview" } });
    }
  };

  const tabs: { key: OverviewTab; label: string; count?: number }[] = [
    { key: "all", label: "All", count: counts?.total },
    { key: "ai_approved", label: "AI Approved", count: counts?.ai_approved },
    { key: "ai_uncertain", label: "AI Uncertain", count: counts?.ai_uncertain },
    { key: "ai_rejected", label: "AI Rejected", count: counts?.ai_rejected },
    { key: "manual_reviewed", label: "Manual Reviewed", count: counts?.manually_reviewed },
  ];

  const now = new Date();
  const todayChip = `Today, ${now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}, ${now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })}`;

  const recommendedAction = (b: AdminBannerListItem) => {
    if (b.ai_status === "uncertain" || b.ai_status === "failed") return "This banner needs manual review as AI is uncertain.";
    if (b.ai_status === "rejected") return "AI recommends rejecting this banner.";
    if (b.ai_status === "approved") return "AI recommends approving this banner.";
    return "AI review has not run for this banner yet.";
  };

  return (
    <div>
      <PageHeader
        title="Banner Review Dashboard"
        breadcrumbs={BREADCRUMBS}
        actions={
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-xs font-medium text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" /> {todayChip}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportRowsToExcel("banner-review-report.xlsx", items.map(bannerExportRow))}
            >
              <Download className="mr-2 h-3.5 w-3.5" /> Export Report
            </Button>
          </div>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <QueueStatCard title="Total Uploads" value={(counts?.total ?? 0).toLocaleString("en-IN")} subtitle="All banners" icon={ImageIcon} tone="blue" />
        <QueueStatCard title="AI Approved" value={counts?.ai_approved ?? 0} subtitle="Auto approved by AI" icon={CheckCircle2} tone="emerald" valueTone="text-emerald-600" />
        <QueueStatCard title="AI Uncertain" value={counts?.ai_uncertain ?? 0} subtitle="Sent for manual review" icon={HelpCircle} tone="amber" valueTone="text-amber-600" />
        <QueueStatCard title="AI Rejected" value={counts?.ai_rejected ?? 0} subtitle="Auto rejected by AI" icon={XCircle} tone="rose" valueTone="text-rose-600" />
        <QueueStatCard title="Manually Reviewed" value={counts?.manually_reviewed ?? 0} subtitle="Reviewed by admin" icon={UserCheck} tone="purple" valueTone="text-purple-600" />
      </div>

      <div className="flex flex-col items-start gap-4 xl:flex-row">
        {/* Table card */}
        <div className="min-w-0 flex-1 rounded-xl border bg-card shadow-sm">
          {/* Status tabs */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 pt-2">
            <div className="flex flex-wrap items-center">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => changeTab(t.key)}
                  className={cn(
                    "-mb-px border-b-2 px-3.5 py-2.5 text-xs font-semibold transition-colors",
                    statusTab === t.key
                      ? "border-rose-600 text-rose-600"
                      : "border-transparent text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t.label}
                  {t.count != null && ` (${t.count.toLocaleString("en-IN")})`}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 pb-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs"
                disabled={aiReviewAll.isPending}
                onClick={() =>
                  aiReviewAll.mutate(undefined, {
                    onSuccess: (res) => toast.success(`AI reviewed ${res.reviewed} pending banner(s)`),
                    onError: (err) => toast.error(err instanceof Error ? err.message : "AI review failed"),
                  })
                }
              >
                <Bot className="mr-1.5 h-3.5 w-3.5 text-purple-600" />
                {aiReviewAll.isPending ? "Reviewing…" : "Run AI on Pending"}
              </Button>
              <Button variant="outline" size="sm" className="h-8 text-xs">
                <Filter className="mr-1.5 h-3.5 w-3.5" /> Filters
              </Button>
              <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => bannersQuery.refetch()}>
                <RotateCw className="mr-1.5 h-3.5 w-3.5" /> Refresh
              </Button>
            </div>
          </div>

          {/* Filter row */}
          <div className="flex flex-wrap items-center gap-2 border-b px-4 py-3">
            <FilterSelect value="current" placeholder="All Competitions" options={[{ label: competitionTitle, value: "current" }]} onChange={() => undefined} />
            <FilterSelect
              value={filters.areaId ? String(filters.areaId) : "all"}
              placeholder="All Areas"
              options={areaOptions}
              onChange={(v) => {
                setFilters((f) => ({ ...f, areaId: v === "all" ? undefined : Number(v) }));
                setPage(1);
              }}
              width="w-[130px]"
            />
            <FilterSelect
              value={statusFilter}
              placeholder="All Status"
              options={[
                { label: "Pending Manual Review", value: "in_review" },
                { label: "Approved", value: "approved" },
                { label: "Rejected", value: "rejected" },
              ]}
              onChange={(v) => {
                setStatusFilter(v);
                setPage(1);
              }}
              width="w-[130px]"
            />
            <FilterSelect
              value={filters.slot ? String(filters.slot) : "all"}
              placeholder="All Banner (1 & 2)"
              options={[
                { label: "Banner 1", value: "1" },
                { label: "Banner 2", value: "2" },
              ]}
              onChange={(v) => {
                setFilters((f) => ({ ...f, slot: v === "all" ? undefined : Number(v) }));
                setPage(1);
              }}
            />
            <DateRangeInputs
              from={filters.dateFrom ?? ""}
              to={filters.dateTo ?? ""}
              onFrom={(v) => {
                setFilters((f) => ({ ...f, dateFrom: v || undefined }));
                setPage(1);
              }}
              onTo={(v) => {
                setFilters((f) => ({ ...f, dateTo: v || undefined }));
                setPage(1);
              }}
            />
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 text-[11px] font-semibold uppercase text-muted-foreground">
                <tr>
                  <th className="w-10 p-3">#</th>
                  <th className="p-3">Mandal / Participant</th>
                  <th className="p-3">Competition</th>
                  <th className="p-3">Banner</th>
                  <th className="p-3">AI Result</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Uploaded On</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {bannersQuery.isLoading ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-muted-foreground">
                      Loading banners…
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-muted-foreground">
                      No banners found for this view.
                    </td>
                  </tr>
                ) : (
                  items.map((r, idx) => (
                    <tr
                      key={r.id}
                      onClick={() => {
                        setSelected(r);
                        setPanelClosed(false);
                      }}
                      className={cn(
                        "cursor-pointer transition-colors hover:bg-muted/30",
                        selected?.id === r.id
                          ? "bg-blue-50/50"
                          : (r.ai_status === "uncertain" || r.ai_status === "failed") && r.status === "in_review" && "bg-amber-50/40",
                      )}
                    >
                      <td className="p-3 text-muted-foreground">{(page - 1) * pageSize + idx + 1}</td>
                      <td className="p-3">
                        <MandalCell r={r} showId={false} />
                      </td>
                      <td className="max-w-[130px] p-3 text-[11px] text-slate-600">{competitionTitle}</td>
                      <td className="p-3">
                        <BannerThumb src={r.image_url} className="h-9 w-14" />
                      </td>
                      <td className="p-3">
                        <div>
                          <AiResultBadge status={r.ai_status} />
                          {r.ai_confidence != null && (
                            <p className="mt-1 text-[11px] font-semibold text-slate-600">Confidence: {r.ai_confidence}%</p>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <StatusBadge status={BANNER_STATUS_LABELS[r.status] ?? r.status} />
                      </td>
                      <td className="whitespace-nowrap p-3 text-[11px] text-slate-600">{formatDateTime(r.uploaded_at)}</td>
                      <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-600"
                            onClick={() => {
                              setSelected(r);
                              setPanelClosed(false);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-600">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="text-xs">
                              {r.status === "in_review" && (
                                <>
                                  <DropdownMenuItem onClick={() => actions.approve(r)}>Approve</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => actions.reject(r)}>Reject</DropdownMenuItem>
                                </>
                              )}
                              {r.status === "rejected" && (
                                <DropdownMenuItem onClick={() => actions.sendToManual(r)}>Send to Manual Review</DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() =>
                                  aiReview.mutate(r.id, {
                                    onSuccess: (res) => toast.success(`AI verdict: ${res.ai_status} (${res.ai_confidence ?? "?"}%)`),
                                    onError: (err) => toast.error(err instanceof Error ? err.message : "AI review failed"),
                                  })
                                }
                              >
                                Run AI Review
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <TableFooter page={page} pageSize={pageSize} total={data?.total ?? 0} onPageChange={setPage} onPageSizeChange={(n) => { setPageSize(n); setPage(1); }} />
        </div>

        {/* Banner Details panel */}
        {selected && !panelClosed && (
          <aside className="w-full shrink-0 rounded-xl border bg-card shadow-sm xl:sticky xl:top-4 xl:w-[330px]">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h3 className="text-sm font-bold text-foreground">Banner Details</h3>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setPanelClosed(true); setSelected(null); }}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-4 p-4 text-xs">
              <div className="flex items-start gap-3">
                <BannerThumb src={selected.image_url} className="h-20 w-16 rounded-lg" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-foreground">{selected.pandal_name}</p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {[selected.area_name, selected.district_name].filter(Boolean).join(", ") || "—"}
                  </p>
                  <div className="mt-1">
                    <SlotBadge slot={selected.slot} />
                  </div>
                  <p className="mt-1 text-[10px] text-slate-400">Uploaded on: {formatDateTime(selected.uploaded_at)}</p>
                  <p className="font-mono text-[10px] text-slate-400">ID: {bannerCode(selected.id)}</p>
                </div>
              </div>

              <div className="space-y-2 border-t pt-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700">AI Review Result</span>
                  <AiResultBadge status={selected.ai_status} />
                </div>
                <div>
                  <div className="mb-1 flex justify-between text-[11px] font-semibold text-slate-700">
                    <span>Confidence Score</span>
                    <span>{selected.ai_confidence ?? 0}%</span>
                  </div>
                  <ConfidenceBar value={selected.ai_confidence} className="h-2" />
                </div>
                <div>
                  <p className="font-semibold text-slate-700">AI Reason</p>
                  <p className="mt-0.5 text-slate-600">{selected.ai_reasons[0] ?? "No issues flagged."}</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-700">Recommended Action</p>
                  <p className="mt-0.5 text-slate-600">{recommendedAction(selected)}</p>
                </div>
              </div>

              {selected.status === "in_review" ? (
                <div className="space-y-2 border-t pt-3">
                  <h4 className="font-bold text-slate-800">Review Action</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Button size="sm" className="bg-emerald-600 text-xs font-semibold text-white hover:bg-emerald-700" disabled={actions.isPending} onClick={() => actions.approve(selected)}>
                      <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Approve
                    </Button>
                    <Button size="sm" variant="destructive" className="text-xs font-semibold" disabled={actions.isPending} onClick={() => actions.reject(selected, note)}>
                      <XCircle className="mr-1 h-3.5 w-3.5" /> Reject
                    </Button>
                  </div>
                </div>
              ) : null}

              <div className="space-y-2 border-t pt-3">
                <h4 className="font-bold text-slate-800">Send to Manual Review</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="mb-1 text-[11px] font-semibold text-slate-600">Assign Reviewer</p>
                    <Select value={assignTo} onValueChange={setAssignTo}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Select Admin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">Select Admin</SelectItem>
                        {admins.map((a) => (
                          <SelectItem key={a.id} value={a.id}>
                            {a.name || a.email || `Admin #${a.id}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <p className="mb-1 text-[11px] font-semibold text-slate-600">Priority</p>
                    <Select value={priority} onValueChange={setPriority}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <p className="mb-1 text-[11px] font-semibold text-slate-600">Add Note (Optional)</p>
                  <Textarea placeholder="Enter note…" value={note} onChange={(e) => setNote(e.target.value)} className="h-16 text-xs" />
                </div>
                <Button
                  className="w-full bg-violet-600 text-xs font-semibold text-white hover:bg-violet-700"
                  disabled={actions.isPending}
                  onClick={() => actions.sendToManual(selected)}
                >
                  <Send className="mr-1.5 h-3.5 w-3.5" /> Send for Manual Review
                </Button>
              </div>

              <div className="space-y-1 border-t pt-3">
                <h4 className="font-bold text-slate-800">Review History</h4>
                {selected.status === "rejected" && selected.rejection_reason ? (
                  <p className="text-slate-600">
                    Rejected — <span className="text-rose-600">{selected.rejection_reason}</span>
                  </p>
                ) : selected.status === "approved" ? (
                  <p className="text-slate-600">Approved.</p>
                ) : (
                  <p className="text-slate-400">No review history available.</p>
                )}
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Screen 2 — AI Review Queue                                          */
/* ------------------------------------------------------------------ */

function AiQueueScreen() {
  const [filters, setFilters] = useState<QueueFilters>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selected, setSelected] = useState<AdminBannerListItem | null>(null);
  const [panelClosed, setPanelClosed] = useState(false);
  const [note, setNote] = useState("");
  const [checked, setChecked] = useState<Set<number>>(new Set());

  const configQuery = useCompetitionConfig();
  const competitionTitle = configQuery.data?.title || "Ganpati Utsav Competition 2025";
  const areaOptions = useAreaOptions();

  const params: BannerListParams = useMemo(
    () => ({
      page,
      per_page: pageSize,
      status: "in_review",
      ai_status: "uncertain",
      area_id: filters.areaId,
      slot: filters.slot,
      priority: filters.priority,
      date_from: filters.dateFrom,
      date_to: filters.dateTo,
    }),
    [page, pageSize, filters],
  );

  const bannersQuery = useCompetitionBanners(params);
  const actions = useReviewActions();
  const data = bannersQuery.data;
  const counts = data?.counts;
  const items = data?.items ?? [];

  useEffect(() => {
    if (!panelClosed && items.length > 0 && (!selected || !items.some((i) => i.id === selected.id))) {
      setSelected(items[0]);
    }
    if (items.length === 0) setSelected(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  const selectedIndex = selected ? items.findIndex((i) => i.id === selected.id) : -1;

  const toggleCheck = (id: number) =>
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div>
      <PageHeader
        title="AI Review Queue"
        breadcrumbs={BREADCRUMBS}
        actions={
          <Button variant="outline" size="sm" onClick={() => exportRowsToExcel("ai-review-queue.xlsx", items.map(bannerExportRow))}>
            <Download className="mr-2 h-3.5 w-3.5" /> Export Queue
          </Button>
        }
      />
      <p className="-mt-4 mb-5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Info className="h-3.5 w-3.5" /> AI has marked these banners as uncertain and need manual review.
      </p>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <QueueStatCard title="Total in Queue" value={counts?.ai_uncertain ?? 0} subtitle="Needs manual review" icon={Bot} tone="purple" />
        <QueueStatCard title="High Priority" value={counts?.priority_high ?? 0} subtitle="Low confidence (< 50%)" icon={AlertCircle} tone="rose" valueTone="text-rose-600" />
        <QueueStatCard title="Medium Priority" value={counts?.priority_medium ?? 0} subtitle="Medium confidence (50-75%)" icon={MinusSquare} tone="amber" valueTone="text-amber-600" />
        <QueueStatCard title="Low Priority" value={counts?.priority_low ?? 0} subtitle="High confidence (75-90%)" icon={CheckCircle2} tone="emerald" valueTone="text-emerald-600" />
        <QueueStatCard title="Reviewed Today" value={counts?.reviewed_today ?? 0} subtitle="By admin" icon={UserCheck} tone="blue" />
      </div>

      <div className="flex flex-col items-start gap-4 xl:flex-row">
        <div className="min-w-0 flex-1 rounded-xl border bg-card shadow-sm">
          {/* Filter row */}
          <div className="flex flex-wrap items-center gap-2 border-b px-4 py-3">
            <FilterSelect value="current" placeholder="All Competitions" options={[{ label: competitionTitle, value: "current" }]} onChange={() => undefined} width="w-[140px]" />
            <FilterSelect
              value={filters.areaId ? String(filters.areaId) : "all"}
              placeholder="All Areas"
              options={areaOptions}
              onChange={(v) => {
                setFilters((f) => ({ ...f, areaId: v === "all" ? undefined : Number(v) }));
                setPage(1);
              }}
              width="w-[120px]"
            />
            <FilterSelect
              value={filters.slot ? String(filters.slot) : "all"}
              placeholder="All Banner (1 & 2)"
              options={[
                { label: "Banner 1", value: "1" },
                { label: "Banner 2", value: "2" },
              ]}
              onChange={(v) => {
                setFilters((f) => ({ ...f, slot: v === "all" ? undefined : Number(v) }));
                setPage(1);
              }}
              width="w-[140px]"
            />
            <FilterSelect
              value={filters.priority ?? "all"}
              placeholder="AI Confidence"
              options={[
                { label: "Below 50%", value: "high" },
                { label: "50% - 75%", value: "medium" },
                { label: "75% - 90%", value: "low" },
              ]}
              onChange={(v) => {
                setFilters((f) => ({ ...f, priority: v === "all" ? undefined : (v as QueueFilters["priority"]) }));
                setPage(1);
              }}
              width="w-[130px]"
            />
            <FilterSelect
              value={filters.priority ?? "all"}
              placeholder="Priority"
              options={[
                { label: "High", value: "high" },
                { label: "Medium", value: "medium" },
                { label: "Low", value: "low" },
              ]}
              onChange={(v) => {
                setFilters((f) => ({ ...f, priority: v === "all" ? undefined : (v as QueueFilters["priority"]) }));
                setPage(1);
              }}
              width="w-[110px]"
            />
            <DateRangeInputs
              from={filters.dateFrom ?? ""}
              to={filters.dateTo ?? ""}
              onFrom={(v) => {
                setFilters((f) => ({ ...f, dateFrom: v || undefined }));
                setPage(1);
              }}
              onTo={(v) => {
                setFilters((f) => ({ ...f, dateTo: v || undefined }));
                setPage(1);
              }}
            />
          </div>

          <div className="flex items-center justify-between px-4 py-2.5">
            <span className="text-xs font-semibold text-muted-foreground">{(data?.total ?? 0).toLocaleString("en-IN")} entries</span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-8 text-xs">
                <Filter className="mr-1.5 h-3.5 w-3.5" /> Filters
              </Button>
              <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => bannersQuery.refetch()}>
                <RotateCw className="mr-1.5 h-3.5 w-3.5" /> Refresh
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto border-t">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 text-[11px] font-semibold uppercase text-muted-foreground">
                <tr>
                  <th className="w-10 p-3">
                    <input
                      type="checkbox"
                      className="rounded border-slate-300"
                      checked={items.length > 0 && items.every((i) => checked.has(i.id))}
                      onChange={(e) => setChecked(e.target.checked ? new Set(items.map((i) => i.id)) : new Set())}
                    />
                  </th>
                  <th className="p-3">Mandal / Participant</th>
                  <th className="p-3">Banner</th>
                  <th className="p-3">AI Result &amp; Confidence</th>
                  <th className="p-3">Reason (AI Flag)</th>
                  <th className="p-3">Priority</th>
                  <th className="p-3">Queued On</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {bannersQuery.isLoading ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-muted-foreground">
                      Loading queue…
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-muted-foreground">
                      No banners waiting in the AI review queue.
                    </td>
                  </tr>
                ) : (
                  items.map((r) => (
                    <tr
                      key={r.id}
                      onClick={() => {
                        setSelected(r);
                        setPanelClosed(false);
                      }}
                      className={cn("cursor-pointer transition-colors hover:bg-muted/30", selected?.id === r.id && "bg-blue-50/50")}
                    >
                      <td className="p-3" onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" className="rounded border-slate-300" checked={checked.has(r.id)} onChange={() => toggleCheck(r.id)} />
                      </td>
                      <td className="p-3">
                        <MandalCell r={r} />
                      </td>
                      <td className="p-3">
                        <SlotBadge slot={r.slot} />
                        <p className="mt-1 max-w-[110px] truncate text-[11px] text-slate-600">{r.file_name || `banner${r.slot}.jpg`}</p>
                      </td>
                      <td className="p-3">
                        <AiResultBadge status={r.ai_status} />
                        <p className="mt-1 text-[11px] font-semibold text-slate-600">Confidence: {r.ai_confidence ?? 0}%</p>
                        <ConfidenceBar value={r.ai_confidence} className="mt-1 w-24" />
                      </td>
                      <td className="max-w-[180px] p-3">
                        {r.ai_reasons.length > 0 ? (
                          <ul className="list-disc space-y-0.5 pl-3 text-[11px] text-slate-600">
                            {r.ai_reasons.slice(0, 2).map((reason, i) => (
                              <li key={i} className="truncate">
                                {reason}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-[11px] text-slate-400">—</span>
                        )}
                      </td>
                      <td className="p-3">
                        <PriorityBadge confidence={r.ai_confidence} />
                      </td>
                      <td className="whitespace-nowrap p-3 text-[11px] text-slate-600">{formatDateTime(r.uploaded_at)}</td>
                      <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-600"
                          onClick={() => {
                            setSelected(r);
                            setPanelClosed(false);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <TableFooter page={page} pageSize={pageSize} total={data?.total ?? 0} onPageChange={setPage} onPageSizeChange={(n) => { setPageSize(n); setPage(1); }} />
        </div>

        {/* Review Details panel */}
        {selected && !panelClosed && (
          <aside className="w-full shrink-0 rounded-xl border bg-card shadow-sm xl:sticky xl:top-4 xl:w-[330px]">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h3 className="text-sm font-bold text-foreground">Review Details</h3>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setPanelClosed(true); setSelected(null); }}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-4 p-4 text-xs">
              <div className="flex items-start gap-3">
                <BannerThumb src={selected.image_url} className="h-20 w-16 rounded-lg" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-foreground">{selected.pandal_name}</p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {[selected.area_name, selected.district_name].filter(Boolean).join(", ") || "—"}
                  </p>
                  <div className="mt-1">
                    <SlotBadge slot={selected.slot} />
                  </div>
                  <p className="mt-1 text-[10px] text-slate-400">Uploaded on {formatDateTime(selected.uploaded_at)}</p>
                  <p className="font-mono text-[10px] text-slate-400">ID: {bannerCode(selected.id)}</p>
                </div>
              </div>

              <div className="space-y-2 border-t pt-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700">AI Review Result</span>
                  <AiResultBadge status={selected.ai_status} />
                </div>
                <div>
                  <div className="mb-1 flex justify-between text-[11px] font-semibold text-slate-700">
                    <span>Confidence Score</span>
                    <span>{selected.ai_confidence ?? 0}%</span>
                  </div>
                  <ConfidenceBar value={selected.ai_confidence} className="h-2" />
                </div>
              </div>

              <div className="space-y-1 border-t pt-3">
                <h4 className="font-bold text-slate-800">AI Flagged Reasons</h4>
                {selected.ai_reasons.length > 0 ? (
                  <ul className="list-disc space-y-1 pl-4 text-slate-600">
                    {selected.ai_reasons.map((reason, i) => (
                      <li key={i}>{reason}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-400">No flags detected.</p>
                )}
              </div>

              <div className="space-y-1 border-t pt-3">
                <h4 className="font-bold text-slate-800">AI Suggestions</h4>
                {selected.ai_suggestions.length > 0 ? (
                  <ul className="list-disc space-y-1 pl-4 text-slate-600">
                    {selected.ai_suggestions.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-400">No suggestions from AI.</p>
                )}
              </div>

              <div className="space-y-2 border-t pt-3">
                <h4 className="font-bold text-slate-800">Review Action</h4>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-emerald-200 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
                    disabled={actions.isPending}
                    onClick={() => actions.approve(selected)}
                  >
                    <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-rose-200 text-xs font-semibold text-rose-700 hover:bg-rose-50"
                    disabled={actions.isPending}
                    onClick={() => actions.reject(selected, note)}
                  >
                    <X className="mr-1 h-3.5 w-3.5" /> Reject
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-blue-200 text-xs font-semibold text-blue-700 hover:bg-blue-50"
                    onClick={() => toast.success("Banner kept in the manual review queue")}
                  >
                    <Send className="mr-1 h-3.5 w-3.5" /> Send to Manual Review
                  </Button>
                </div>
                <div>
                  <p className="mb-1 text-[11px] font-semibold text-slate-600">Add Note (Optional)</p>
                  <Textarea placeholder="Enter note…" value={note} onChange={(e) => setNote(e.target.value)} className="h-16 text-xs" />
                </div>
              </div>

              <div className="space-y-2 border-t pt-3">
                <h4 className="font-bold text-slate-800">Navigate Queue</h4>
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    disabled={selectedIndex <= 0}
                    onClick={() => selectedIndex > 0 && setSelected(items[selectedIndex - 1])}
                  >
                    ← Previous
                    {selectedIndex > 0 && <span className="ml-1 font-mono text-[10px] text-slate-400">{bannerCode(items[selectedIndex - 1].id)}</span>}
                  </Button>
                  <span className="text-[11px] font-semibold text-slate-600">
                    {selectedIndex + 1} of {data?.total ?? items.length}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    disabled={selectedIndex < 0 || selectedIndex >= items.length - 1}
                    onClick={() => selectedIndex < items.length - 1 && setSelected(items[selectedIndex + 1])}
                  >
                    Next
                    {selectedIndex < items.length - 1 && <span className="ml-1 font-mono text-[10px] text-slate-400">{bannerCode(items[selectedIndex + 1].id)}</span>}
                    {" →"}
                  </Button>
                </div>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Screen 3 — Manual Review Queue                                      */
/* ------------------------------------------------------------------ */

type ManualSubTab = "all" | "high" | "medium" | "low" | "overdue";

function ManualQueueScreen() {
  const [subTab, setSubTab] = useState<ManualSubTab>("all");
  const [filters, setFilters] = useState<QueueFilters>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selected, setSelected] = useState<AdminBannerListItem | null>(null);
  const [panelClosed, setPanelClosed] = useState(false);
  const [note, setNote] = useState("");
  const [assignTo, setAssignTo] = useState("unassigned");
  const [panelPriority, setPanelPriority] = useState("medium");
  const [guidelinesOpen, setGuidelinesOpen] = useState(false);
  const [checked, setChecked] = useState<Set<number>>(new Set());

  const configQuery = useCompetitionConfig();
  const competitionTitle = configQuery.data?.title || "Ganpati Utsav Competition 2025";
  const areaOptions = useAreaOptions();
  const adminsQuery = useUsers({ role: "admin", per_page: 50 });
  const admins = adminsQuery.data?.items ?? [];
  const aiReview = useAiReviewBanner();

  const params: BannerListParams = useMemo(
    () => ({
      page,
      per_page: pageSize,
      status: "in_review",
      priority: subTab === "high" || subTab === "medium" || subTab === "low" ? subTab : filters.priority,
      overdue: subTab === "overdue" ? true : undefined,
      area_id: filters.areaId,
      slot: filters.slot,
      date_from: filters.dateFrom,
      date_to: filters.dateTo,
    }),
    [page, pageSize, subTab, filters],
  );

  const bannersQuery = useCompetitionBanners(params);
  const actions = useReviewActions();
  const data = bannersQuery.data;
  const counts = data?.counts;

  const items = useMemo(() => {
    const raw = data?.items ?? [];
    if (!filters.reason) return raw;
    const needle = filters.reason.toLowerCase();
    return raw.filter((r) => r.ai_reasons.some((reason) => reason.toLowerCase().includes(needle)));
  }, [data?.items, filters.reason]);

  useEffect(() => {
    if (!panelClosed && items.length > 0 && (!selected || !items.some((i) => i.id === selected.id))) {
      setSelected(items[0]);
    }
    if (items.length === 0) setSelected(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  const selectedIndex = selected ? items.findIndex((i) => i.id === selected.id) : -1;

  const subTabs: { key: ManualSubTab; label: string; count?: number }[] = [
    { key: "all", label: "All", count: counts?.in_review },
    { key: "high", label: "High Priority", count: counts?.priority_high },
    { key: "medium", label: "Medium Priority", count: counts?.priority_medium },
    { key: "low", label: "Low Priority", count: counts?.priority_low },
    { key: "overdue", label: "Overdue", count: counts?.overdue },
  ];

  return (
    <div>
      <PageHeader
        title="Manual Review Queue"
        breadcrumbs={BREADCRUMBS}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => exportRowsToExcel("manual-review-queue.xlsx", items.map(bannerExportRow))}>
              <Download className="mr-2 h-3.5 w-3.5" /> Export List
            </Button>
            <Button variant="outline" size="sm" onClick={() => setGuidelinesOpen(true)}>
              <Eye className="mr-2 h-3.5 w-3.5" /> Review Guidelines
            </Button>
          </div>
        }
      />
      <p className="-mt-4 mb-5 text-xs font-medium text-muted-foreground">
        These banners need manual review as AI was unsure or flagged potential issues.
      </p>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <QueueStatCard title="Total in Queue" value={counts?.in_review ?? 0} subtitle="Needs review" icon={UserCheck} tone="purple" />
        <QueueStatCard title="High Priority" value={counts?.priority_high ?? 0} subtitle="Due to low AI confidence (< 50%)" icon={AlertCircle} tone="rose" valueTone="text-rose-600" />
        <QueueStatCard title="Medium Priority" value={counts?.priority_medium ?? 0} subtitle="AI confidence 50% - 75%" icon={MinusSquare} tone="amber" valueTone="text-amber-600" />
        <QueueStatCard title="Low Priority" value={counts?.priority_low ?? 0} subtitle="AI confidence 75% - 90%" icon={CheckCircle2} tone="emerald" valueTone="text-emerald-600" />
        <QueueStatCard title="Overdue" value={counts?.overdue ?? 0} subtitle="Pending for > 24 hrs" icon={Clock} tone="rose" valueTone="text-rose-600" />
      </div>

      <div className="flex flex-col items-start gap-4 xl:flex-row">
        <div className="min-w-0 flex-1 rounded-xl border bg-card shadow-sm">
          {/* Priority sub-tabs */}
          <div className="flex flex-wrap items-center border-b px-4 pt-2">
            {subTabs.map((t) => (
              <button
                key={t.key}
                onClick={() => {
                  setSubTab(t.key);
                  setPage(1);
                }}
                className={cn(
                  "-mb-px border-b-2 px-3.5 py-2.5 text-xs font-semibold transition-colors",
                  subTab === t.key ? "border-rose-600 text-rose-600" : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                {t.label}
                {t.count != null && ` (${t.count})`}
              </button>
            ))}
          </div>

          {/* Filter row */}
          <div className="flex flex-wrap items-center gap-2 border-b px-4 py-3">
            <FilterSelect value="current" placeholder="All Competitions" options={[{ label: competitionTitle, value: "current" }]} onChange={() => undefined} width="w-[140px]" />
            <FilterSelect
              value={filters.areaId ? String(filters.areaId) : "all"}
              placeholder="All Areas"
              options={areaOptions}
              onChange={(v) => {
                setFilters((f) => ({ ...f, areaId: v === "all" ? undefined : Number(v) }));
                setPage(1);
              }}
              width="w-[115px]"
            />
            <FilterSelect
              value={filters.slot ? String(filters.slot) : "all"}
              placeholder="All Banner (1 & 2)"
              options={[
                { label: "Banner 1", value: "1" },
                { label: "Banner 2", value: "2" },
              ]}
              onChange={(v) => {
                setFilters((f) => ({ ...f, slot: v === "all" ? undefined : Number(v) }));
                setPage(1);
              }}
              width="w-[140px]"
            />
            <FilterSelect
              value={filters.reason ?? "all"}
              placeholder="All Reasons"
              options={REASON_OPTIONS.map((rz) => ({ label: rz, value: rz }))}
              onChange={(v) => setFilters((f) => ({ ...f, reason: v === "all" ? undefined : v }))}
              width="w-[125px]"
            />
            <FilterSelect
              value={subTab === "high" || subTab === "medium" || subTab === "low" ? subTab : filters.priority ?? "all"}
              placeholder="All Priorities"
              options={[
                { label: "High", value: "high" },
                { label: "Medium", value: "medium" },
                { label: "Low", value: "low" },
              ]}
              onChange={(v) => {
                setSubTab("all");
                setFilters((f) => ({ ...f, priority: v === "all" ? undefined : (v as QueueFilters["priority"]) }));
                setPage(1);
              }}
              width="w-[125px]"
            />
            <DateRangeInputs
              from={filters.dateFrom ?? ""}
              to={filters.dateTo ?? ""}
              onFrom={(v) => {
                setFilters((f) => ({ ...f, dateFrom: v || undefined }));
                setPage(1);
              }}
              onTo={(v) => {
                setFilters((f) => ({ ...f, dateTo: v || undefined }));
                setPage(1);
              }}
            />
            <div className="ml-auto flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-8 text-xs">
                <Filter className="mr-1.5 h-3.5 w-3.5" /> Filters
              </Button>
              <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => bannersQuery.refetch()}>
                <RotateCw className="mr-1.5 h-3.5 w-3.5" /> Refresh
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 text-[11px] font-semibold uppercase text-muted-foreground">
                <tr>
                  <th className="w-10 p-3">
                    <input
                      type="checkbox"
                      className="rounded border-slate-300"
                      checked={items.length > 0 && items.every((i) => checked.has(i.id))}
                      onChange={(e) => setChecked(e.target.checked ? new Set(items.map((i) => i.id)) : new Set())}
                    />
                  </th>
                  <th className="p-3">Mandal / Participant</th>
                  <th className="p-3">Banner</th>
                  <th className="p-3">AI Result &amp; Reason</th>
                  <th className="p-3">Priority</th>
                  <th className="p-3">Queued On</th>
                  <th className="p-3">Waiting Time</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {bannersQuery.isLoading ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-muted-foreground">
                      Loading queue…
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-muted-foreground">
                      No banners waiting for manual review.
                    </td>
                  </tr>
                ) : (
                  items.map((r) => {
                    const waiting = getWaiting(r.uploaded_at);
                    return (
                      <tr
                        key={r.id}
                        onClick={() => {
                          setSelected(r);
                          setPanelClosed(false);
                        }}
                        className={cn("cursor-pointer transition-colors hover:bg-muted/30", selected?.id === r.id && "bg-blue-50/50")}
                      >
                        <td className="p-3" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            className="rounded border-slate-300"
                            checked={checked.has(r.id)}
                            onChange={() =>
                              setChecked((prev) => {
                                const next = new Set(prev);
                                if (next.has(r.id)) next.delete(r.id);
                                else next.add(r.id);
                                return next;
                              })
                            }
                          />
                        </td>
                        <td className="p-3">
                          <MandalCell r={r} />
                        </td>
                        <td className="p-3">
                          <SlotBadge slot={r.slot} />
                          <p className="mt-1 max-w-[110px] truncate text-[11px] text-slate-600">{r.file_name || `banner${r.slot}.jpg`}</p>
                        </td>
                        <td className="max-w-[190px] p-3">
                          <AiResultBadge status={r.ai_status} />
                          <p className="mt-1 text-[11px] font-semibold text-slate-600">Confidence: {r.ai_confidence ?? 0}%</p>
                          <ConfidenceBar value={r.ai_confidence} className="mt-1 w-24" />
                          {r.ai_reasons[0] && <p className="mt-1 truncate text-[11px] text-slate-500">• {r.ai_reasons[0]}</p>}
                        </td>
                        <td className="p-3">
                          <PriorityBadge confidence={r.ai_confidence} />
                        </td>
                        <td className="whitespace-nowrap p-3 text-[11px] text-slate-600">{formatDateTime(r.uploaded_at)}</td>
                        <td className="whitespace-nowrap p-3">
                          <p className="text-[11px] font-semibold text-slate-700">{waiting.label}</p>
                          {waiting.overdue && (
                            <span className="mt-0.5 inline-flex items-center gap-1 text-[10px] font-bold text-rose-600">
                              <Clock className="h-3 w-3" /> Overdue
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 border-blue-200 px-3 text-[11px] font-semibold text-blue-700 hover:bg-blue-50"
                              onClick={() => {
                                setSelected(r);
                                setPanelClosed(false);
                              }}
                            >
                              Review
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-600">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="text-xs">
                                <DropdownMenuItem onClick={() => actions.approve(r)}>Approve</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => actions.reject(r)}>Reject</DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    aiReview.mutate(r.id, {
                                      onSuccess: (res) => toast.success(`AI verdict: ${res.ai_status} (${res.ai_confidence ?? "?"}%)`),
                                      onError: (err) => toast.error(err instanceof Error ? err.message : "AI review failed"),
                                    })
                                  }
                                >
                                  Run AI Again
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <TableFooter page={page} pageSize={pageSize} total={data?.total ?? 0} onPageChange={setPage} onPageSizeChange={(n) => { setPageSize(n); setPage(1); }} />
        </div>

        {/* Review Preview panel */}
        {selected && !panelClosed && (
          <aside className="w-full shrink-0 rounded-xl border bg-card shadow-sm xl:sticky xl:top-4 xl:w-[330px]">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h3 className="text-sm font-bold text-foreground">Review Preview</h3>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setPanelClosed(true); setSelected(null); }}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-4 p-4 text-xs">
              <div className="flex items-start gap-3">
                <BannerThumb src={selected.image_url} className="h-20 w-16 rounded-lg" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-foreground">{selected.pandal_name}</p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {[selected.area_name, selected.district_name].filter(Boolean).join(", ") || "—"}
                  </p>
                  <div className="mt-1">
                    <SlotBadge slot={selected.slot} />
                  </div>
                  <p className="mt-1 text-[10px] text-slate-400">Uploaded: {formatDateTime(selected.uploaded_at)}</p>
                </div>
              </div>

              <div className="space-y-2 border-t pt-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700">AI Review Summary</span>
                  <AiResultBadge status={selected.ai_status} />
                </div>
                <div>
                  <div className="mb-1 flex justify-between text-[11px] font-semibold text-slate-700">
                    <span>Confidence Score</span>
                    <span>{selected.ai_confidence ?? 0}%</span>
                  </div>
                  <ConfidenceBar value={selected.ai_confidence} className="h-2" />
                </div>
              </div>

              <div className="space-y-1 border-t pt-3">
                <h4 className="font-bold text-slate-800">AI Flagged Reasons</h4>
                {selected.ai_reasons.length > 0 ? (
                  <ul className="list-disc space-y-1 pl-4 text-slate-600">
                    {selected.ai_reasons.map((reason, i) => (
                      <li key={i}>{reason}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-400">No flags detected.</p>
                )}
              </div>

              <div className="space-y-1 border-t pt-3">
                <h4 className="font-bold text-slate-800">AI Suggestions</h4>
                {selected.ai_suggestions.length > 0 ? (
                  <ul className="list-disc space-y-1 pl-4 text-slate-600">
                    {selected.ai_suggestions.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-400">No suggestions from AI.</p>
                )}
              </div>

              <div className="space-y-2 border-t pt-3">
                <h4 className="font-bold text-slate-800">Review Actions</h4>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-emerald-200 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
                    disabled={actions.isPending}
                    onClick={() => actions.approve(selected)}
                  >
                    <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-rose-200 text-xs font-semibold text-rose-700 hover:bg-rose-50"
                    disabled={actions.isPending}
                    onClick={() => actions.reject(selected, note)}
                  >
                    <X className="mr-1 h-3.5 w-3.5" /> Reject
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs font-semibold"
                    disabled={aiReview.isPending}
                    onClick={() =>
                      aiReview.mutate(selected.id, {
                        onSuccess: (res) => toast.success(`Sent back to AI — verdict: ${res.ai_status} (${res.ai_confidence ?? "?"}%)`),
                        onError: (err) => toast.error(err instanceof Error ? err.message : "AI review failed"),
                      })
                    }
                  >
                    Send Back
                  </Button>
                </div>
                <div>
                  <p className="mb-1 text-[11px] font-semibold text-slate-600">Add Note (Optional)</p>
                  <Textarea placeholder="Enter note here…" value={note} onChange={(e) => setNote(e.target.value)} className="h-16 text-xs" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="mb-1 text-[11px] font-semibold text-slate-600">Assign To (Optional)</p>
                    <Select value={assignTo} onValueChange={setAssignTo}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Select Admin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">Select Admin</SelectItem>
                        {admins.map((a) => (
                          <SelectItem key={a.id} value={a.id}>
                            {a.name || a.email || `Admin #${a.id}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <p className="mb-1 text-[11px] font-semibold text-slate-600">Priority</p>
                    <Select value={panelPriority} onValueChange={setPanelPriority}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between border-t bg-muted/30 p-3 text-xs">
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                disabled={selectedIndex <= 0}
                onClick={() => selectedIndex > 0 && setSelected(items[selectedIndex - 1])}
              >
                ← Previous
              </Button>
              <div className="text-center">
                <p className="font-semibold text-slate-600">
                  {selectedIndex + 1} of {data?.total ?? items.length}
                </p>
                <p className="font-mono text-[10px] text-slate-400">ID: {bannerCode(selected.id)}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                disabled={selectedIndex < 0 || selectedIndex >= items.length - 1}
                onClick={() => selectedIndex < items.length - 1 && setSelected(items[selectedIndex + 1])}
              >
                Next →
              </Button>
            </div>
          </aside>
        )}
      </div>

      <Dialog open={guidelinesOpen} onOpenChange={setGuidelinesOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Review Guidelines</DialogTitle>
          </DialogHeader>
          <ul className="list-disc space-y-2 pl-5 text-sm text-slate-600">
            <li>Banner must be original and clearly related to the mandal.</li>
            <li>No political, abusive, or offensive content.</li>
            <li>Text must be readable — reject blurry or heavily cluttered banners.</li>
            <li>No personal phone numbers or unrelated promotional content.</li>
            <li>Copyrighted material without permission is strictly prohibited.</li>
            <li>Always give a clear rejection reason — the participant sees it in the app and can re-upload.</li>
          </ul>
        </DialogContent>
      </Dialog>
    </div>
  );
}
