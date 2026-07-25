import { Link, createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  CalendarDays,
  ChevronRight,
  ClipboardCheck,
  ExternalLink,
  Eye,
  MapPin,
  ThumbsUp,
  UserPlus,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCompetitionConfig, useCompetitionStats, useLeaderboard } from "@/hooks/api/useCompetition";
import { useRegions } from "@/hooks/api/useRegions";
import { ROUTES } from "@/constants/routes.constants";

export const Route = createFileRoute("/_app/competition/")({ component: CompetitionOverviewPage });

const nf = (n: number) => n.toLocaleString("en-IN");
const fmtFull = (v: string | null) =>
  v ? new Date(v).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const fmtDM = (v: string | null) => (v ? new Date(v).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "—");
const fmtDateTime = (v: string | null) =>
  v ? new Date(v).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";
const daysBetween = (a: string | null, b: string | null) =>
  a && b ? Math.max(0, Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86_400_000)) : 0;

type Tone = "blue" | "green" | "indigo" | "rose" | "slate" | "amber";
const TONE: Record<Tone, string> = {
  blue: "bg-blue-50 text-blue-700",
  green: "bg-emerald-100 text-emerald-700",
  indigo: "bg-indigo-50 text-indigo-700",
  rose: "bg-rose-50 text-rose-700",
  slate: "bg-slate-100 text-slate-600",
  amber: "bg-amber-50 text-amber-700",
};

