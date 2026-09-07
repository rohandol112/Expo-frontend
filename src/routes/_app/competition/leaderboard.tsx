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

/**
 * Points a participant earned because a banner slot was approved — deliberately
 * shown apart from the votes people cast, which is the whole point of splitting
 * these into their own columns. A zero means the slot was never approved.
 */
function BannerVoteCell({ points }: { points: number }) {
  if (points <= 0) return <span className="text-xs text-muted-foreground">—</span>;
  return (
    <span className="rounded-md bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200">
      +{points.toLocaleString("en-IN")}
    </span>
  );
}

function LeaderboardPage() {
  const [query, setQuery] = useState<AdminListQuery>({ search: "", page: 1, dropdownValues: {} });
  const regionsQuery = useRegions();
  const states = regionsQuery.data ?? [];
  const selectedState = query.dropdownValues.state;
  const selectedDistrict = query.dropdownValues.district;
  // Scoped to the selection above, otherwise choosing a state still lists every
  // district in the country and the two filters contradict each other.
  const districts = useMemo(
    () =>
      selectedState
        ? (states.find((s) => String(s.id) === selectedState)?.districts ?? [])
        : states.flatMap((s) => s.districts),
    [states, selectedState],
  );
  const areas = useMemo(
    () =>
      selectedDistrict
        ? (districts.find((d) => String(d.id) === selectedDistrict)?.areas ?? [])
        : districts.flatMap((d) => d.areas),
    [districts, selectedDistrict],
  );

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
      header: "Selected Location",
      cell: (r) => {
        const parts = [r.state_name, r.district_name, r.area_name].filter(Boolean) as string[];
        if (parts.length === 0) return <span className="text-xs text-muted-foreground">—</span>;
        return (
          <div className="text-xs leading-tight">
            <p className="font-medium text-slate-800">{r.area_name || r.district_name}</p>
            <p className="text-muted-foreground">{parts.join(" › ")}</p>
          </div>
        );
      },
    },
    {
      key: "actual_votes",
      header: "User Votes",
      cell: (r) => <span className="font-semibold">{(r.actual_votes ?? 0).toLocaleString("en-IN")}</span>,
    },
    {
      key: "banner1",
      header: "Banner 1 Vote",
      cell: (r) => <BannerVoteCell points={r.banner1_votes ?? 0} />,
    },
    {
      key: "banner2",
      header: "Banner 2 Vote",
      cell: (r) => <BannerVoteCell points={r.banner2_votes ?? 0} />,
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
