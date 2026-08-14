import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { FileText, CheckCircle2, Clock, Archive, Eye, Plus, Play, FileText as FT, Share2, Bell, XCircle, CalendarClock } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatsCard } from "@/components/common/StatsCard";
import { DataTable, type Column } from "@/components/tables/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CategoryBadge, StatusBadge } from "@/components/common/StatusBadge";
import { ActionMenu } from "@/components/common/ActionMenu";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import type { NewsItem } from "@/types/news";
import { ROUTES } from "@/constants/routes.constants";
import { useApproveNews, useDeleteNews, useNews, useNewsStats, useRejectNews, useScheduleNews, useSendNewsNotification, useShareNews } from "@/hooks/api/useNews";
import { ApiError, isAuthApiError } from "@/lib/apiError";
import { toast } from "sonner";
import { useCategories } from "@/hooks/api/useCategories";
import { useChannels } from "@/hooks/api/useChannels";
import { useLanguages } from "@/hooks/api/useLanguages";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

export const Route = createFileRoute("/_app/news/admin")({
  component: AdminNewsPage,
});

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

function locationPartLabel(name: string | number | null | undefined, id: number | null | undefined, kind: string) {
  if (name !== undefined && name !== null && String(name).trim()) return String(name);
  if (id != null) return `${kind} #${id}`;
  return null;
}

function getNewsLocationLabel(row: NewsItem) {
  const loc = row.location;
  if (loc && (loc.state || loc.district || loc.area || loc.stateId || loc.districtId || loc.areaId)) {
    const parts = [
      locationPartLabel(loc.area, loc.areaId, "Area"),
      locationPartLabel(loc.district, loc.districtId, "District"),
      locationPartLabel(loc.state, loc.stateId, "State"),
    ].filter((part): part is string => Boolean(part));
    if (parts.length > 0) return parts.join(", ");
  }
  return "National";
}

const SCHEDULABLE_STATUSES: NewsItem["status"][] = ["Draft", "Pending", "Published"];

