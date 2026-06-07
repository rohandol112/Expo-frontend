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
import { useApproveNews, useDeleteNews, useNews, useNewsStats, useRejectNews, useScheduleNews, useShareNews } from "@/hooks/api/useNews";
import { isAuthApiError } from "@/lib/apiError";
import { toast } from "sonner";
import { useCategories } from "@/hooks/api/useCategories";
import { useChannels } from "@/hooks/api/useChannels";
import { useLanguages } from "@/hooks/api/useLanguages";

export const Route = createFileRoute("/_app/news/admin")({
  component: AdminNewsPage,
});

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
  const queryParams = useMemo(
    () => ({
      page,
      per_page: 10,
      search: search || undefined,
      is_admin_news: true,
      category_id: categoryId === "all" ? undefined : Number(categoryId),
      status: status === "all" ? undefined : status,
      language_code: languageCode === "all" ? undefined : languageCode,
      news_source_id: channelId === "all" ? undefined : Number(channelId),
      type: contentType === "all" ? undefined : contentType,
      from_date: fromDate ? new Date(`${fromDate}T00:00:00.000`).toISOString() : undefined,
      to_date: toDate ? new Date(`${toDate}T23:59:59.999`).toISOString() : undefined,
    }),
    [categoryId, channelId, contentType, fromDate, languageCode, page, search, status, toDate],
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
  const sourceRows = newsQuery.data?.items ?? [];
  const error = newsQuery.error ? "Unable to load admin news from backend." : undefined;
  const deeplinkBase = import.meta.env.VITE_PUBLIC_APP_DEEPLINK_BASE || "pehlibaat://news";

  const filtered = useMemo(
    () => sourceRows.filter((n) => !search || n.title.toLowerCase().includes(search.toLowerCase())),
    [search, sourceRows],
  );

  const handleShare = async (row: NewsItem) => {
    const link = `${deeplinkBase.replace(/\/$/, "")}/${row.id}`;
    try {
      await shareNews.mutateAsync({ id: row.id, channel: "admin_panel" });
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(link);
        toast.success(`Share link copied: ${link}`);
        return;
      }
      toast.info(link);
    } catch (err) {
      if (isAuthApiError(err)) {
        toast.error("Backend auth is required to record this share.");
        return;
      }
      toast.info(`Share link: ${link}`);
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
    { key: "category", header: "Category", cell: (r) => <CategoryBadge category={r.category} /> },
    {
      key: "channel",
      header: "Channel",
      cell: (r) => <span className="text-sm font-medium">{r.channel?.name ?? "—"}</span>,
    },
    { key: "language", header: "Language", cell: (r) => <span className="text-sm">{r.language}</span> },
    {
      key: "visibility",
      header: "Location Visibility",
      cell: (r) => {
        const visibility = r.visibility;
        const detail = [visibility?.state, visibility?.district, visibility?.area].filter(Boolean).join(", ");
        const labelMap: Record<string, string> = {
          "All India": "National",
          "By State": "State",
          "By District": "District",
          "By Area": "Area",
        };
        return (
          <div>
            <p className="text-sm font-medium">{labelMap[visibility?.type ?? "All India"] ?? "National"}</p>
            {detail && <p className="text-xs text-muted-foreground">{detail}</p>}
          </div>
        );
      },
    },
    {
      key: "views",
      header: "Views",
      cell: (r) => (
        <span className="text-sm inline-flex items-center gap-1">
          {(r.views / 1000).toFixed(1)}K <Eye className="h-3.5 w-3.5 text-muted-foreground" />
        </span>
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
      cell: (r) => <span className="text-sm">{r.createdBy ?? "—"}</span>,
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
            {
              label: "Schedule",
              icon: CalendarClock,
              onClick: () => {
                setScheduleTarget(r);
                setScheduleDateTime("");
              },
            },
            { label: "Share", icon: Share2, onClick: () => handleShare(r) },
            {
              label: "Send Notification",
              icon: Bell,
              onClick: () => {
                // TODO: integrate notification API using news visibility and user language targeting.
                toast.info("Notification API not available yet.");
              },
            },
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
            {(categoriesQuery.data?.items ?? []).map((category) => <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>)}
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
        <Select value={languageCode} onValueChange={(value) => { setLanguageCode(value); setPage(1); }}>
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
        data={filtered}
        rowKey={(r) => r.id}
        loading={newsQuery.isLoading}
        page={page}
        pageSize={10}
        total={newsQuery.data?.total ?? filtered.length}
        onPageChange={setPage}
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
