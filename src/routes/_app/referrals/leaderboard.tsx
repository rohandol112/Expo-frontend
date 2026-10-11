import { createFileRoute } from "@tanstack/react-router";
import { Trophy, Users, TrendingUp, Award } from "lucide-react";
import { AdminListPage } from "@/components/admin/AdminListPage";
import { useWinners } from "@/hooks/api/useWinners";
import type { Winner } from "@/types/referrals";
import type { Column } from "@/components/tables/DataTable";
import { ROUTES } from "@/constants/routes.constants";

export const Route = createFileRoute("/_app/referrals/leaderboard")({ component: LeaderBoardPage });

const MEDAL_COLORS = ["text-amber-500", "text-slate-400", "text-amber-700"];

function columns(): Column<Winner & { rank: number }>[] {
  return [
    {
      key: "rank",
      header: "Rank",
      cell: (r) =>
        r.rank <= 3 ? (
          <span className="flex items-center gap-1 font-semibold"><Trophy className={`h-4 w-4 ${MEDAL_COLORS[r.rank - 1]}`} /> {r.rank}</span>
        ) : (
          <span>{r.rank}</span>
        ),
    },
    {
      key: "user",
      header: "User Name & Phone",
      cell: (r) => (
        <div>
          <p className="text-sm font-medium">{r.name}</p>
          <p className="text-xs text-muted-foreground">{r.phone}</p>
        </div>
      ),
    },
    { key: "location", header: "Location", cell: (r) => `${r.area}, ${r.district}, ${r.state}` },
    { key: "language", header: "Language", cell: (r) => r.language },
    { key: "total", header: "Total Points", cell: (r) => <span className="font-semibold">{r.totalPoints.toLocaleString()}</span> },
    { key: "reading", header: "Reading", cell: (r) => r.readingPoints.toLocaleString() },
    { key: "quiz", header: "Quiz", cell: (r) => r.quizPoints.toLocaleString() },
    { key: "referral", header: "Referral", cell: (r) => r.referralPoints.toLocaleString() },
    { key: "streak", header: "Streak", cell: (r) => `${r.streakDays} Days` },
  ];
}

function LeaderBoardPage() {
  const winnersQuery = useWinners();
  const items = winnersQuery.data?.items ?? [];
  const ranked = items.map((w, i) => ({ ...w, rank: i + 1 }));
  const avgScore = items.length ? Math.round(items.reduce((sum, w) => sum + w.totalPoints, 0) / items.length) : 0;

  return (
    <AdminListPage
      title="Leader Board"
      breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "Referrals & Points", to: ROUTES.REFERRALS }, { label: "Leader Board" }]}
      stats={[
        { title: "Total Participants", value: items.length, subtitle: "All-time points ranking", icon: Users, variant: "blue" },
        { title: "Top Score", value: (items[0]?.totalPoints ?? 0).toLocaleString(), subtitle: "Highest total points", icon: Award, variant: "amber" },
        { title: "Average Score", value: avgScore.toLocaleString(), subtitle: "Across all participants", icon: TrendingUp, variant: "green" },
      ]}
      data={ranked}
      columns={columns()}
      loading={winnersQuery.isLoading}
      rowKey={(r) => r.id}
      searchPlaceholder="Search by name, phone number..."
      dropdowns={[
        { key: "language", placeholder: "Language", options: [...new Set(items.map((u) => u.language))].map((l) => ({ label: l, value: l })) },
      ]}
      filter={(row, search, dropdowns) =>
        (!dropdowns.language || row.language === dropdowns.language) &&
        (!search || [row.name, row.phone].some((v) => v.toLowerCase().includes(search.toLowerCase())))
      }
    />
  );
}
