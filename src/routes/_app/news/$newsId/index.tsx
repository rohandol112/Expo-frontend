import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Edit, Eye, FileText, Globe, Radio } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatsCard } from "@/components/common/StatsCard";
import { CategoryBadge, StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes.constants";
import { useNewsItem } from "@/hooks/api/useNews";

export const Route = createFileRoute("/_app/news/$newsId/")({ component: NewsDetailPage });

function NewsDetailPage() {
  const { newsId } = Route.useParams();
  const navigate = useNavigate();
  const newsQuery = useNewsItem(newsId);
  const news = newsQuery.data;
  const visibility = news?.visibility;
  const location = [visibility?.state, visibility?.district, visibility?.area].filter(Boolean).join(", ");

  return (
    <div>
      <PageHeader
        title={news?.title ?? "News Details"}
        breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "News Management", to: ROUTES.NEWS_ALL }, { label: "Details" }]}
        actions={<Button onClick={() => navigate({ to: "/news/$newsId/edit", params: { newsId } })}><Edit className="mr-2 h-4 w-4" />Edit News</Button>}
      />
      {newsQuery.error && <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">Unable to load news from backend.</div>}
      <div className="grid gap-4 md:grid-cols-4">
        <StatsCard title="Views" value={(news?.views ?? 0).toLocaleString()} icon={Eye} variant="blue" />
        <StatsCard title="Content Type" value={news?.contentType ?? "—"} icon={FileText} variant="green" />
        <StatsCard title="Language" value={news?.language ?? "—"} icon={Globe} variant="amber" />
        <StatsCard title="Channel" value={news?.channel?.name ?? "—"} icon={Radio} variant="violet" />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[360px_1fr]">
        <div className="rounded-lg border bg-card p-4">
          {news?.thumbnail && <img src={news.thumbnail} alt="" className="aspect-video w-full rounded-md object-cover" />}
        </div>
        <div className="rounded-lg border bg-card p-6">
          <dl className="grid gap-4 md:grid-cols-2">
            <Detail label="Title" value={news?.title} />
            <div><dt className="text-xs font-medium uppercase text-muted-foreground">Category</dt><dd className="mt-1">{news?.category && <CategoryBadge category={news.category} />}</dd></div>
            <div><dt className="text-xs font-medium uppercase text-muted-foreground">Status</dt><dd className="mt-1">{news && <StatusBadge status={news.status} />}</dd></div>
            <Detail label="Published On" value={news?.publishedOn} />
            <Detail label="Created By" value={news?.createdBy} />
            <Detail label="Visibility" value={visibility?.type} />
            <Detail label="Location Visibility" value={location || "All India"} />
          </dl>
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value?: string | number }) {
  return <div><dt className="text-xs font-medium uppercase text-muted-foreground">{label}</dt><dd className="mt-1 text-sm font-medium">{value || "—"}</dd></div>;
}
