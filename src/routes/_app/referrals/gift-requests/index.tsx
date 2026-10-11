import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Clock, Gift, CheckCircle2, XCircle } from "lucide-react";
import { AdminListPage } from "@/components/admin/AdminListPage";
import { StatusBadge } from "@/components/common/StatusBadge";
import { useGiftRequests } from "@/hooks/api/useGiftRequests";
import type { GiftRequest } from "@/types/referrals";
import type { Column } from "@/components/tables/DataTable";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes.constants";

export const Route = createFileRoute("/_app/referrals/gift-requests/")({ component: GiftRequestsPage });

function GiftRequestsPage() {
  const navigate = useNavigate();
  const requestsQuery = useGiftRequests();
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
    { key: "location", header: "Location", cell: (r) => <span className="text-sm">{`${r.area}, ${r.district}, ${r.state}`}</span> },
    { key: "gift", header: "Requested Gift", cell: (r) => r.rankOrGift },
    { key: "status", header: "Status", cell: (r) => <StatusBadge status={r.status} /> },
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

  return (
    <AdminListPage
      title="Gift Request"
      breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "Referrals & Points", to: ROUTES.REFERRALS }, { label: "Gift Request" }]}
      stats={[
        { title: "Total Requests", value: items.length, subtitle: "All gift requests", icon: Gift, variant: "blue" },
        { title: "Pending", value: items.filter((i) => i.status === "Pending").length, subtitle: "Awaiting review", icon: Clock, variant: "amber" },
        { title: "Approved", value: items.filter((i) => i.status === "Approved").length, subtitle: "Gift approved", icon: CheckCircle2, variant: "green" },
        { title: "Rejected", value: items.filter((i) => i.status === "Rejected").length, subtitle: "Gift rejected", icon: XCircle, variant: "rose" },
      ]}
      data={items}
      columns={columns}
      loading={requestsQuery.isLoading}
      rowKey={(r) => r.id}
      searchPlaceholder="Search by name, phone number..."
      dropdowns={[
        { key: "status", placeholder: "Status", options: ["Pending", "Approved", "Rejected"].map((s) => ({ label: s, value: s })) },
      ]}
      filter={(row, search, dropdowns) =>
        (!dropdowns.status || row.status === dropdowns.status) &&
        (!search || [row.name, row.phone].some((v) => v.toLowerCase().includes(search.toLowerCase())))
      }
    />
  );
}
