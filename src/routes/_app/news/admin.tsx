import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { FileText, CheckCircle2, Clock, Archive, Eye, Plus, Play, FileText as FT } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatsCard } from "@/components/common/StatsCard";
import { FilterBar } from "@/components/common/FilterBar";
import { DataTable, type Column } from "@/components/tables/DataTable";
import { Button } from "@/components/ui/button";
import { CategoryBadge, StatusBadge } from "@/components/common/StatusBadge";
import { ActionMenu } from "@/components/common/ActionMenu";
import { mockNews, mockCategories, mockLanguages } from "@/mock/news.mock";
import type { NewsItem } from "@/types/news";
import { ROUTES } from "@/constants/routes.constants";

export const Route = createFileRoute("/_app/news/admin")({
  component: AdminNewsPage,
});

function AdminNewsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(
    () => mockNews.filter((n) => !search || n.title.toLowerCase().includes(search.toLowerCase())),
    [search],
  );

  const columns: Column<NewsItem>[] = [
    {
      key: "details",
      header: "News Details",
      cell: (r) => (
        <div className="flex items-center gap-3">
          <img src={r.thumbnail} alt="" className="h-12 w-16 rounded object-cover" />
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
    {
      key: "contentType",
      header: "Content Type",
      cell: (r) => <span className="text-sm">{r.contentType}</span>,
    },
    { key: "language", header: "Language", cell: (r) => <span className="text-sm">{r.language}</span> },
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
    { key: "actions", header: "Actions", cell: () => <ActionMenu /> },
  ];

  return (
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
        <StatsCard title="Total Admin News" value="256" icon={FileText} variant="red" />
        <StatsCard title="Published" value="198" icon={CheckCircle2} variant="green" />
        <StatsCard title="Draft" value="38" icon={Clock} variant="amber" />
        <StatsCard title="Scheduled" value="20" icon={Archive} variant="violet" />
        <StatsCard title="Total Views" value="1.25M" icon={Eye} variant="pink" />
      </div>

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search news by title..."
        dropdowns={[
          { key: "cat", placeholder: "All Categories", options: mockCategories.map((c) => ({ label: c, value: c })) },
          { key: "status", placeholder: "All Status", options: ["Published", "Draft", "Scheduled"].map((s) => ({ label: s, value: s })) },
          { key: "lang", placeholder: "All Languages", options: mockLanguages.map((l) => ({ label: l, value: l })) },
        ]}
      />

      <DataTable
        columns={columns}
        data={filtered}
        rowKey={(r) => r.id}
        page={page}
        pageSize={10}
        total={256}
        onPageChange={setPage}
      />
    </div>
  );
}