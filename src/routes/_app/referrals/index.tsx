import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Area, AreaChart, Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Users, Coins, Gift, UserCheck } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { FilterBar } from "@/components/common/FilterBar";
import { StatsGrid } from "@/components/admin/StatsGrid";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAudienceFilters } from "@/hooks/useAudienceFilters";
import { useRewardsOverview } from "@/hooks/api/useRewardsOverview";
import { trendSubtitle } from "@/services/adapters/rewards.adapter";
import { formatDate } from "@/lib/format";
import { ROUTES } from "@/constants/routes.constants";

export const Route = createFileRoute("/_app/referrals/")({ component: ReferralsOverviewPage });

const ALL = "__all__";

const POINT_SOURCES = [
  { label: "All Point Sources", value: ALL },
  { label: "Reading", value: "reading" },
  { label: "Quiz", value: "quiz" },
  { label: "Referral", value: "referral" },
  { label: "Streak", value: "streak" },
  { label: "Daily Tasks", value: "task" },
  { label: "Welcome Bonus", value: "welcome" },
  { label: "Bonus", value: "bonus" },
  { label: "Adjustments", value: "adjustment" },
];

function ChartCard({ title, description, children, action }: { title: string; description: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <Card className="p-5">
      <div className="mb-4 flex items-start justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {action}
      </div>
      <div className="h-64">{children}</div>
    </Card>
  );
}

const number = (n: number) => n.toLocaleString("en-IN");

function ReferralsOverviewPage() {
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [range, setRange] = useState({ from: "", to: "" });
  const [source, setSource] = useState(ALL);
  const { dropdowns, params } = useAudienceFilters(filters);
  const overviewQuery = useRewardsOverview({
    ...params,
    from: range.from || undefined,
    to: range.to || undefined,
    ...(source !== ALL ? { source } : {}),
  });
  const data = overviewQuery.data;

  // Picking a parent region clears the levels under it.
  const setFilter = (key: string, value: string) =>
    setFilters((prev) => {
      const next = { ...prev, [key]: value === ALL ? "" : value };
      if (key === "state") {
        next.district = "";
        next.area = "";
      }
      if (key === "district") next.area = "";
      return next;
    });

  const stats = data?.stats;
  const period = data ? `${formatDate(data.from)} – ${formatDate(data.to)}` : "";

  return (
    <div>
      <PageHeader
        title="Referrals & Points Overview"
        description="Get an overview of user points, quiz participation, referral growth and user streaks."
        breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "Referrals & Points", to: ROUTES.REFERRALS }, { label: "Overview" }]}
      />
      <FilterBar
        searchPlaceholder="Search..."
        showDateRange
        onDateRangeChange={setRange}
        dropdowns={dropdowns.map((d) => ({
          ...d,
          options: [{ label: `All ${d.placeholder}`, value: ALL }, ...d.options],
          value: filters[d.key] || ALL,
          onChange: (v: string) => setFilter(d.key, v),
        }))}
        onReset={() => setFilters({})}
      />
      {overviewQuery.error && (
        <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">Unable to load the overview.</div>
      )}
      {period && <p className="mb-3 text-sm text-muted-foreground">Showing {period} (default: last 30 days), compared with the period before it.</p>}
      <StatsGrid
        items={[
          { title: "Total Users Earning Points", value: number(stats?.usersEarningPoints.value ?? 0), subtitle: stats ? trendSubtitle(stats.usersEarningPoints, "Users who earned points") : undefined, icon: UserCheck, variant: "rose" },
          { title: "Total Points Earned", value: number(stats?.pointsEarned.value ?? 0), subtitle: stats ? trendSubtitle(stats.pointsEarned, "Total points earned by users") : undefined, icon: Coins, variant: "blue" },
          { title: "Total Points Redeemed", value: number(stats?.pointsRedeemed.value ?? 0), subtitle: stats ? trendSubtitle(stats.pointsRedeemed, "Points converted to rewards") : undefined, icon: Gift, variant: "green" },
          { title: "Total Registered Users", value: number(stats?.registeredUsers.value ?? 0), subtitle: stats ? trendSubtitle(stats.registeredUsers, "All app users") : undefined, icon: Users, variant: "amber" },
        ]}
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard
          title="Quiz Participants"
          description={`Users who played the daily quiz · ${number(data?.quizParticipants.total ?? 0)} total, ${number(data?.quizParticipants.averageDaily ?? 0)} a day`}
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data?.quizParticipants.series ?? []}>
              <defs>
                <linearGradient id="quizGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#dc2626" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={24} />
              <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip />
              <Area type="monotone" dataKey="participants" stroke="#dc2626" fill="url(#quizGradient)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard
          title="Referral Users"
          description={`New users who joined with a referral code · ${number(data?.referralUsers.total ?? 0)} total`}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data?.referralUsers.series ?? []}>
              <XAxis dataKey="date" tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={24} />
              <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="referrals" fill="#f97316" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard
          title="Streak Users (Day Wise)"
          description={`Users on each day of a live streak today${data?.streakUsers.moreThan30 ? ` · ${number(data.streakUsers.moreThan30)} more on 30+ days` : ""}`}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data?.streakUsers.series ?? []}>
              <XAxis dataKey="day" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="users" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard
          title="Total User Points"
          description="Points balance of all users, day by day"
          action={
            <Select value={source} onValueChange={setSource}>
              <SelectTrigger className="w-[170px] shrink-0"><SelectValue /></SelectTrigger>
              <SelectContent>
                {POINT_SOURCES.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
          }
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data?.totalPoints.series ?? []}>
              <defs>
                <linearGradient id="pointsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={24} />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip />
              <Area type="monotone" dataKey="points" stroke="#7c3aed" fill="url(#pointsGradient)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
