import { createFileRoute } from "@tanstack/react-router";
import { Download, Flame, UserCheck, Trophy, BarChart3, Gift } from "lucide-react";
import { AdminListPage } from "@/components/admin/AdminListPage";
import { Button } from "@/components/ui/button";
import { useStreakUsers } from "@/hooks/api/useStreakUsers";
import type { StreakUser } from "@/types/referrals";
import type { Column } from "@/components/tables/DataTable";
import { ROUTES } from "@/constants/routes.constants";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/referrals/streak")({ component: StreakPage });

const MEDAL_COLORS = ["text-amber-500", "text-slate-400", "text-amber-700"];

function RankCell({ rank }: { rank: number }) {
  if (rank <= 3) {
    return <span className="flex items-center gap-1 font-semibold"><Trophy className={`h-4 w-4 ${MEDAL_COLORS[rank - 1]}`} /> {rank}</span>;
  }
  return <span>{rank}</span>;
}

function columns(): Column<StreakUser>[] {
  return [
    {
      key: "user",
      header: "User Name & Phone Number",
      cell: (r) => (
        <div>
          <p className="text-sm font-medium">{r.name}</p>
          <p className="text-xs text-muted-foreground">{r.phone}</p>
        </div>
      ),
    },
    { key: "rank", header: "Rank", cell: (r) => <RankCell rank={r.rank} /> },
    { key: "state", header: "State", cell: (r) => r.state },
    { key: "district", header: "District", cell: (r) => r.district },
    { key: "area", header: "Area", cell: (r) => r.area },
    { key: "language", header: "Language", cell: (r) => r.language },
    { key: "current", header: "Current Streak", cell: (r) => <span className="flex items-center gap-1 text-orange-600"><Flame className="h-3.5 w-3.5" />{r.currentStreak} Days</span> },
    { key: "longest", header: "Longest Streak", cell: (r) => `${r.longestStreak} Days` },
    { key: "active", header: "Total Active Days", cell: (r) => r.totalActiveDays },
    { key: "lastActive", header: "Last Active Date & Time", cell: (r) => <span className="whitespace-nowrap text-sm text-muted-foreground">{r.lastActiveAt}</span> },
    { key: "points", header: "Streak Points", cell: (r) => <span className="font-medium">{r.streakPoints.toLocaleString()}</span> },
  ];
}

const STREAK_BUCKETS = [
  { label: "1 - 7 days", value: "1-7" },
  { label: "8 - 15 days", value: "8-15" },
  { label: "16 - 30 days", value: "16-30" },
  { label: "31 - 60 days", value: "31-60" },
  { label: "61 - 90 days", value: "61-90" },
  { label: "91+ days", value: "91+" },
];

function inBucket(days: number, bucket: string) {
  if (bucket === "1-7") return days <= 7;
  if (bucket === "8-15") return days >= 8 && days <= 15;
  if (bucket === "16-30") return days >= 16 && days <= 30;
  if (bucket === "31-60") return days >= 31 && days <= 60;
  if (bucket === "61-90") return days >= 61 && days <= 90;
  if (bucket === "91+") return days >= 91;
  return true;
}

function StreakPage() {
  const streakQuery = useStreakUsers();
  const users = streakQuery.data?.items ?? [];

  return (
    <AdminListPage
      title="Streak Details"
      breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "Referrals & Points", to: ROUTES.REFERRALS }, { label: "Streak" }]}
      actions={<Button variant="outline" onClick={() => toast.info("Export coming soon")}><Download className="mr-2 h-4 w-4" />Export CSV</Button>}
      stats={[
        { title: "Total Streak Users", value: "8,420", subtitle: "↑18% · Users with 1+ day streak", icon: Flame, variant: "blue" },
        { title: "Active Streak Users", value: "5,230", subtitle: "↑22% · Users active today", icon: UserCheck, variant: "green" },
        { title: "Longest Streak", value: "365 Days", subtitle: "Current record", icon: Trophy, variant: "amber" },
        { title: "Average Streak", value: "12 Days", subtitle: "Among active users", icon: BarChart3, variant: "violet" },
        { title: "Total Streak Points", value: "2,48,000", subtitle: "Points given this month", icon: Gift, variant: "rose" },
      ]}
      data={users}
      columns={columns()}
      loading={streakQuery.isLoading}
      rowKey={(r) => r.id}
      searchPlaceholder="Search by name, phone number..."
      showDateRange
      dropdowns={[
        { key: "bucket", placeholder: "Streak Days", options: STREAK_BUCKETS },
        { key: "state", placeholder: "State", options: [...new Set(users.map((u) => u.state))].map((s) => ({ label: s, value: s })) },
        { key: "district", placeholder: "District", options: [...new Set(users.map((u) => u.district))].map((d) => ({ label: d, value: d })) },
        { key: "language", placeholder: "Language", options: [...new Set(users.map((u) => u.language))].map((l) => ({ label: l, value: l })) },
      ]}
      filter={(row, search, dropdowns) =>
        (!dropdowns.bucket || inBucket(row.currentStreak, dropdowns.bucket)) &&
        (!dropdowns.state || row.state === dropdowns.state) &&
        (!dropdowns.district || row.district === dropdowns.district) &&
        (!dropdowns.language || row.language === dropdowns.language) &&
        (!search || [row.name, row.phone].some((v) => v.toLowerCase().includes(search.toLowerCase())))
      }
    />
  );
}