function minScheduleDateTime() {
  const d = new Date(Date.now() + 60_000);
  d.setSeconds(0, 0);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

function AdminNewsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [categoryId, setCategoryId] = useState("all");
  const [status, setStatus] = useState("all");
  const [languageCode, setLanguageCode] = useState("all");
  const [channelId, setChannelId] = useState("all");
  const [contentType, setContentType] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<NewsItem | null>(null);
  const [rejectTarget, setRejectTarget] = useState<NewsItem | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [scheduleTarget, setScheduleTarget] = useState<NewsItem | null>(null);
  const [scheduleDateTime, setScheduleDateTime] = useState("");
  const debouncedSearch = useDebouncedValue(search, 400);

  const queryParams = useMemo(
    () => ({
      page,
      per_page: 10,
      search: debouncedSearch || undefined,
      is_admin_news: true,
      category_id: categoryId === "all" ? undefined : Number(categoryId),
      status: status === "all" ? undefined : status,
      language_code: languageCode === "all" ? undefined : languageCode,
      news_source_id: channelId === "all" ? undefined : Number(channelId),
      type: contentType === "all" ? undefined : contentType,
      from_date: fromDate ? new Date(`${fromDate}T00:00:00.000`).toISOString() : undefined,
      to_date: toDate ? new Date(`${toDate}T23:59:59.999`).toISOString() : undefined,
    }),
    [categoryId, channelId, contentType, debouncedSearch, fromDate, languageCode, page, status, toDate],
  );

  const newsQuery = useNews(queryParams);
  const statsQuery = useNewsStats({ is_admin_news: true });
  const categoriesQuery = useCategories();
  const channelsQuery = useChannels();
  const languagesQuery = useLanguages();
  const approveNews = useApproveNews();
  const rejectNews = useRejectNews();
  const scheduleNews = useScheduleNews();
  const deleteNews = useDeleteNews();
  const shareNews = useShareNews();
  const sendNewsNotification = useSendNewsNotification();
  const sourceRows = newsQuery.data?.items ?? [];
  const error = newsQuery.error ? "Unable to load admin news from backend." : undefined;

  const selectedLanguageName = (languagesQuery.data?.items ?? []).find((l) => l.code === languageCode)?.name;
  const filteredCategories = useMemo(() => {
    const items = categoriesQuery.data?.items ?? [];
    if (languageCode === "all" || !selectedLanguageName) return items;
    return items.filter((c) => c.language === selectedLanguageName);
  }, [categoriesQuery.data, languageCode, selectedLanguageName]);

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
          {r.thumbnail ? <img src={r.thumbnail} alt="" className="h-12 w-16 rounded object-cover" /> : <div className="flex h-12 w-16 items-center justify-center rounded bg-muted text-xs text-muted-foreground">No media</div>}
          <div>
            <p className="text-sm font-medium line-clamp-2 max-w-[220px]">{r.title}</p>
            <span className="inline-flex items-center gap-1 mt-1 text-xs text-muted-foreground">
              {r.contentType === "Video" || r.contentType === "Shorts" ? (
                <Play className="h-3 w-3" />
              ) : (
                <FT className="h-3 w-3" />
              )}
              {r.contentType}
            </span>
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
          <div className="flex flex-wrap gap-1 max-w-[150px]">
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
      key: "channel",
      header: "Channel",
      cell: (r) => <span className="text-sm font-medium">{r.channel?.name ?? "—"}</span>,
    },
    {
      key: "language",
      header: "Language",
      cell: (r) => {
        const additionalCodes = r.translations?.map((t) => t.language_code?.toUpperCase()).filter(Boolean) || [];
        return (
          <div>
            <p className="text-sm font-medium">{r.language}</p>
            {additionalCodes.length > 0 && (
              <p className="text-[10px] text-muted-foreground">Extra: {additionalCodes.join(", ")}</p>
            )}
          </div>
        );
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
      key: "location",
      header: "News Location",
      cell: (r) => <span className="text-sm font-medium text-muted-foreground">{getNewsLocationLabel(r)}</span>,
    },
    {
      key: "views",
      header: "Analytics",
      cell: (r) => (
        <div className="space-y-1 text-sm">
          <span className="inline-flex items-center gap-1">
            {(r.views / 1000).toFixed(1)}K <Eye className="h-3.5 w-3.5 text-muted-foreground" />
          </span>
          {r.hasPoll && <p className="text-xs text-muted-foreground">Poll enabled</p>}
        </div>
      ),
    },
    { key: "status", header: "Status", cell: (r) => <StatusBadge status={r.status} /> },
    {
      key: "publishedOn",
      header: "Published On",
      cell: (r) => <span className="text-sm whitespace-nowrap">{r.publishedOn ?? "—"}</span>,
    },
    {
      key: "createdBy",
      header: "Created By",
      cell: (r) => (
        <div>
          <p className="text-sm font-medium">{r.uploadedBy?.name ?? r.createdBy ?? "—"}</p>
          <p className="text-xs text-muted-foreground">{r.createdByRole ?? r.uploadedBy?.role ?? "Admin"}</p>
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      cell: (r) => (
        <ActionMenu
          onView={() => navigate({ to: "/news/$newsId", params: { newsId: r.id } })}
          onEdit={() => navigate({ to: "/news/$newsId/edit", params: { newsId: r.id } })}
          onDelete={() => setDeleteTarget(r)}
          extraItems={[
            {
              label: sendNewsNotification.isPending ? "Sending Notification..." : "Send Notification",
              icon: Bell,
              onClick: () => handleSendNotification(r),
            },
            { label: "Share", icon: Share2, onClick: () => handleShare(r) },
            {
              label: "Approve",
              icon: CheckCircle2,
              onClick: async () => {
                try {
                  await approveNews.mutateAsync(r.id);
                  toast.success("News approved");
                } catch (err) {
                  toast.error(isAuthApiError(err) ? "Backend admin auth is required to approve news." : "Unable to approve news");
                }
              },
            },
            {
              label: "Reject",
              icon: XCircle,
              onClick: () => {
                setRejectTarget(r);
                setRejectReason("");
              },
            },
            ...(SCHEDULABLE_STATUSES.includes(r.status)
              ? [{
                  label: "Schedule",
                  icon: CalendarClock,
                  onClick: () => {
                    setScheduleTarget(r);
                    setScheduleDateTime("");
                  },
                }]
              : []),
          ]}
        />
      ),
    },
  ];
  const stats = statsQuery.data;

  return (
    <>
      <div>
        <PageHeader
          title="All News - Admin/Manager"
          breadcrumbs={[
            { label: "Dashboard", to: ROUTES.DASHBOARD },
            { label: "News Management" },
            { label: "Admin News" },
          ]}
          actions={
            <Button onClick={() => navigate({ to: ROUTES.NEWS_ADD })}>
              <Plus className="h-4 w-4 mr-1" /> Add News
            </Button>
          }
        />

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <StatsCard title="Total Admin News" value={(stats?.admin_news ?? stats?.total ?? 0).toLocaleString()} icon={FileText} variant="red" />
          <StatsCard title="Published" value={(stats?.approved ?? 0).toLocaleString()} icon={CheckCircle2} variant="green" />
          <StatsCard title="Draft" value={(stats?.draft ?? 0).toLocaleString()} icon={Clock} variant="amber" />
          <StatsCard title="Scheduled" value={(stats?.scheduled ?? 0).toLocaleString()} icon={Archive} variant="violet" />
          <StatsCard title="Total Views" value={(stats?.total_views ?? 0).toLocaleString()} icon={Eye} variant="pink" />
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-5">
          <Input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search news by title..." className="max-w-sm" />
          <Select value={categoryId} onValueChange={(value) => { setCategoryId(value); setPage(1); }}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {filteredCategories.map((category) => <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={(value) => { setStatus(value); setPage(1); }}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="submitted">Pending</SelectItem>
              <SelectItem value="approved">Published</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={languageCode} onValueChange={(value) => { setLanguageCode(value); setCategoryId("all"); setPage(1); }}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Language" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Languages</SelectItem>
              {(languagesQuery.data?.items ?? []).map((language) => <SelectItem key={language.id} value={language.code}>{language.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={channelId} onValueChange={(value) => { setChannelId(value); setPage(1); }}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Channel" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Channels</SelectItem>
              {(channelsQuery.data?.items ?? []).map((channel) => <SelectItem key={channel.id} value={channel.id}>{channel.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={contentType} onValueChange={(value) => { setContentType(value); setPage(1); }}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Content Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="article">Article</SelectItem>
              <SelectItem value="video">Video</SelectItem>
              <SelectItem value="short">Shorts</SelectItem>
              <SelectItem value="story">Story</SelectItem>
            </SelectContent>
          </Select>
          <Input type="date" value={fromDate} max={toDate || undefined} onChange={(event) => { setFromDate(event.target.value); setPage(1); }} className="w-[160px]" aria-label="Start date" />
          <Input type="date" value={toDate} min={fromDate || undefined} onChange={(event) => { setToDate(event.target.value); setPage(1); }} className="w-[160px]" aria-label="End date" />
          <Button variant="ghost" onClick={() => { setSearch(""); setCategoryId("all"); setStatus("all"); setLanguageCode("all"); setChannelId("all"); setContentType("all"); setFromDate(""); setToDate(""); setPage(1); }}>Reset</Button>
        </div>
        {error && <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</div>}

        <DataTable
          columns={columns}
          data={sourceRows}
          rowKey={(r) => r.id}
          loading={newsQuery.isLoading}
          page={page}
          pageSize={10}
          total={newsQuery.data?.total ?? sourceRows.length}
          onPageChange={setPage}
          serverPaged
          emptyTitle="No admin news found"
          emptyDescription="Backend returned no admin news for the selected filters."
        />
      </div>
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
        open={Boolean(rejectTarget)}
        onOpenChange={(open) => !open && setRejectTarget(null)}
        title="Reject news?"
        description="Provide a rejection reason for the backend audit trail."
        confirmLabel={rejectNews.isPending ? "Rejecting..." : "Reject"}
        destructive
        onConfirm={async () => {
          if (!rejectTarget) return;
          if (rejectReason.trim().length < 3) {
            toast.error("Rejection reason must be at least 3 characters");
            return;
          }
          try {
            await rejectNews.mutateAsync({ id: rejectTarget.id, reason: rejectReason.trim() });
            toast.success("News rejected");
            setRejectTarget(null);
          } catch (err) {
            toast.error(isAuthApiError(err) ? "Backend auth is required to reject news." : "Unable to reject news");
          }
        }}
      >
        <Textarea value={rejectReason} onChange={(event) => setRejectReason(event.target.value)} placeholder="Reason for rejection" />
      </ConfirmDialog>
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
          if (new Date(scheduleDateTime).getTime() <= Date.now()) {
            toast.error("Schedule date must be in the future");
            return;
          }
          try {
            await scheduleNews.mutateAsync({ id: scheduleTarget.id, scheduledFor: new Date(scheduleDateTime).toISOString() });
            toast.success("News scheduled");
            setScheduleTarget(null);
          } catch (err) {
            if (isAuthApiError(err)) {
              toast.error("Backend admin auth is required to schedule news.");
            } else if (err instanceof ApiError && err.message) {
              toast.error(err.message);
            } else {
              toast.error("Unable to schedule news");
            }
          }
        }}
      >
        <Input type="datetime-local" value={scheduleDateTime} min={minScheduleDateTime()} onChange={(event) => setScheduleDateTime(event.target.value)} />
      </ConfirmDialog>
    </>
  );
}
