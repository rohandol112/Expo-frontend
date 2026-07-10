import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { FileText, CheckCircle2, Clock, XCircle, Plus, MapPin, Eye, Bell, Share2, CalendarClock, Calendar, Play, FileText as FT } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatsCard } from "@/components/common/StatsCard";
import { DataTable, type Column } from "@/components/tables/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CategoryBadge, StatusBadge } from "@/components/common/StatusBadge";
import { ActionMenu } from "@/components/common/ActionMenu";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { NewsItem } from "@/types/news";
import { ROUTES } from "@/constants/routes.constants";
import { cn } from "@/lib/utils";
import { useCategories } from "@/hooks/api/useCategories";
import { useLanguages } from "@/hooks/api/useLanguages";
import { useApproveNews, useDeleteNews, useNews, useNewsStats, useRejectNews, useScheduleNews, useSendNewsNotification, useShareNews } from "@/hooks/api/useNews";
import { ApiError, isAuthApiError } from "@/lib/apiError";
import { toast } from "sonner";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

export const Route = createFileRoute("/_app/news/all")({
  component: UserNewsPage,
});

const TABS = [
  { key: "all", label: "User News", status: undefined },
  { key: "pending", label: "Pending Review", status: "submitted" },
  { key: "published", label: "Published", status: "approved" },
  { key: "rejected", label: "Rejected", status: "rejected" },
] as const;

function toIsoDate(date: string, endOfDay = false) {
  if (!date) return undefined;
  return new Date(`${date}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}`).toISOString();
}

function getNewsLocation(row: NewsItem) {
  if (row.location) {
    const primary = [row.location.area, row.location.district].filter(Boolean).join(", ") || row.location.state || "—";
    const secondary = [row.location.state].filter(Boolean).join(", ");
    return { primary: String(primary), secondary: String(secondary || "") };
  }

  const visibility = row.visibility;
  if (!visibility) return null;
  const detail = [visibility.area, visibility.district, visibility.state, visibility.users].filter(Boolean).join(", ");
  return { primary: visibility.type, secondary: detail };
}

function getVisibilityLabel(row: NewsItem) {
  const visibility = row.visibility;
  const detail = [visibility?.state, visibility?.district, visibility?.area, visibility?.users].filter(Boolean).join(", ");
  const labelMap: Record<string, string> = {
    "All India": "National",
    "By State": "State",
    "By District": "District",
    "By Area": "Area",
    Private: "Private",
  };
  return {
    label: labelMap[visibility?.type ?? "All India"] ?? "National",
    detail,
  };
}

function getShareUrl(newsId: string) {
  const configuredBase = import.meta.env.VITE_PUBLIC_SITE_URL;
  const origin = configuredBase?.trim() || (typeof window !== "undefined" ? window.location.origin : "");
  return `${origin.replace(/\/$/, "")}/news/${newsId}`;
}

function UserNewsPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("all");
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("all");
  const [status, setStatus] = useState("all");
  const [languageCode, setLanguageCode] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<NewsItem | null>(null);
  const [approveTarget, setApproveTarget] = useState<NewsItem | null>(null);
  const [rejectTarget, setRejectTarget] = useState<NewsItem | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [scheduleTarget, setScheduleTarget] = useState<NewsItem | null>(null);
  const [scheduleDateTime, setScheduleDateTime] = useState("");
  const debouncedSearch = useDebouncedValue(search, 400);

  const activeTab = TABS.find((item) => item.key === tab);
  const queryParams = useMemo(
    () => ({
      page,
      per_page: 10,
      search: debouncedSearch || undefined,
      is_admin_news: false,
      category_id: categoryId === "all" ? undefined : Number(categoryId),
      status: status === "all" ? activeTab?.status : status,
      language_code: languageCode === "all" ? undefined : languageCode,
      from_date: toIsoDate(fromDate),
      to_date: toIsoDate(toDate, true),
    }),
    [activeTab?.status, categoryId, debouncedSearch, fromDate, languageCode, page, status, toDate],
  );

  const newsQuery = useNews(queryParams);
  const statsQuery = useNewsStats({ is_admin_news: false });
  const categoriesQuery = useCategories();
  const languagesQuery = useLanguages();
  const deleteNews = useDeleteNews();
  const approveNews = useApproveNews();
  const rejectNews = useRejectNews();
  const scheduleNews = useScheduleNews();
  const shareNews = useShareNews();
  const sendNewsNotification = useSendNewsNotification();
  const rows = newsQuery.data?.items ?? [];
  const error = newsQuery.error ? "Unable to load news from backend." : undefined;
  const stats = statsQuery.data;

  const handleShare = async (row: NewsItem) => {
    const link = getShareUrl(row.id);
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(link);
        toast.success(`Share link copied: ${link}`);
      } else {
        toast.info(link);
      }
    } catch {
      toast.info(`Share link: ${link}`);
    }

    try {
      await shareNews.mutateAsync({ id: row.id, channel: "admin_panel" });
    } catch (err) {
      if (isAuthApiError(err)) return;
    }
  };

  const handleSendNotification = async (row: NewsItem) => {
    try {
      const result = await sendNewsNotification.mutateAsync(row.id);
      const recipientText = typeof result?.recipients === "number" ? ` to ${result.recipients.toLocaleString()} users` : "";
      toast.success(`Notification sent${recipientText}`);
    } catch (err) {
      if (isAuthApiError(err)) {
        toast.error("Backend admin auth is required to send notification.");
        return;
      }
      if (err instanceof ApiError && (err.status === 501 || err.code === "notificationTargetingUnsupported")) {
        toast.error("Private user notification targeting is not supported yet.");
        return;
      }
      if (err instanceof Error) {
        toast.error(err.message || "Unable to send notification");
        return;
      }
      toast.error("Unable to send notification");
    }
  };

  const columns: Column<NewsItem>[] = [
    {
      key: "details",
      header: "News Details",
      cell: (r) => (
        <div className="flex items-center gap-3">
          {r.thumbnail ? <img src={r.thumbnail} alt="" className="h-12 w-16 rounded object-cover shrink-0" /> : <div className="flex h-12 w-16 shrink-0 items-center justify-center rounded bg-muted text-xs text-muted-foreground">No media</div>}
          <div className="min-w-0">
            <p className="text-sm font-medium line-clamp-1">{r.title}</p>
            <p className="text-xs text-muted-foreground">ID: #{r.code}</p>
          </div>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      cell: (r) => {
        const cats = r.categories?.map((c) => c.name).filter(Boolean) || [];
        return (
          <div className="flex flex-wrap gap-1 max-w-[120px]">
            {cats.length > 0 ? (
              cats.map((cat, idx) => <CategoryBadge key={idx} category={cat} />)
            ) : (
              <CategoryBadge category="General" />
            )}
          </div>
        );
      },
    },
    {
      key: "language",
      header: "Default Language",
      cell: (r) => <span className="text-sm font-medium">{r.language}</span>,
    },
    {
      key: "additionalLanguage",
      header: "Additional Language",
      cell: (r) => {
        const additionalCodes = r.translations?.map((t) => t.language_code?.toUpperCase()).filter(Boolean) || [];
        return (
          <span className="text-sm">
            {additionalCodes.length > 0 ? additionalCodes.join(", ") : "—"}
          </span>
        );
      },
    },
    {
      key: "location",
      header: "User Location",
      cell: (r) => {
        const locs = [r.location?.state, r.location?.district, r.location?.area].filter(Boolean);
        return <span className="text-sm">{locs.length > 0 ? locs.join(" > ") : "National"}</span>;
      },
    },
    {
      key: "visibility",
      header: "Visibility",
      cell: (r) => {
        const visibility = getVisibilityLabel(r);
        return (
          <div>
            <p className="text-sm font-medium">{visibility.label}</p>
            {visibility.detail && <p className="text-xs text-muted-foreground">{visibility.detail}</p>}
          </div>
        );
      },
    },
    {
      key: "uploadedBy",
      header: "Uploaded By",
      cell: (r) =>
        r.uploadedBy ? (
          <div className="flex items-center gap-2">
            <Avatar className="h-7 w-7">
              <AvatarImage src={r.uploadedBy.avatar} />
              <AvatarFallback>{r.uploadedBy.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{r.uploadedBy.name}</p>
              <p className="text-xs text-muted-foreground">
                {r.uploadedBy.id ? `ID: ${r.uploadedBy.id}` : r.uploadedBy.email || "—"}
              </p>
            </div>
          </div>
        ) : (
          <span className="text-muted-foreground">{r.createdBy ?? "—"}</span>
        ),
    },
    { key: "status", header: "Status", cell: (r) => <StatusBadge status={r.status} /> },
    {
      key: "uploadedOn",
      header: "Uploaded On",
      cell: (r) => <span className="text-sm whitespace-nowrap">{r.uploadedOn ?? r.publishedOn ?? "—"}</span>,
    },
    {
      key: "updatedOn",
      header: "Last Updated On",
      cell: (r) => <span className="text-sm whitespace-nowrap">{r.updatedAt ? new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(r.updatedAt)) : "—"}</span>,
    },
    {
      key: "actions",
      header: "Actions",
      cell: (r) => (
        <ActionMenu
          onView={() => navigate({ to: "/news/$newsId", params: { newsId: r.id } })}
          onEdit={() => navigate({ to: "/news/$newsId/edit", params: { newsId: r.id } })}
          extraItems={[
            {
              label: sendNewsNotification.isPending ? "Sending ..." : "Send Notification",
              icon: Bell,
              onClick: () => handleSendNotification(r),
            },
            { label: "Share", icon: Share2, onClick: () => handleShare(r) },
            ...(["Pending", "Draft", "Scheduled", "Rejected"].includes(r.status)
              ? [{ label: "Approve", icon: CheckCircle2, onClick: () => setApproveTarget(r) }]
              : []),
            ...(["Pending", "Scheduled"].includes(r.status)
              ? [{ label: "Reject", icon: XCircle, onClick: () => { setRejectTarget(r); setRejectReason(""); } }]
              : []),
            {
              label: "Schedule",
              icon: CalendarClock,
              onClick: () => {
                setScheduleTarget(r);
                setScheduleDateTime("");
              },
            },
          ]}
          onDelete={() => setDeleteTarget(r)}
        />
      ),
    },
  ];

  const resetFilters = () => {
    setSearch("");
    setCategoryId("all");
    setStatus("all");
    setLanguageCode("all");
    setFromDate("");
    setToDate("");
    setPage(1);
  };

  return (
    <>
      <div>
        <PageHeader
          title="User News"
          breadcrumbs={[
            { label: "Dashboard", to: ROUTES.DASHBOARD },
            { label: "News Management" },
            { label: "User News" },
          ]}
        />

        <div className="flex items-center justify-between border-b mb-6">
          <div className="flex gap-6">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => {
                  setTab(t.key);
                  setPage(1);
                }}
                className={cn(
                  "flex items-center gap-2 pb-3 -mb-px text-sm font-medium border-b-2 transition-colors",
                  tab === t.key
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
          <Button className="mb-2" onClick={() => navigate({ to: ROUTES.NEWS_ADD })}>
            <Plus className="h-4 w-4 mr-1" /> Add News
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-5">
          <Input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search news by title..." className="max-w-sm" />
          <Select value={categoryId} onValueChange={(value) => { setCategoryId(value); setPage(1); }}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {(categoriesQuery.data?.items ?? []).map((category) => <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={(value) => { setStatus(value); setPage(1); }}>
            <SelectTrigger className="w-[170px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tab Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="submitted">Pending</SelectItem>
              <SelectItem value="approved">Published</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={languageCode} onValueChange={(value) => { setLanguageCode(value); setPage(1); }}>
            <SelectTrigger className="w-[170px]"><SelectValue placeholder="Language" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Languages</SelectItem>
              {(languagesQuery.data?.items ?? []).map((language) => <SelectItem key={language.id} value={language.code}>{language.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input type="date" value={fromDate} max={toDate || undefined} onChange={(event) => { setFromDate(event.target.value); setPage(1); }} className="w-[160px]" aria-label="Start date" />
          <Input type="date" value={toDate} min={fromDate || undefined} onChange={(event) => { setToDate(event.target.value); setPage(1); }} className="w-[160px]" aria-label="End date" />
          <Button variant="ghost" onClick={resetFilters}>Reset</Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatsCard title="Total User News" value={(stats?.user_news ?? stats?.total ?? 0).toLocaleString()} icon={FileText} variant="red" />
          <StatsCard title="Published" value={(stats?.approved ?? 0).toLocaleString()} icon={CheckCircle2} variant="green" />
          <StatsCard title="Pending Review" value={(stats?.submitted ?? 0).toLocaleString()} icon={Clock} variant="amber" />
          <StatsCard title="Rejected" value={(stats?.rejected ?? 0).toLocaleString()} icon={XCircle} variant="rose" />
        </div>

        {error && <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</div>}

        <DataTable
          columns={columns}
          data={rows}
          rowKey={(r) => r.id}
          loading={newsQuery.isLoading}
          page={page}
          pageSize={10}
          total={newsQuery.data?.total ?? rows.length}
          onPageChange={setPage}
          serverPaged
          emptyTitle="No user news found"
          emptyDescription="Backend returned no user news for the selected filters."
        />
      </div>
      <ConfirmDialog
        open={Boolean(approveTarget)}
        onOpenChange={(open) => !open && setApproveTarget(null)}
        title="Approve news?"
        description={`This will publish "${approveTarget?.title ?? "this news"}".`}
        confirmLabel={approveNews.isPending ? "Approving..." : "Approve"}
        onConfirm={async () => {
          if (!approveTarget) return;
          try {
            await approveNews.mutateAsync(approveTarget.id);
            toast.success("News approved");
            setApproveTarget(null);
          } catch (err) {
            toast.error(isAuthApiError(err) ? "Backend auth is required to approve news." : "Unable to approve news");
          }
        }}
      />
      <ConfirmDialog
        open={Boolean(rejectTarget)}
        onOpenChange={(open) => !open && setRejectTarget(null)}
        title="Reject news?"
        description={`Add a reason before rejecting "${rejectTarget?.title ?? "this news"}".`}
        confirmLabel={rejectNews.isPending ? "Rejecting..." : "Reject"}
        destructive
        onConfirm={async () => {
          if (!rejectTarget) return;
          if (!rejectReason.trim()) {
            toast.error("Rejection reason is required");
            return;
          }
          try {
            await rejectNews.mutateAsync({ id: rejectTarget.id, reason: rejectReason.trim() });
            toast.success("News rejected");
            setRejectTarget(null);
            setRejectReason("");
          } catch (err) {
            toast.error(isAuthApiError(err) ? "Backend auth is required to reject news." : "Unable to reject news");
          }
        }}
      >
        <Input value={rejectReason} onChange={(event) => setRejectReason(event.target.value)} placeholder="Reason for rejection" />
      </ConfirmDialog>
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete news?"
        description={`This will delete "${deleteTarget?.title ?? "this news"}" if the backend allows it.`}
        confirmLabel={deleteNews.isPending ? "Deleting..." : "Delete"}
        destructive
        onConfirm={async () => {
          if (!deleteTarget) return;
          try {
            await deleteNews.mutateAsync(deleteTarget.id);
            toast.success("News deleted");
            setDeleteTarget(null);
          } catch (err) {
            toast.error(isAuthApiError(err) ? "Backend auth is required to delete news." : "Unable to delete news");
          }
        }}
      />
      <ConfirmDialog
        open={Boolean(scheduleTarget)}
        onOpenChange={(open) => !open && setScheduleTarget(null)}
        title="Schedule news?"
        description="Choose a future date and time."
        confirmLabel={scheduleNews.isPending ? "Scheduling..." : "Schedule"}
        onConfirm={async () => {
          if (!scheduleTarget) return;
          if (!scheduleDateTime) {
            toast.error("Select a schedule date and time");
            return;
          }
          try {
            await scheduleNews.mutateAsync({ id: scheduleTarget.id, scheduledFor: new Date(scheduleDateTime).toISOString() });
            toast.success("News scheduled");
            setScheduleTarget(null);
          } catch (err) {
            toast.error(isAuthApiError(err) ? "Backend auth is required to schedule news." : "Unable to schedule news");
          }
        }}
      >
        <Input type="datetime-local" value={scheduleDateTime} onChange={(event) => setScheduleDateTime(event.target.value)} />
      </ConfirmDialog>
    </>
  );
}
