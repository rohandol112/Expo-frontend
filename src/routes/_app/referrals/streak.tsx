import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Download, Flame, UserCheck, Trophy, BarChart3, Gift } from "lucide-react";
import { AdminListPage } from "@/components/admin/AdminListPage";
import { Button } from "@/components/ui/button";
import { useStreakUsers } from "@/hooks/api/useStreakUsers";
import type { StreakUser } from "@/types/referrals";
import { useAudienceFilters } from "@/hooks/useAudienceFilters";
import { useReportListState } from "@/hooks/useReportListState";
import { streakUserService } from "@/services/streakUser.service";
import { downloadCsv, EXPORT_LIMIT, type CsvColumn } from "@/lib/csv";
import { handleError } from "@/lib/errorHandler";
import { istToday } from "@/lib/format";
import type { Column } from "@/components/tables/DataTable";
import { ROUTES } from "@/constants/routes.constants";

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

const PAGE_SIZE = 20;

const CSV_COLUMNS: CsvColumn<StreakUser>[] = [
  { header: "Rank", value: (r) => r.rank },
  { header: "Name", value: (r) => r.name },
  { header: "Phone", value: (r) => r.phone },
  { header: "State", value: (r) => r.state },
  { header: "District", value: (r) => r.district },
  { header: "Area", value: (r) => r.area },
  { header: "Language", value: (r) => r.language },
  { header: "Current Streak (days)", value: (r) => r.currentStreak },
  { header: "Longest Streak (days)", value: (r) => r.longestStreak },
  { header: "Total Active Days", value: (r) => r.totalActiveDays },
  { header: "Last Active", value: (r) => r.lastActiveAt },
  { header: "Streak Points", value: (r) => r.streakPoints },
];

function StreakPage() {
  const list = useReportListState();
  const { dropdowns, params } = useAudienceFilters(list.dropdownValues, { area: true, language: true });
  const query = {
    ...params,
    page: list.page,
    per_page: PAGE_SIZE,
    search: list.search || undefined,
    from: list.from,
    to: list.to,
    streak_range: list.dropdownValues.bucket || undefined,
  };
  const streakQuery = useStreakUsers(query);
  const [exporting, setExporting] = useState(false);
  const users = streakQuery.data?.items ?? [];
  const stats = streakQuery.data?.stats;
  const n = (v: number | undefined) => (v === undefined ? "—" : v.toLocaleString("en-IN"));

  const exportCsv = async () => {
    setExporting(true);
    try {
      const all = await streakUserService.list({ ...query, page: 1, per_page: EXPORT_LIMIT });
      downloadCsv(`streak-users-${istToday()}`, all.items, CSV_COLUMNS);
    } catch (error) {
      handleError(error, "Export failed");
    } finally {
      setExporting(false);
    }
  };

  return (
    <AdminListPage
      title="Streak Details"
      breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "Referrals & Points", to: ROUTES.REFERRALS }, { label: "Streak" }]}
      actions={<Button variant="outline" onClick={exportCsv} disabled={exporting}><Download className="mr-2 h-4 w-4" />{exporting ? "Exporting..." : "Export CSV"}</Button>}
      stats={[
        { title: "Total Streak Users", value: n(stats?.streakUsers), subtitle: "Users with a live streak", icon: Flame, variant: "blue" },
        { title: "Active Streak Users", value: n(stats?.activeToday), subtitle: "Checked in today", icon: UserCheck, variant: "green" },
        { title: "Longest Streak", value: stats ? `${n(stats.longestStreak)} Days` : "—", subtitle: "Current record", icon: Trophy, variant: "amber" },
        { title: "Average Streak", value: stats ? `${Math.round(stats.averageStreak)} Days` : "—", subtitle: "Among users with a live streak", icon: BarChart3, variant: "violet" },
        { title: "Total Streak Points", value: n(stats?.streakPoints), subtitle: list.from || list.to ? "Points in the selected dates" : "Points given so far", icon: Gift, variant: "rose" },
      ]}
      data={users}
      columns={columns()}
      loading={streakQuery.isLoading}
      error={streakQuery.error ? "Unable to load streak users." : undefined}
      rowKey={(r) => r.id}
      searchPlaceholder="Search by name, phone number..."
      showDateRange
      onDateRangeChange={list.onDateRangeChange}
      serverSide
      total={streakQuery.data?.total ?? 0}
      pageSize={PAGE_SIZE}
      page={list.page}
      onPageChange={list.setPage}
      onQueryChange={list.onQueryChange}
      initialDropdownValues={list.dropdownValues}
      dropdowns={[{ key: "bucket", placeholder: "Streak Days", options: STREAK_BUCKETS }, ...dropdowns]}
    />
  );
}
