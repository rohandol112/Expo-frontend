import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { FileText, CheckCircle2, Clock, XCircle, Plus, MapPin, Eye } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatsCard } from "@/components/common/StatsCard";
import { FilterBar } from "@/components/common/FilterBar";
import { DataTable, type Column } from "@/components/tables/DataTable";
import { Button } from "@/components/ui/button";
import { CategoryBadge, StatusBadge } from "@/components/common/StatusBadge";
import { ActionMenu } from "@/components/common/ActionMenu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { mockNews, mockCategories, mockLanguages } from "@/mock/news.mock";
import type { NewsItem } from "@/types/news";
import { ROUTES } from "@/constants/routes.constants";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/news/all")({
  component: AllNewsPage,
});

const TABS = [
  { key: "all", label: "All News", count: undefined as number | undefined },
  { key: "pending", label: "Pending Review", count: 24 },
  { key: "published", label: "Published", count: undefined },
  { key: "rejected", label: "Rejected", count: undefined },
];

function AllNewsPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return mockNews.filter((n) => {
      if (tab === "pending" && n.status !== "Pending") return false;
      if (tab === "published" && n.status !== "Published") return false;
      if (tab === "rejected" && n.status !== "Rejected") return false;
      if (search && !n.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [tab, search]);

  const columns: Column<NewsItem>[] = [
    {
      key: "details",
      header: "News Details",
      cell: (r) => (
        <div className="flex items-center gap-3">
          <img src={r.thumbnail} alt="" className="h-12 w-16 rounded object-cover shrink-0" />
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
        r.location ? (
          <div className="flex items-start gap-1.5">
            <MapPin className="h-3.5 w-3.5 mt-0.5 text-primary" />
            <div>
              <p className="text-sm">{r.location.city}</p>
              <p className="text-xs text-muted-foreground">{r.location.region}</p>
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
          {(r.views / 1000).toFixed(1)}K <Eye className="h-3.5 w-3.5 text-muted-foreground" />
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
          <span className="text-muted-foreground">—</span>
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
      cell: () => <ActionMenu />,
    },
  ];

  return (
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
              onClick={() => setTab(t.key)}
              className={cn(
                "flex items-center gap-2 pb-3 -mb-px text-sm font-medium border-b-2 transition-colors",
                tab === t.key
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
              {t.count !== undefined && (
                <span className="rounded-full bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 font-semibold">
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>
        <Button className="mb-2" onClick={() => navigate({ to: ROUTES.NEWS_ADD })}>
          <Plus className="h-4 w-4 mr-1" /> Add News
        </Button>
      </div>

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search news by title or user..."
        dropdowns={[
          {
            key: "cat",
            placeholder: "All Categories",
            options: mockCategories.map((c) => ({ label: c, value: c })),
          },
          {
            key: "status",
            placeholder: "All Status",
            options: ["Published", "Pending", "Draft", "Rejected"].map((s) => ({ label: s, value: s })),
          },
          {
            key: "lang",
            placeholder: "All Languages",
            options: mockLanguages.map((l) => ({ label: l, value: l })),
          },
        ]}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard title="Total News" value="1,482" icon={FileText} variant="red" />
        <StatsCard title="Published" value="986" icon={CheckCircle2} variant="green" />
        <StatsCard title="Pending Review" value="325" icon={Clock} variant="amber" />
        <StatsCard title="Rejected" value="171" icon={XCircle} variant="rose" />
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        rowKey={(r) => r.id}
        page={page}
        pageSize={10}
        total={1482}
        onPageChange={setPage}
      />
    </div>
  );
}