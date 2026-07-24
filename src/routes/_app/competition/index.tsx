import { Link, createFileRoute } from "@tanstack/react-router";
import { CalendarCheck, CalendarClock, Eye, Image, MapPin, ThumbsUp, Users, Vote } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatsGrid } from "@/components/admin/StatsGrid";
import { SectionCard } from "@/components/admin/SectionCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { useCompetitionStats, useLeaderboard } from "@/hooks/api/useCompetition";
import { ROUTES } from "@/constants/routes.constants";

export const Route = createFileRoute("/_app/competition/")({ component: CompetitionOverviewPage });

function formatDate(value: string | null) {
  if (!value) return "Not set";
  return new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

function CompetitionOverviewPage() {
  const statsQuery = useCompetitionStats();
  const topQuery = useLeaderboard({ per_page: 5 });
  const stats = statsQuery.data;
  const top = topQuery.data;

  const now = Date.now();
  const votingStarted = stats?.voting_starts_at ? new Date(stats.voting_starts_at).getTime() <= now : false;
  const votingEnded = stats?.voting_ends_at ? new Date(stats.voting_ends_at).getTime() < now : false;
  const phase = !stats?.is_active ? "Inactive" : votingEnded ? "Ended" : votingStarted ? "Voting Live" : "Registration";

  return (
    <div>
      <PageHeader
        title="Competition Overview"
        breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "Competition" }]}
        actions={
          <div className="flex items-center gap-3">
            <StatusBadge status={phase === "Voting Live" ? "Active" : phase === "Inactive" ? "Inactive" : phase} />
            <Button asChild variant="outline">
              <Link to={ROUTES.COMPETITION_SETTINGS}>Settings</Link>
            </Button>
          </div>
        }
      />

      {statsQuery.error && (
        <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          Unable to load competition stats from backend.
        </div>
      )}

      <StatsGrid
        items={[
          { title: "Total Participants", value: stats?.total_participants ?? 0, subtitle: `${stats?.approved_participants ?? 0} approved`, icon: Users, variant: "blue" },
          { title: "Total Votes", value: stats?.total_votes ?? 0, subtitle: `${stats?.votes_today ?? 0} today`, icon: ThumbsUp, variant: "green" },
          { title: "Total Views", value: stats?.total_views ?? 0, subtitle: "pandal page views", icon: Eye, variant: "pink" },
          { title: "Pending Approvals", value: stats?.pending_participants ?? 0, subtitle: `${stats?.rejected_participants ?? 0} rejected`, icon: Vote, variant: "amber" },
          { title: "Banners In Review", value: stats?.banners_in_review ?? 0, subtitle: `${stats?.banners_ai_uncertain ?? 0} need manual review`, icon: Image, variant: "violet" },
        ]}
      />

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <SectionCard title="Voting Period">
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <CalendarClock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Starts:</span>
              <span className="font-medium">{formatDate(stats?.voting_starts_at ?? null)}</span>
              {votingStarted && <StatusBadge status="Active" />}
            </div>
            <div className="flex items-center gap-3">
              <CalendarCheck className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Ends:</span>
              <span className="font-medium">{formatDate(stats?.voting_ends_at ?? null)}</span>
              {votingEnded && <StatusBadge status="Inactive" />}
            </div>
          </div>
        </SectionCard>
        <SectionCard title="Quick Links">
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm"><Link to={ROUTES.COMPETITION_PARTICIPANTS}>View all participants</Link></Button>
            <Button asChild variant="outline" size="sm"><Link to={ROUTES.COMPETITION_LEADERBOARD}>Full leaderboard</Link></Button>
            <Button asChild variant="outline" size="sm"><Link to={ROUTES.COMPETITION_BANNER_REVIEW}>Banner review queue</Link></Button>
            <Button asChild variant="outline" size="sm"><Link to={ROUTES.COMPETITION_AI_CALLING}>AI calling campaign</Link></Button>
          </div>
        </SectionCard>
      </div>

      <SectionCard
        title="Top 5 Participants (Overall)"
        action={
          <Button asChild variant="outline" size="sm">
            <Link to={ROUTES.COMPETITION_LEADERBOARD}>View Full Leaderboard →</Link>
          </Button>
        }
      >
        {topQuery.isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : (top?.items.length ?? 0) === 0 ? (
          <p className="text-sm text-muted-foreground">No approved participants yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase text-muted-foreground">
                  <th className="py-2 pr-4">Rank</th>
                  <th className="py-2 pr-4">Participant / Pandal</th>
                  <th className="py-2 pr-4">Area</th>
                  <th className="py-2 pr-4">Votes</th>
                  <th className="py-2">Share</th>
                </tr>
              </thead>
              <tbody>
                {top?.items.map((item) => (
                  <tr key={item.id} className="border-b last:border-0">
                    <td className="py-3 pr-4 font-semibold">{item.rank <= 3 ? ["🥇", "🥈", "🥉"][item.rank - 1] : item.rank}</td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-3">
                        {item.cover_photo_url ? (
                          <img src={item.cover_photo_url} alt="" className="h-9 w-12 rounded object-cover" />
                        ) : (
                          <div className="h-9 w-12 rounded bg-muted" />
                        )}
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {[item.area_name, item.district_name].filter(Boolean).join(", ")}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-4">{item.area_name ?? "—"}</td>
                    <td className="py-3 pr-4 font-medium">{item.total_votes.toLocaleString("en-IN")}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-24 overflow-hidden rounded bg-muted">
                          <div className="h-full bg-primary" style={{ width: `${Math.min(100, item.percentage)}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground">{item.percentage}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      <div className="mt-6">
        <SectionCard title="Area-wise Statistics" action={<MapPin className="h-4 w-4 text-muted-foreground" />}>
          {(stats?.area_stats?.length ?? 0) === 0 ? (
            <p className="text-sm text-muted-foreground">No approved participants yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs uppercase text-muted-foreground">
                    <th className="py-2 pr-4">Area</th>
                    <th className="py-2 pr-4">District</th>
                    <th className="py-2 pr-4">Participants</th>
                    <th className="py-2">Votes</th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.area_stats.map((a) => (
                    <tr key={`${a.area_id}-${a.area_name}`} className="border-b last:border-0">
                      <td className="py-2.5 pr-4 font-medium">{a.area_name ?? "—"}</td>
                      <td className="py-2.5 pr-4 text-muted-foreground">{a.district_name ?? "—"}</td>
                      <td className="py-2.5 pr-4">{a.participants.toLocaleString("en-IN")}</td>
                      <td className="py-2.5 font-medium">{a.votes.toLocaleString("en-IN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
