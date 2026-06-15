import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Edit, Eye, FileText, Globe, Link2, MapPin, Radio, Video } from "lucide-react";
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
  const visibilityLocation = [visibility?.state, visibility?.district, visibility?.area, visibility?.users].filter(Boolean).join(", ");
  const newsLocation = [news?.location?.state, news?.location?.district, news?.location?.area].filter(Boolean).join(", ");

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
        <div className="space-y-4">
          <div className="rounded-lg border bg-card p-4">
            <p className="mb-3 text-sm font-semibold">Thumbnail</p>
            {news?.thumbnail ? <img src={news.thumbnail} alt={news.title} className="aspect-video w-full rounded-md object-cover" /> : <EmptyMedia label="No thumbnail available" />}
          </div>
          <div className="rounded-lg border bg-card p-4">
            <p className="mb-3 text-sm font-semibold">Video</p>
            {news?.videoUrl ? (
              <video src={news.videoUrl} controls className="aspect-video w-full rounded-md bg-black object-contain" />
            ) : (
              <EmptyMedia label="No video uploaded" />
            )}
          </div>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <dl className="grid gap-4 md:grid-cols-2">
            <Detail label="Title" value={news?.title} />
            <Detail label="Slug" value={news?.slug} />
            <div><dt className="text-xs font-medium uppercase text-muted-foreground">Category</dt><dd className="mt-1">{news?.category && <CategoryBadge category={news.category} />}</dd></div>
            <div><dt className="text-xs font-medium uppercase text-muted-foreground">Status</dt><dd className="mt-1">{news && <StatusBadge status={news.status} />}</dd></div>
            <Detail label="Status Label" value={news?.statusLabel} />
            <Detail label="Published On" value={news?.publishedOn} />
            <Detail label="Scheduled For" value={news?.scheduledFor} />
            <Detail label="Created By" value={news?.createdBy} />
            <Detail label="Created At" value={news?.createdAt} />
            <Detail label="Updated At" value={news?.updatedAt} />
            <Detail label="Source Name" value={news?.sourceName} />
            <Detail label="News Source ID" value={news?.newsSourceId ?? undefined} />
            <Detail label="Visibility" value={visibility?.type} />
            <Detail label="Location Visibility" value={visibilityLocation || "All India"} />
            <Detail label="News Location" value={newsLocation || undefined} />
            <Detail label="Poll" value={news?.hasPoll ? "Enabled" : "Disabled"} />
            <Detail label="Duration" value={news?.durationSeconds ? `${news.durationSeconds}s` : undefined} />
          </dl>
          {news?.sourceLink && (
            <a className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline" href={news.sourceLink} target="_blank" rel="noreferrer">
              <Link2 className="h-4 w-4" /> Open source link
            </a>
          )}
        </div>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <TextPanel title="Description" value={news?.description} />
        <TextPanel title="Bottom Description" value={news?.bottomDescription} />
      </div>
      {news?.poll && (
        <div className="mt-6 rounded-lg border bg-card p-6">
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold"><Radio className="h-4 w-4" /> Voting Poll</p>
          <p className="text-sm font-medium">{news.poll.question}</p>
          <div className="mt-3 grid gap-2 md:grid-cols-2">
            {news.poll.options.map((option, index) => (
              <div key={option.id ?? index} className="rounded-md border px-3 py-2 text-sm">
                {option.text}
                {option.vote_count !== undefined && <span className="ml-2 text-xs text-muted-foreground">({option.vote_count} votes)</span>}
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border bg-card p-6">
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold"><MapPin className="h-4 w-4" /> Tags</p>
          {news?.tags?.length ? (
            <div className="flex flex-wrap gap-2">{news.tags.map((tag) => <span key={tag} className="rounded-md bg-muted px-2 py-1 text-xs font-medium">{tag}</span>)}</div>
          ) : (
            <p className="text-sm text-muted-foreground">No tags available.</p>
          )}
        </div>
        <div className="rounded-lg border bg-card p-6">
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold"><Globe className="h-4 w-4" /> Translations</p>
          {news?.translations?.length ? (
            <div className="space-y-3">
              {news.translations.map((translation, index) => (
                <div key={`${translation.language_code}-${index}`} className="rounded-md border p-3">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">{translation.language_code || "Translation"}</p>
                  <p className="mt-1 text-sm font-medium">{translation.title || "—"}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{translation.description || "No description"}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No translations available.</p>
          )}
        </div>
      </div>
      {news?.rejectionReason && <TextPanel title="Rejection Reason" value={news.rejectionReason} className="mt-6" />}
    </div>
  );
}

function Detail({ label, value }: { label: string; value?: string | number }) {
  return <div><dt className="text-xs font-medium uppercase text-muted-foreground">{label}</dt><dd className="mt-1 text-sm font-medium">{value || "—"}</dd></div>;
}

function TextPanel({ title, value, className }: { title: string; value?: string | null; className?: string }) {
  return (
    <div className={["rounded-lg border bg-card p-6", className].filter(Boolean).join(" ")}>
      <p className="mb-3 flex items-center gap-2 text-sm font-semibold"><FileText className="h-4 w-4" /> {title}</p>
      <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{value || "No content available."}</p>
    </div>
  );
}

function EmptyMedia({ label }: { label: string }) {
  return (
    <div className="flex aspect-video w-full items-center justify-center rounded-md border bg-muted/40 text-sm text-muted-foreground">
      <Video className="mr-2 h-4 w-4" /> {label}
    </div>
  );
}
