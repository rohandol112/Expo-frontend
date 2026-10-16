import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Trophy, Users, TrendingUp, Award, Download } from "lucide-react";
import { AdminListPage } from "@/components/admin/AdminListPage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRewardsLeaderboard } from "@/hooks/api/useWinners";
import { useCompetitionLocations } from "@/hooks/api/useRewardsSettings";
import { useLanguages } from "@/hooks/api/useLanguages";
import { useReportListState } from "@/hooks/useReportListState";
import { winnerService } from "@/services/winner.service";
import { placeLabel } from "@/services/adapters/rewards.adapter";
import { downloadCsv, EXPORT_LIMIT, type CsvColumn } from "@/lib/csv";
import { handleError } from "@/lib/errorHandler";
import { istMonth, istToday } from "@/lib/format";
import type { Winner } from "@/types/referrals";
import type { Column } from "@/components/tables/DataTable";
import { ROUTES } from "@/constants/routes.constants";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/referrals/leaderboard")({ component: LeaderBoardPage });

const MEDAL_COLORS = ["text-amber-500", "text-slate-400", "text-amber-700"];
const PAGE_SIZE = 20;

function columns(): Column<Winner>[] {
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
    { key: "location", header: "Location", cell: (r) => placeLabel(r) },
    { key: "language", header: "Language", cell: (r) => r.language || "—" },
    { key: "total", header: "Total Points", cell: (r) => <span className="font-semibold">{r.totalPoints.toLocaleString()}</span> },
    { key: "reading", header: "Reading", cell: (r) => r.readingPoints.toLocaleString() },
    { key: "quiz", header: "Quiz", cell: (r) => r.quizPoints.toLocaleString() },
    { key: "referral", header: "Referral", cell: (r) => r.referralPoints.toLocaleString() },
    { key: "bonus", header: "Bonus", cell: (r) => r.bonusPoints.toLocaleString() },
    { key: "streak", header: "Streak", cell: (r) => `${r.streakDays} Days` },
  ];
}

const CSV_COLUMNS: CsvColumn<Winner>[] = [
  { header: "Rank", value: (r) => r.rank },
  { header: "Name", value: (r) => r.name },
  { header: "Phone", value: (r) => r.phone },
  { header: "Area, District, State", value: (r) => placeLabel(r) },
  { header: "Language", value: (r) => r.language },
  { header: "Total Points", value: (r) => r.totalPoints },
  { header: "Reading", value: (r) => r.readingPoints },
  { header: "Quiz", value: (r) => r.quizPoints },
  { header: "Referral", value: (r) => r.referralPoints },
  { header: "Bonus", value: (r) => r.bonusPoints },
  { header: "Streak Days", value: (r) => r.streakDays },
];

function LeaderBoardPage() {
  const [period, setPeriod] = useState<"all_time" | "month">("all_time");
  const [month, setMonth] = useState(istMonth());
  const list = useReportListState();
  const locationsQuery = useCompetitionLocations();
  const languagesQuery = useLanguages();
  const [exporting, setExporting] = useState(false);
  const query = {
    period,
    ...(period === "month" ? { month } : {}),
    page: list.page,
    per_page: PAGE_SIZE,
    search: list.search || undefined,
    language: list.dropdownValues.language || undefined,
    location_id: list.dropdownValues.location ? Number(list.dropdownValues.location) : undefined,
  };
  const boardQuery = useRewardsLeaderboard(query);
  const items = boardQuery.data?.items ?? [];
  const top = list.page === 1 ? items[0]?.totalPoints : undefined;
  const pageAverage = items.length ? Math.round(items.reduce((sum, w) => sum + w.totalPoints, 0) / items.length) : 0;

  const exportCsv = async () => {
    setExporting(true);
    try {
      const all = await winnerService.leaderboard({ ...query, page: 1, per_page: EXPORT_LIMIT });
      downloadCsv(`leaderboard-${period === "month" ? month : `all-time-${istToday()}`}`, all.items, CSV_COLUMNS);
    } catch (error) {
      handleError(error, "Export failed");
    } finally {
      setExporting(false);
    }
  };

  return (
    <AdminListPage
      title="Leader Board"
      breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "Referrals & Points", to: ROUTES.REFERRALS }, { label: "Leader Board" }]}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-md border p-0.5">
            {(["all_time", "month"] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => {
                  setPeriod(p);
                  list.setPage(1);
                }}
                className={cn(
                  "rounded px-3 py-1.5 text-sm font-medium transition-colors",
                  period === p ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {p === "all_time" ? "All Time" : "Monthly"}
              </button>
            ))}
          </div>
          {period === "month" && (
            <Input type="month" value={month} max={istMonth()} onChange={(e) => { setMonth(e.target.value || istMonth()); list.setPage(1); }} className="w-[160px]" aria-label="Month" />
          )}
          <Button variant="outline" onClick={exportCsv} disabled={exporting}><Download className="mr-2 h-4 w-4" />{exporting ? "Exporting..." : "Export CSV"}</Button>
        </div>
      }
      stats={[
        { title: "Total Participants", value: (boardQuery.data?.total ?? 0).toLocaleString("en-IN"), subtitle: period === "month" ? "Users with points this month" : "Users with points", icon: Users, variant: "blue" },
        { title: "Top Score", value: top !== undefined ? top.toLocaleString("en-IN") : "—", subtitle: "Highest total points", icon: Award, variant: "amber" },
        { title: "Average Score", value: pageAverage.toLocaleString("en-IN"), subtitle: "Across the users on this page", icon: TrendingUp, variant: "green" },
      ]}
      data={items}
      columns={columns()}
      loading={boardQuery.isLoading}
      error={boardQuery.error ? "Unable to load the leader board." : undefined}
      rowKey={(r) => r.id}
      searchPlaceholder="Search by name, phone number..."
      serverSide
      total={boardQuery.data?.total ?? 0}
      pageSize={PAGE_SIZE}
      page={list.page}
      onPageChange={list.setPage}
      onQueryChange={list.onQueryChange}
      initialDropdownValues={list.dropdownValues}
      dropdowns={[
        { key: "location", placeholder: "Rewards Locations", options: (locationsQuery.data?.items ?? []).map((l) => ({ label: l.title, value: l.id })) },
        { key: "language", placeholder: "Language", options: (languagesQuery.data?.items ?? []).map((l) => ({ label: l.name, value: l.code })) },
      ]}
    />
  );
}
