import { Outlet, createFileRoute, useLocation, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CheckCircle2, Clock, Users, XCircle } from "lucide-react";
import { AdminListPage, type AdminListQuery } from "@/components/admin/AdminListPage";
import { ActionMenu } from "@/components/common/ActionMenu";
import { StatusBadge } from "@/components/common/StatusBadge";
import { useCompetitionEntries, useCompetitionStats } from "@/hooks/api/useCompetition";
import { useRegions } from "@/hooks/api/useRegions";
import type { AdminEntryListItem } from "@/types/competitionAdmin";
import type { Column } from "@/components/tables/DataTable";
import { ROUTES } from "@/constants/routes.constants";

export const Route = createFileRoute("/_app/competition/participants")({ component: ParticipantsPage });

const PAGE_SIZE = 10;

const STATUS_LABELS: Record<string, string> = {
  submitted: "In Review",
  approved: "Active",
  rejected: "Rejected",
};

function ParticipantsPage() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  if (pathname !== ROUTES.COMPETITION_PARTICIPANTS) return <Outlet />;

  const [query, setQuery] = useState<AdminListQuery>({ search: "", page: 1, dropdownValues: {} });
  const statsQuery = useCompetitionStats();
  const regionsQuery = useRegions();
  const states = regionsQuery.data ?? [];
  const districts = useMemo(() => states.flatMap((s) => s.districts), [states]);
  const areas = useMemo(() => districts.flatMap((d) => d.areas), [districts]);

  const params = useMemo(
    () => ({
      page: query.page,
      per_page: PAGE_SIZE,
      search: query.search || undefined,
      status: query.dropdownValues.status || undefined,
      district_id: query.dropdownValues.district ? Number(query.dropdownValues.district) : undefined,
      area_id: query.dropdownValues.area ? Number(query.dropdownValues.area) : undefined,
    }),
    [query],
  );
  const entriesQuery = useCompetitionEntries(params);
  const data = entriesQuery.data;
  const stats = statsQuery.data;

  const columns: Column<AdminEntryListItem>[] = [
    {
      key: "name",
      header: "Name / Area",
      cell: (r) => (
        <div className="flex items-center gap-3">
          {r.cover_photo_url ? (
            <img src={r.cover_photo_url} alt="" className="h-10 w-14 rounded object-cover" />
          ) : (
            <div className="h-10 w-14 rounded bg-muted" />
          )}
          <div>
            <p className="font-medium">{r.name}</p>
            <p className="text-xs text-muted-foreground">{[r.area_name, r.district_name].filter(Boolean).join(", ")}</p>
          </div>
        </div>
      ),
    },
    {
      key: "contact",
      header: "Contact Person",
      cell: (r) => (
        <div>
          <p>{r.contact_name || "—"}</p>
          <p className="text-xs text-muted-foreground">{r.contact_phone}</p>
        </div>
      ),
    },
    { key: "committee", header: "Committee / Organization", cell: (r) => r.committee_name || "—" },
    { key: "votes", header: "Votes", cell: (r) => r.total_votes.toLocaleString("en-IN") },
    {
      key: "registered",
      header: "Registered On",
      cell: (r) => new Date(r.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
    },
    { key: "status", header: "Status", cell: (r) => <StatusBadge status={STATUS_LABELS[r.status] ?? r.status} /> },
    {
      key: "actions",
      header: "Action",
      cell: (r) => (
        <ActionMenu
          onView={() => navigate({ to: "/competition/participants/$participantId", params: { participantId: String(r.id) } })}
        />
      ),
    },
  ];

  return (
    <AdminListPage
      title="Participants List"
      breadcrumbs={[
        { label: "Dashboard", to: ROUTES.DASHBOARD },
        { label: "Competition", to: ROUTES.COMPETITION },
        { label: "Participants" },
      ]}
      loading={entriesQuery.isLoading}
      error={entriesQuery.error ? "Unable to load participants from backend." : undefined}
      stats={[
        { title: "Total Entries", value: stats?.total_participants ?? 0, icon: Users, variant: "blue" },
        { title: "Approved", value: stats?.approved_participants ?? 0, icon: CheckCircle2, variant: "green" },
        { title: "Pending Review", value: stats?.pending_participants ?? 0, icon: Clock, variant: "amber" },
        { title: "Rejected", value: stats?.rejected_participants ?? 0, icon: XCircle, variant: "rose" },
      ]}
      data={data?.items ?? []}
      columns={columns}
      rowKey={(r) => String(r.id)}
      searchPlaceholder="Search by mandal, committee or phone..."
      dropdowns={[
        {
          key: "status",
          placeholder: "Status",
          options: [
            { label: "In Review", value: "submitted" },
            { label: "Approved", value: "approved" },
            { label: "Rejected", value: "rejected" },
          ],
        },
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
