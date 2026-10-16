import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Download, Medal, UserPlus, Users, UserCheck, UserX, Coins } from "lucide-react";
import { AdminListPage } from "@/components/admin/AdminListPage";
import { Button } from "@/components/ui/button";
import { useReferralUsers } from "@/hooks/api/useReferralUsers";
import type { ReferralUser, TrendStat } from "@/types/referrals";
import { useAudienceFilters } from "@/hooks/useAudienceFilters";
import { useReportListState } from "@/hooks/useReportListState";
import { referralUserService } from "@/services/referralUser.service";
import { trendSubtitle } from "@/services/adapters/rewards.adapter";
import { downloadCsv, EXPORT_LIMIT, type CsvColumn } from "@/lib/csv";
import { handleError } from "@/lib/errorHandler";
import { istToday } from "@/lib/format";
import type { Column } from "@/components/tables/DataTable";
import { ROUTES } from "@/constants/routes.constants";

export const Route = createFileRoute("/_app/referrals/users")({ component: ReferralUsersPage });

const MEDAL_COLORS = ["text-amber-500", "text-slate-400", "text-amber-700"];

function RankCell({ rank }: { rank: number }) {
  if (rank <= 3) {
    return (
      <span className="flex items-center gap-1 font-semibold">
        <Medal className={`h-4 w-4 ${MEDAL_COLORS[rank - 1]}`} /> {rank}
      </span>
    );
  }
  return <span>{rank}</span>;
}

function LanguagePill({ language }: { language: string }) {
  const styles: Record<string, string> = {
    Hindi: "bg-amber-50 text-amber-700 border-amber-200",
    English: "bg-blue-50 text-blue-700 border-blue-200",
    Marathi: "bg-violet-50 text-violet-700 border-violet-200",
    Gujarati: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Tamil: "bg-rose-50 text-rose-700 border-rose-200",
  };
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles[language] ?? ""}`}>{language}</span>;
}

function columns(): Column<ReferralUser>[] {
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
    { key: "language", header: "Language", cell: (r) => <LanguagePill language={r.language} /> },
    { key: "code", header: "Referral Code", cell: (r) => <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/5 px-2.5 py-0.5 text-xs font-medium text-primary">{r.referralCode}</span> },
    { key: "total", header: "Total Referred Users", cell: (r) => r.totalReferredUsers },
    { key: "successful", header: "Successful Referrals", cell: (r) => r.successfulReferrals },
    { key: "active", header: "Active Users", cell: (r) => r.activeUsers },
    { key: "pending", header: "Pending", cell: (r) => r.pendingReferrals },
    { key: "uninstalled", header: "Uninstalled Users", cell: (r) => r.uninstalledUsers },
    { key: "points", header: "Total Referred Points", cell: (r) => <span className="font-medium">{r.totalReferredPoints.toLocaleString()}</span> },
  ];
}

const PAGE_SIZE = 20;

const CSV_COLUMNS: CsvColumn<ReferralUser>[] = [
  { header: "Rank", value: (r) => r.rank },
  { header: "Name", value: (r) => r.name },
  { header: "Phone", value: (r) => r.phone },
  { header: "State", value: (r) => r.state },
  { header: "District", value: (r) => r.district },
  { header: "Area", value: (r) => r.area },
  { header: "Language", value: (r) => r.language },
  { header: "Referral Code", value: (r) => r.referralCode },
  { header: "Total Referred", value: (r) => r.totalReferredUsers },
  { header: "Successful", value: (r) => r.successfulReferrals },
  { header: "Pending", value: (r) => r.pendingReferrals },
  { header: "Active", value: (r) => r.activeUsers },
  { header: "Inactive (14 days)", value: (r) => r.uninstalledUsers },
  { header: "Referral Points", value: (r) => r.totalReferredPoints },
];

function ReferralUsersPage() {
  const list = useReportListState();
  const { dropdowns, params } = useAudienceFilters(list.dropdownValues);
  const query = { ...params, page: list.page, per_page: PAGE_SIZE, search: list.search || undefined, from: list.from, to: list.to };
  const usersQuery = useReferralUsers(query);
  const [exporting, setExporting] = useState(false);
  const users = usersQuery.data?.items ?? [];
  const stats = usersQuery.data?.stats;
  const stat = (s: TrendStat | undefined) => (s ? s.value.toLocaleString("en-IN") : "—");
  const sub = (s: TrendStat | undefined, label: string) => (s ? trendSubtitle(s, label) : label);

  const exportCsv = async () => {
    setExporting(true);
    try {
      const all = await referralUserService.list({ ...query, page: 1, per_page: EXPORT_LIMIT });
      downloadCsv(`referral-users-${istToday()}`, all.items, CSV_COLUMNS);
    } catch (error) {
      handleError(error, "Export failed");
    } finally {
      setExporting(false);
    }
  };

  return (
    <AdminListPage
      title="Referral Users"
      breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "Referrals & Points", to: ROUTES.REFERRALS }, { label: "Referral Users" }]}
      actions={<Button variant="outline" onClick={exportCsv} disabled={exporting}><Download className="mr-2 h-4 w-4" />{exporting ? "Exporting..." : "Export CSV"}</Button>}
      stats={[
        { title: "Total Referrer Users", value: stat(stats?.referrers), subtitle: sub(stats?.referrers, "Users who referred at least 1 user"), icon: UserPlus, variant: "blue" },
        { title: "Total Referred Users", value: stat(stats?.referredUsers), subtitle: sub(stats?.referredUsers, "Referred by all referrers"), icon: Users, variant: "green" },
        { title: "Successful Referrals", value: stat(stats?.successfulReferrals), subtitle: sub(stats?.successfulReferrals, "Stayed active, points paid"), icon: UserCheck, variant: "violet" },
        { title: "Active Referred Users", value: stat(stats?.activeReferredUsers), subtitle: sub(stats?.activeReferredUsers, "Opened the app in the last 14 days"), icon: UserCheck, variant: "amber" },
        { title: "Uninstalled Users", value: stat(stats?.inactiveReferredUsers), subtitle: sub(stats?.inactiveReferredUsers, "Not opened in 14 days"), icon: UserX, variant: "rose" },
        { title: "Total Referred Points", value: stat(stats?.referralPoints), subtitle: sub(stats?.referralPoints, "Points earned from referrals"), icon: Coins, variant: "pink" },
      ]}
      data={users}
      columns={columns()}
      loading={usersQuery.isLoading}
      error={usersQuery.error ? "Unable to load referral users." : undefined}
      rowKey={(r) => r.id}
      searchPlaceholder="Search by name, phone number, referral code..."
      showDateRange
      onDateRangeChange={list.onDateRangeChange}
      serverSide
      total={usersQuery.data?.total ?? 0}
      pageSize={PAGE_SIZE}
      page={list.page}
      onPageChange={list.setPage}
      onQueryChange={list.onQueryChange}
      initialDropdownValues={list.dropdownValues}
      dropdowns={dropdowns}
    />
  );
}
