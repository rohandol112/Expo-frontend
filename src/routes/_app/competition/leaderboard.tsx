import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Medal, ThumbsUp, Trophy, Users } from "lucide-react";
import { AdminListPage, type AdminListQuery } from "@/components/admin/AdminListPage";
import { useLeaderboard } from "@/hooks/api/useCompetition";
import { useRegions } from "@/hooks/api/useRegions";
import type { LeaderboardItem } from "@/types/competitionAdmin";
import type { Column } from "@/components/tables/DataTable";
import { ROUTES } from "@/constants/routes.constants";

export const Route = createFileRoute("/_app/competition/leaderboard")({ component: LeaderboardPage });

const PAGE_SIZE = 10;

function LeaderboardPage() {
  const [query, setQuery] = useState<AdminListQuery>({ search: "", page: 1, dropdownValues: {} });
  const regionsQuery = useRegions();
  const states = regionsQuery.data ?? [];
  const districts = useMemo(() => states.flatMap((s) => s.districts), [states]);
  const areas = useMemo(() => districts.flatMap((d) => d.areas), [districts]);

  const params = useMemo(
    () => ({
      page: query.page,
      per_page: PAGE_SIZE,
      state_id: query.dropdownValues.state ? Number(query.dropdownValues.state) : undefined,
      district_id: query.dropdownValues.district ? Number(query.dropdownValues.district) : undefined,
      area_id: query.dropdownValues.area ? Number(query.dropdownValues.area) : undefined,
    }),
    [query],
  );
  const leaderboardQuery = useLeaderboard(params);
  const data = leaderboardQuery.data;

  const columns: Column<LeaderboardItem>[] = [
    {
      key: "rank",
      header: "Rank",
      cell: (r) => <span className="font-semibold">{r.rank <= 3 ? ["🥇", "🥈", "🥉"][r.rank - 1] : r.rank}</span>,
    },
    {
      key: "name",
      header: "Participant / Pandal",
      cell: (r) => (
        <div className="flex items-center gap-3">
          {r.cover_photo_url ? (
            <img src={r.cover_photo_url} alt="" className="h-9 w-12 rounded object-cover" />
          ) : (
            <div className="h-9 w-12 rounded bg-muted" />
          )}
          <div>
            <p className="font-medium">{r.name}</p>
            <p className="text-xs text-muted-foreground">{[r.area_name, r.district_name].filter(Boolean).join(", ")}</p>
          </div>
        </div>
      ),
    },
    { key: "contact", header: "Contact Name", cell: (r) => r.contact_name || "—" },
    { key: "phone", header: "Contact Number", cell: (r) => r.contact_phone || "—" },
    {
      key: "location",
      header: "Area (State, District, Area)",
      cell: (r) => (
        <span className="text-xs text-muted-foreground">
          {[r.state_name, r.district_name, r.area_name].filter(Boolean).join(" › ") || "—"}
        </span>
      ),
    },
    {
      key: "votes",
      header: "Total Votes",
      cell: (r) => <span className="font-semibold">{r.total_votes.toLocaleString("en-IN")}</span>,
    },
    {
      key: "share",
      header: "Share",
      cell: (r) => (
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-20 overflow-hidden rounded bg-muted">
            <div className="h-full bg-primary" style={{ width: `${Math.min(100, r.percentage)}%` }} />
          </div>
          <span className="text-xs text-muted-foreground">{r.percentage}%</span>
        </div>
      ),
    },
  ];

  return (
    <AdminListPage
      title="Full Leaderboard"
      breadcrumbs={[
        { label: "Dashboard", to: ROUTES.DASHBOARD },
        { label: "Competition", to: ROUTES.COMPETITION },
        { label: "Leaderboard" },
      ]}
      loading={leaderboardQuery.isLoading}
      error={leaderboardQuery.error ? "Unable to load leaderboard from backend." : undefined}
      stats={[
        { title: "Participants Ranked", value: data?.total ?? 0, icon: Users, variant: "blue" },
        { title: "Total Votes", value: (data?.total_votes ?? 0).toLocaleString("en-IN"), icon: ThumbsUp, variant: "green" },
        { title: "Leader", value: data?.items[0]?.name ?? "—", icon: Trophy, variant: "amber" },
        { title: "Leader Votes", value: (data?.items[0]?.total_votes ?? 0).toLocaleString("en-IN"), icon: Medal, variant: "violet" },
      ]}
      data={data?.items ?? []}
      columns={columns}
      rowKey={(r) => String(r.id)}
      searchPlaceholder="Search is not applied to leaderboard"
      dropdowns={[
        { key: "state", placeholder: "State", options: states.map((s) => ({ label: s.name, value: String(s.id) })) },
        { key: "district", placeholder: "District", options: districts.map((d) => ({ label: d.name, value: String(d.id) })) },
        { key: "area", placeholder: "Area", options: areas.map((a) => ({ label: a.name, value: String(a.id) })) },
      ]}
      serverSide
      total={data?.total ?? 0}
      pageSize={PAGE_SIZE}
      page={query.page}
      onPageChange={(page) => setQuery((q) => ({ ...q, page }))}
      onQueryChange={setQuery}
    />
  );
}
