import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, BookOpen, Calendar, Clock, Download, Gift, HelpCircle, MapPin, Trophy, Users } from "lucide-react";
import { Bar, CartesianGrid, Cell, ComposedChart, Legend, Line, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useUserAnalytics } from "@/hooks/api/useUserAnalytics";
import { ROUTES } from "@/constants/routes.constants";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/referrals/winners/$userId/analytics")({ component: UserAnalyticsPage });

type Series = "all" | "reading" | "quiz" | "bonus" | "referral";

const SERIES_COLORS = {
  reading: "#2563eb",
  quiz: "#7c3aed",
  bonus: "#f59e0b",
  referral: "#16a34a",
  total: "#1e3a8a",
};

function StatTile({ icon: Icon, label, value, tone }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string | number; tone: string }) {
  return (
    <Card className="flex items-center gap-3 p-4">
      <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", tone)}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-lg font-semibold leading-tight">{value}</p>
      </div>
    </Card>
  );
}

function UserAnalyticsPage() {
  const { userId } = Route.useParams();
  const navigate = useNavigate();
  const analyticsQuery = useUserAnalytics(userId);
  const data = analyticsQuery.data;
  const [series, setSeries] = useState<Series>("all");
  const [month, setMonth] = useState("2026-09");

  const showSeries = (key: Exclude<Series, "all">) => series === "all" || series === key;

  if (!analyticsQuery.isLoading && !data) {
    return (
      <div>
        <PageHeader title="User Analytics" breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "Referrals & Points", to: ROUTES.REFERRALS }, { label: "Winners", to: ROUTES.REFERRALS_WINNERS }, { label: "User Analytics" }]} />
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">User not found.</div>
      </div>
    );
  }

  const pieData = data
    ? [
        { name: "Reading Points", value: data.readingPoints, color: SERIES_COLORS.reading },
        { name: "Quiz Points", value: data.quizPoints, color: SERIES_COLORS.quiz },
        { name: "Bonus Points", value: data.bonusPoints, color: SERIES_COLORS.bonus },
        { name: "Referral Points", value: data.referralPoints, color: SERIES_COLORS.referral },
      ]
    : [];

  const pillOptions: { key: Series; label: string }[] = [
    { key: "all", label: "All Points" },
    { key: "reading", label: "Reading" },
    { key: "quiz", label: "Quiz" },
    { key: "bonus", label: "Bonus" },
    { key: "referral", label: "Referral" },
  ];

  return (
    <div>
      <PageHeader
        title="User Analytics"
        breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "Referrals & Points", to: ROUTES.REFERRALS }, { label: "Winners", to: ROUTES.REFERRALS_WINNERS }, { label: "User Analytics" }]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={() => navigate({ to: ROUTES.REFERRALS_WINNERS })}><ArrowLeft className="mr-2 h-4 w-4" />Back to Winners</Button>
            <Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="w-[170px]" aria-label="Month" />
            <Button onClick={() => toast.success("Analytics refreshed")}>Apply</Button>
            <Button variant="outline" onClick={() => toast.info("Export coming soon")}><Download className="mr-2 h-4 w-4" />Export</Button>
          </div>
        }
      />

      {data && (
        <>
          <Card className="mb-6 flex flex-wrap items-center gap-6 p-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
              {data.name.split(" ").map((p) => p[0]).join("").slice(0, 2)}
            </div>
            <div className="min-w-[200px]">
              <div className="flex items-center gap-2">
                <p className="text-lg font-semibold">{data.name}</p>
                <StatusBadge status={data.status} />
              </div>
              <p className="text-sm text-muted-foreground">{data.phone}</p>
            </div>
            <div className="grid flex-1 grid-cols-2 gap-x-6 gap-y-2 text-sm md:grid-cols-4">
              <span className="flex items-center gap-2"><HelpCircle className="h-4 w-4 text-muted-foreground" /> Language: {data.language}</span>
              <span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" /> {data.location}</span>
              <span className="flex items-center gap-2"><Calendar className="h-4 w-4 text-muted-foreground" /> Member Since {data.memberSince}</span>
              <span className="flex items-center gap-2"><Clock className="h-4 w-4 text-muted-foreground" /> Last Active {data.lastActiveAt}</span>
            </div>
          </Card>

          <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
            <StatTile icon={Trophy} label="Total Points" value={data.totalPoints.toLocaleString()} tone="bg-amber-50 text-amber-600" />
            <StatTile icon={BookOpen} label="Reading Points" value={data.readingPoints.toLocaleString()} tone="bg-blue-50 text-blue-600" />
            <StatTile icon={HelpCircle} label="Quiz Points" value={data.quizPoints.toLocaleString()} tone="bg-violet-50 text-violet-600" />
            <StatTile icon={Gift} label="Bonus Points" value={data.bonusPoints.toLocaleString()} tone="bg-orange-50 text-orange-600" />
            <StatTile icon={Users} label="Referral Points" value={data.referralPoints.toLocaleString()} tone="bg-pink-50 text-pink-600" />
            <StatTile icon={Gift} label="Gift Request" value={`${data.giftRequestsCount}`} tone="bg-red-50 text-red-600" />
          </div>

          <div className="grid gap-4 xl:grid-cols-[1fr_340px]">
            <Card className="p-5">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-semibold">Day Wise Points Earned</h3>
                  <p className="text-sm text-muted-foreground">Breakdown of points earned by this user each day for September 2026</p>
                </div>
                <div className="flex flex-wrap gap-1">
                  {pillOptions.map((p) => (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => setSeries(p.key)}
                      className={cn(
                        "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                        series === p.key ? "border-primary bg-primary text-primary-foreground" : "hover:bg-accent",
                      )}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={data.dayWisePoints}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} interval={2} />
                    <YAxis tickLine={false} axisLine={false} />
                    <Tooltip />
                    <Legend />
                    {showSeries("reading") && <Bar dataKey="reading" stackId="p" fill={SERIES_COLORS.reading} name="Reading" />}
                    {showSeries("quiz") && <Bar dataKey="quiz" stackId="p" fill={SERIES_COLORS.quiz} name="Quiz" />}
                    {showSeries("bonus") && <Bar dataKey="bonus" stackId="p" fill={SERIES_COLORS.bonus} name="Bonus" />}
                    {showSeries("referral") && <Bar dataKey="referral" stackId="p" fill={SERIES_COLORS.referral} name="Referral" />}
                    {series === "all" && (
                      <Line
                        type="monotone"
                        dataKey={(d: { reading: number; quiz: number; bonus: number; referral: number }) => d.reading + d.quiz + d.bonus + d.referral}
                        stroke={SERIES_COLORS.total}
                        strokeWidth={2}
                        dot={false}
                        name="Total Points"
                      />
                    )}
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-5">
              <h3 className="text-base font-semibold">Points Summary</h3>
              <p className="mb-2 text-sm text-muted-foreground">Share of total points by source</p>
              <div className="relative h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                      {pieData.map((d) => <Cell key={d.name} fill={d.color} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-lg font-semibold">{data.totalPoints.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Total Points</p>
                </div>
              </div>
              <div className="mt-2 space-y-1.5 text-sm">
                {pieData.map((d) => (
                  <div key={d.name} className="flex items-center justify-between">
                    <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />{d.name}</span>
                    <span className="font-medium">{d.value.toLocaleString()} ({((d.value / data.totalPoints) * 100).toFixed(1)}%)</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <Card className="mt-4 p-5">
            <h3 className="mb-3 text-base font-semibold">Recent Activity (Last 10)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs uppercase text-muted-foreground">
                    <th className="py-2 pr-4 font-medium">#</th>
                    <th className="py-2 pr-4 font-medium">Date &amp; Time</th>
                    <th className="py-2 pr-4 font-medium">Activity</th>
                    <th className="py-2 pr-4 font-medium">Points</th>
                    <th className="py-2 font-medium">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentActivity.map((a, i) => (
                    <tr key={a.id} className="border-b last:border-0">
                      <td className="py-2.5 pr-4">{i + 1}</td>
                      <td className="whitespace-nowrap py-2.5 pr-4 text-muted-foreground">{a.dateTime}</td>
                      <td className="py-2.5 pr-4">{a.activity}</td>
                      <td className="py-2.5 pr-4 font-medium text-emerald-600">+{a.points}</td>
                      <td className="py-2.5">
                        <span className="rounded-full border px-2 py-0.5 text-xs font-medium">{a.type}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
