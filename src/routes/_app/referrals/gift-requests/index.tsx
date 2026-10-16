import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Clock, Gift, CheckCircle2, XCircle } from "lucide-react";
import { AdminListPage } from "@/components/admin/AdminListPage";
import { StatusBadge } from "@/components/common/StatusBadge";
import { useGiftRequestCounts, useGiftRequests } from "@/hooks/api/useGiftRequests";
import { useReportListState } from "@/hooks/useReportListState";
import { placeLabel } from "@/services/adapters/rewards.adapter";
import type { GiftRequestQuery } from "@/services/giftRequest.service";
import type { GiftRequest } from "@/types/referrals";
import type { Column } from "@/components/tables/DataTable";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes.constants";

export const Route = createFileRoute("/_app/referrals/gift-requests/")({ component: GiftRequestsPage });

const PAGE_SIZE = 20;

function GiftRequestsPage() {
  const navigate = useNavigate();
  const list = useReportListState();
  const status = list.dropdownValues.status as GiftRequestQuery["status"] | undefined;
  const winType = list.dropdownValues.winType as GiftRequestQuery["win_type"] | undefined;
  const requestsQuery = useGiftRequests({
    page: list.page,
    per_page: PAGE_SIZE,
    search: list.search || undefined,
    status: status || undefined,
    win_type: winType || undefined,
    from: list.from,
    to: list.to,
  });
  const countsQuery = useGiftRequestCounts();
  const counts = countsQuery.data;
  const items = requestsQuery.data?.items ?? [];

  const columns: Column<GiftRequest>[] = [
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
    {
      key: "location",
      header: "Location",
      cell: (r) => (
        <div>
          <span className="text-sm">{placeLabel(r)}</span>
          {r.locationTitle && <p className="text-[11px] text-muted-foreground">{r.locationTitle}</p>}
        </div>
      ),
    },
    { key: "gift", header: "Requested Gift", cell: (r) => r.rankOrGift },
    {
      key: "status",
      header: "Status",
      cell: (r) => (
        <div className="flex flex-col items-start gap-1">
          <StatusBadge status={r.status} />
          {r.delivered && <span className="text-[11px] text-emerald-700">Delivered</span>}
        </div>
      ),
    },
    { key: "requestedAt", header: "Requested On", cell: (r) => <span className="whitespace-nowrap text-sm text-muted-foreground">{r.requestedAt}</span> },
    {
      key: "actions",
      header: "Actions",
      cell: (r) => (
        <Button variant="outline" size="sm" onClick={() => navigate({ to: "/referrals/gift-requests/$id", params: { id: r.id } })}>
          View Details
        </Button>
      ),
    },
  ];

  const count = (n: number | undefined) => (n === undefined ? "—" : n.toLocaleString("en-IN"));

  return (
    <AdminListPage
      title="Gift Request"
      breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "Referrals & Points", to: ROUTES.REFERRALS }, { label: "Gift Request" }]}
      stats={[
        { title: "Total Requests", value: count(counts?.total), subtitle: "All gift requests", icon: Gift, variant: "blue" },
        { title: "Pending", value: count(counts?.pending), subtitle: "Awaiting review", icon: Clock, variant: "amber" },
        { title: "Approved", value: count(counts?.approved), subtitle: "Gift approved", icon: CheckCircle2, variant: "green" },
        { title: "Rejected", value: count(counts?.rejected), subtitle: "Gift rejected", icon: XCircle, variant: "rose" },
      ]}
      data={items}
      columns={columns}
      loading={requestsQuery.isLoading}
      error={requestsQuery.error ? "Unable to load gift requests." : undefined}
      rowKey={(r) => r.id}
      searchPlaceholder="Search by name, phone number..."
      showDateRange
      onDateRangeChange={list.onDateRangeChange}
      serverSide
      total={requestsQuery.data?.total ?? 0}
      pageSize={PAGE_SIZE}
      page={list.page}
      onPageChange={list.setPage}
      onQueryChange={list.onQueryChange}
      initialDropdownValues={list.dropdownValues}
      dropdowns={[
        { key: "status", placeholder: "Status", options: [{ label: "Pending", value: "pending" }, { label: "Approved", value: "approved" }, { label: "Rejected", value: "rejected" }] },
        { key: "winType", placeholder: "Gift Type", options: [{ label: "Monthly", value: "monthly" }, { label: "Quiz", value: "quiz" }] },
      ]}
    />
  );
}
