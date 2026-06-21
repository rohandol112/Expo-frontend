import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { FileText, CheckCircle2, Clock, XCircle, Plus, MapPin, Eye } from "lucide-react";
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
import { useDeleteNews, useNews, useNewsStats } from "@/hooks/api/useNews";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { isAuthApiError } from "@/lib/apiError";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/news/all")({
  component: AllNewsPage,
});

const TABS = [
  { key: "all", label: "All News", status: undefined },
  { key: "pending", label: "Pending Review", status: "submitted" },
  { key: "published", label: "Published", status: "approved" },
  { key: "rejected", label: "Rejected", status: "rejected" },
] as const;

function toIsoDate(date: string, endOfDay = false) {
  if (!date) return undefined;
  return new Date(`${date}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}`).toISOString();
}

function AllNewsPage() {
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

  const activeTab = TABS.find((item) => item.key === tab);
  const debouncedSearch = useDebouncedValue(search, 400);
  const queryParams = useMemo(
    () => ({
      page,
      per_page: 10,
      search: debouncedSearch || undefined,
      category_id: categoryId === "all" ? undefined : Number(categoryId),
      status: status === "all" ? activeTab?.status : status,
      language_code: languageCode === "all" ? undefined : languageCode,
      from_date: toIsoDate(fromDate),
      to_date: toIsoDate(toDate, true),
    }),
    [activeTab?.status, categoryId, fromDate, languageCode, page, debouncedSearch, status, toDate],
  );

  const newsQuery = useNews(queryParams);
  const statsQuery = useNewsStats();
  const categoriesQuery = useCategories();
  const languagesQuery = useLanguages();
  const deleteNews = useDeleteNews();
  const rows = newsQuery.data?.items ?? [];
  const error = newsQuery.error ? "Unable to load news from backend." : undefined;
  const stats = statsQuery.data;

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
    { key: "category", header: "Category", cell: (r) => <CategoryBadge category={r.category} /> },
    { key: "language", header: "Language", cell: (r) => <span className="text-sm">{r.language}</span> },
    {
      key: "location",
      header: "Location",
      cell: (r) =>
        r.location && (r.location.area || r.location.district || r.location.state) ? (
          <div className="flex items-start gap-1.5">
            <MapPin className="h-3.5 w-3.5 mt-0.5 text-primary" />
            <div>
              <p className="text-sm">{r.location.area || r.location.district || r.location.state}</p>
              <p className="text-xs text-muted-foreground">{[r.location.district, r.location.state].filter((v) => v && v !== (r.location?.area || r.location?.district)).join(", ") || "—"}</p>
            </div>
          </div>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      key: "views",
      header: "Views",
      cell: (r) => (
        <span className="text-sm inline-flex items-center gap-1">
          {r.views.toLocaleString()} <Eye className="h-3.5 w-3.5 text-muted-foreground" />
        </span>
      ),
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
              <p className="text-xs text-muted-foreground">{r.uploadedBy.email}</p>
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
      cell: (r) => <span className="text-sm whitespace-nowrap">{r.publishedOn ?? "—"}</span>,
    },
    {
      key: "actions",
      header: "Actions",
      cell: (r) => (
        <ActionMenu
          onView={() => navigate({ to: "/news/$newsId", params: { newsId: r.id } })}
          onEdit={() => navigate({ to: "/news/$newsId/edit", params: { newsId: r.id } })}
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
          title="News Management"
          breadcrumbs={[
            { label: "Dashboard", to: ROUTES.DASHBOARD },
            { label: "News Management" },
            { label: "All News" },
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
          <StatsCard title="Total News" value={(stats?.total ?? 0).toLocaleString()} icon={FileText} variant="red" />
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
          emptyTitle="No news found"
          emptyDescription="Backend returned no news for the selected filters."
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
    </>
  );
}
