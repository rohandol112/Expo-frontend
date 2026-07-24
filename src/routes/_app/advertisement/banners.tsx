import { Outlet, createFileRoute, useLocation, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { AdminListPage, type AdminListQuery } from "@/components/admin/AdminListPage";
import { ActionMenu } from "@/components/common/ActionMenu";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { useAdBanners, useDeleteAdBanner } from "@/hooks/api/useAdvertisement";
import { useRegions } from "@/hooks/api/useRegions";
import { BANNER_TYPE_LABELS, type AdBanner } from "@/types/advertisement";
import type { Column } from "@/components/tables/DataTable";
import { ROUTES } from "@/constants/routes.constants";

export const Route = createFileRoute("/_app/advertisement/banners")({ component: BannersPage });

const PAGE_SIZE = 10;
const STATUS_LABELS: Record<string, string> = { active: "Active", inactive: "Inactive" };

function BannersPage() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  if (pathname !== ROUTES.ADS_BANNERS) return <Outlet />;

  const [query, setQuery] = useState<AdminListQuery>({ search: "", page: 1, dropdownValues: {} });
  const deleteBanner = useDeleteAdBanner();
  const regionsQuery = useRegions();
  const states = regionsQuery.data ?? [];
  const districts = useMemo(() => states.flatMap((s) => s.districts), [states]);

  const params = useMemo(
    () => ({
      page: query.page,
      per_page: PAGE_SIZE,
      banner_type: query.dropdownValues.banner_type || undefined,
      status: query.dropdownValues.status || undefined,
      state_id: query.dropdownValues.state ? Number(query.dropdownValues.state) : undefined,
      district_id: query.dropdownValues.district ? Number(query.dropdownValues.district) : undefined,
    }),
    [query],
  );
  const bannersQuery = useAdBanners(params);
  const data = bannersQuery.data;

  const columns: Column<AdBanner>[] = [
    {
      key: "image",
      header: "Image",
      cell: (r) =>
        r.image_url ? (
          <img src={r.image_url} alt="" className="h-10 w-16 rounded object-cover" />
        ) : (
          <div className="h-10 w-16 rounded bg-muted" />
        ),
    },
    { key: "name", header: "Banner Name", cell: (r) => <span className="font-medium">{r.name}</span> },
    { key: "type", header: "Banner Type", cell: (r) => BANNER_TYPE_LABELS[r.banner_type] },
    { key: "external", header: "External Link", cell: (r) => (r.external_link ? "Yes" : "No") },
    {
      key: "visibility",
      header: "Visibility Area",
      cell: (r) => {
        const parts = [
          r.state_ids.length ? `${r.state_ids.length} state(s)` : null,
          r.district_ids.length ? `${r.district_ids.length} district(s)` : null,
          r.area_ids.length ? `${r.area_ids.length} area(s)` : null,
        ].filter(Boolean);
        return <span className="text-xs text-muted-foreground">{parts.length ? parts.join(", ") : "All locations"}</span>;
      },
    },
    { key: "views", header: "Views", cell: (r) => r.views.toLocaleString("en-IN") },
    { key: "order", header: "Order", cell: (r) => r.display_order },
    { key: "status", header: "Status", cell: (r) => <StatusBadge status={STATUS_LABELS[r.status] ?? r.status} /> },
    {
      key: "actions",
      header: "Action",
      cell: (r) => (
        <ActionMenu
          onEdit={() => navigate({ to: "/advertisement/banners/$bannerId/edit", params: { bannerId: String(r.id) } })}
          onDelete={() =>
            deleteBanner.mutate(r.id, {
              onSuccess: () => toast.success("Banner deleted"),
              onError: (err) => toast.error(err instanceof Error ? err.message : "Delete failed"),
            })
          }
        />
      ),
    },
  ];

  return (
    <AdminListPage
      title="Banner List"
      breadcrumbs={[
        { label: "Dashboard", to: ROUTES.DASHBOARD },
        { label: "Advertisement" },
        { label: "Banner List" },
      ]}
      actions={
        <Button onClick={() => navigate({ to: ROUTES.ADS_BANNERS_ADD })}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Banner
        </Button>
      }
      loading={bannersQuery.isLoading}
      error={bannersQuery.error ? "Unable to load banners from backend." : undefined}
      data={data?.items ?? []}
      columns={columns}
      rowKey={(r) => String(r.id)}
      searchPlaceholder="Search banners…"
      dropdowns={[
        {
          key: "banner_type",
          placeholder: "All Types",
          options: [
            { label: "Main Page Slider", value: "main_slider" },
            { label: "In List", value: "in_list" },
            { label: "In Detail Page", value: "in_detail" },
          ],
        },
        { key: "state", placeholder: "All States", options: states.map((s) => ({ label: s.name, value: String(s.id) })) },
        { key: "district", placeholder: "All Districts", options: districts.map((d) => ({ label: d.name, value: String(d.id) })) },
        {
          key: "status",
          placeholder: "All Status",
          options: [
            { label: "Active", value: "active" },
            { label: "Inactive", value: "inactive" },
          ],
        },
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