function Pill({ label, tone }: { label: string; tone: Tone }) {
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${TONE[tone]}`}>{label}</span>;
}

function CompetitionOverviewPage() {
  const statsQuery = useCompetitionStats();
  const configQuery = useCompetitionConfig();
  const topQuery = useLeaderboard({ per_page: 5 });
  const regionsQuery = useRegions();

  const stats = statsQuery.data;
  const config = configQuery.data;
  const top = topQuery.data;
  const regions = regionsQuery.data ?? [];

  // Location label from the competition's configured targeting.
  const locationLabel = useMemo(() => {
    const districtName = new Map<number, string>();
    const areaName = new Map<number, string>();
    const stateName = new Map<number, string>();
    for (const st of regions) {
      stateName.set(st.id, st.name);
      for (const d of st.districts ?? []) {
        districtName.set(d.id, d.name);
        for (const a of d.areas ?? []) areaName.set(a.id, a.name);
      }
    }
    if (!config) return "";
    const pick = (ids: number[] | undefined, map: Map<number, string>) => (ids ?? []).map((id) => map.get(id)).filter(Boolean) as string[];
    let names = pick(config.target_district_ids, districtName);
    if (names.length === 0) names = pick(config.target_area_ids, areaName);
    if (names.length === 0) names = pick(config.target_state_ids, stateName);
    const uniq = Array.from(new Set(names));
    if (uniq.length === 0) return config.target_scope === "all" ? "All Locations" : "—";
    return uniq.slice(0, 3).join(", ") + (uniq.length > 3 ? ` +${uniq.length - 3}` : "");
  }, [config, regions]);

  const now = Date.now();
  const ts = (v: string | null | undefined) => (v ? new Date(v).getTime() : null);
  const pStart = ts(config?.participation_starts_at);
  const pEnd = ts(config?.participation_ends_at);
  const vStart = ts(config?.voting_starts_at);
  const vEnd = ts(config?.voting_ends_at);

  const compStatus: { label: string; tone: Tone } = !config?.is_active
    ? { label: "INACTIVE", tone: "slate" }
    : vEnd && now >= vEnd
      ? { label: "ENDED", tone: "rose" }
      : pStart && now < pStart
        ? { label: "UPCOMING", tone: "amber" }
        : { label: "ONGOING", tone: "green" };

  const countdown = (end: number | null): string => {
    if (end == null) return "Not set";
    const ms = end - now;
    if (ms <= 0) return "Ended";
    const d = Math.floor(ms / 86_400_000);
    const h = Math.floor((ms % 86_400_000) / 3_600_000);
    return `${String(d).padStart(2, "0")}d ${String(h).padStart(2, "0")}h left`;
  };

  const timeline: { icon: typeof UserPlus; iconClass: string; title: string; when: string | null; pill: { label: string; tone: Tone } }[] = [
    {
      icon: UserPlus,
      iconClass: "bg-blue-50 text-blue-600",
      title: "Registration Started",
      when: config?.participation_starts_at ?? null,
      pill: pStart && now >= pStart ? { label: "Completed", tone: "blue" } : { label: "Upcoming", tone: "slate" },
    },
    {
      icon: UserPlus,
      iconClass: "bg-blue-50 text-blue-600",
      title: "Registration Ends",
      when: config?.participation_ends_at ?? null,
      pill:
        pEnd && now >= pEnd
          ? { label: "Completed", tone: "blue" }
          : pStart && now >= pStart
            ? { label: "Live", tone: "green" }
            : { label: "Upcoming", tone: "slate" },
    },
    {
      icon: ClipboardCheck,
      iconClass: "bg-emerald-50 text-emerald-600",
      title: "Voting Started",
      when: config?.voting_starts_at ?? null,
      pill:
        vEnd && now >= vEnd
          ? { label: "Completed", tone: "blue" }
          : vStart && now >= vStart
            ? { label: "Live", tone: "green" }
            : { label: "Upcoming", tone: "slate" },
    },
    {
      icon: CalendarDays,
      iconClass: "bg-rose-50 text-rose-600",
      title: "Voting Ends",
      when: config?.voting_ends_at ?? null,
      pill: vEnd && now >= vEnd ? { label: "Ended", tone: "rose" } : { label: countdown(vEnd), tone: "indigo" },
    },
  ];

  return (
    <div>
      {/* ---- Header ---- */}
      <nav className="mb-2 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link to={ROUTES.DASHBOARD} className="hover:text-foreground">Dashboard</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link to={ROUTES.COMPETITION} className="hover:text-foreground">Competitions</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">{config?.title ?? "Competition"}</span>
      </nav>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-foreground">{config?.title ?? "Competition"}</h1>
            <Pill label={compStatus.label} tone={compStatus.tone} />
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-rose-500" />
              {locationLabel || "—"}
            </span>
            <span className="flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4" />
              {fmtFull(config?.participation_starts_at ?? null)} - {fmtFull(config?.voting_ends_at ?? null)}
            </span>
          </div>
        </div>
        <Button asChild variant="destructive">
          <Link to={ROUTES.COMPETITION_LEADERBOARD}>
            View Public Page
            <ExternalLink className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      {statsQuery.error && (
        <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          Unable to load competition stats from backend.
        </div>
      )}

      {/* ---- Stat cards + periods ---- */}
      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatTile icon={Users} iconClass="bg-blue-50 text-blue-600" label="Total Participants" value={nf(stats?.total_participants ?? 0)} linkLabel="View all participants" to={ROUTES.COMPETITION_PARTICIPANTS} />
        <StatTile icon={ThumbsUp} iconClass="bg-blue-50 text-blue-600" label="Total Votes" value={nf(stats?.total_votes ?? 0)} linkLabel="View all votes" to={ROUTES.COMPETITION_LEADERBOARD} />
        <StatTile icon={Eye} iconClass="bg-rose-50 text-rose-600" label="Total Views" value={nf(stats?.total_views ?? 0)} linkLabel="View details" to={ROUTES.COMPETITION_PARTICIPANTS} />

        <div className="rounded-lg border bg-card p-5">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <UserPlus className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm text-muted-foreground">Registration Period</p>
              <p className="text-sm font-semibold">
                {fmtDM(config?.participation_starts_at ?? null)} - {fmtFull(config?.participation_ends_at ?? null)}
                <span className="ml-1 font-normal text-muted-foreground">({daysBetween(config?.participation_starts_at ?? null, config?.participation_ends_at ?? null)} Days)</span>
              </p>
            </div>
          </div>
          <div className="mt-4 flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <ClipboardCheck className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm text-muted-foreground">Voting Period</p>
              <p className="text-sm font-semibold">
                {fmtDM(config?.voting_starts_at ?? null)} - {fmtFull(config?.voting_ends_at ?? null)}
                <span className="ml-1 font-normal text-muted-foreground">({daysBetween(config?.voting_starts_at ?? null, config?.voting_ends_at ?? null)} Days)</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ---- Timeline ---- */}
      <div className="mb-6 rounded-lg border bg-card p-6">
        <div className="flex items-start">
          {timeline.map((n, i) => {
            const Icon = n.icon;
            return (
              <div key={n.title} className="flex flex-1 items-start">
                <div className="flex flex-1 flex-col items-center px-1 text-center">
                  <span className={`flex h-14 w-14 items-center justify-center rounded-full ${n.iconClass}`}>
                    <Icon className="h-6 w-6" />
                  </span>
                  <p className="mt-3 text-sm font-semibold">{n.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{fmtDateTime(n.when)}</p>
                  <div className="mt-2">
                    <Pill label={n.pill.label} tone={n.pill.tone} />
                  </div>
                </div>
                {i < timeline.length - 1 && (
                  <div className="relative mt-7 h-px flex-1 bg-border">
                    <span className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-muted-foreground/40" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ---- Top 5 Participants ---- */}
      <div className="rounded-lg border bg-card p-5">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-base font-semibold">Top 5 Participants (Overall)</h2>
          <Button asChild variant="outline" size="sm">
            <Link to={ROUTES.COMPETITION_LEADERBOARD}>View Full Leaderboard →</Link>
          </Button>
        </div>
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
                  <th className="py-2">Percentage</th>
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
                          <p className="text-xs text-muted-foreground">{[item.area_name, item.district_name].filter(Boolean).join(", ")}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-4">{item.area_name ?? "—"}</td>
                    <td className="py-3 pr-4 font-medium">{nf(item.total_votes)}</td>
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
      </div>
    </div>
  );
}

function StatTile({
  icon: Icon,
  iconClass,
  label,
  value,
  linkLabel,
  to,
}: {
  icon: typeof Users;
  iconClass: string;
  label: string;
  value: string;
  linkLabel: string;
  to: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-5">
      <div className="flex items-center gap-3">
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${iconClass}`}>
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold leading-tight">{value}</p>
        </div>
      </div>
      <Link to={to} className="mt-3 inline-block text-sm font-medium text-blue-600 hover:underline">
        {linkLabel} →
      </Link>
    </div>
  );
}
