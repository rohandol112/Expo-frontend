import { Outlet, createFileRoute, useLocation, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { FilterBar } from "@/components/common/FilterBar";
import { SortableList, type SortableColumn } from "@/components/admin/SortableList";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { useBanners, useDeleteBanner, useReorderBanners } from "@/hooks/api/useBanners";
import type { Banner } from "@/types/banner";
import { ROUTES } from "@/constants/routes.constants";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/listings/banners")({ component: BannersPage });

function BannersPage() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const bannersQuery = useBanners();
  const deleteBanner = useDeleteBanner();
  const reorder = useReorderBanners();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Banner | null>(null);
  if (pathname !== ROUTES.LISTINGS_BANNERS) return <Outlet />;

  const banners = bannersQuery.data?.items ?? [];
  const filtered = banners.filter(
    (b) => (!status || b.status === status) && (!search || b.name.toLowerCase().includes(search.toLowerCase())),
  );

  const columns: SortableColumn<Banner>[] = [
    { key: "name", header: "Banner Name", cell: (r) => <span className="font-medium">{r.name}</span> },
    { key: "image", header: "Image", cell: () => <div className="flex h-9 w-14 items-center justify-center rounded bg-muted text-[10px] text-muted-foreground">No image</div> },
    { key: "category", header: "Category", cell: (r) => <span className="text-sm">{r.category}</span> },
    { key: "sub", header: "Sub Category", cell: (r) => <span className="text-sm">{r.subcategory || "—"}</span> },
    { key: "state", header: "State", cell: (r) => <span className="text-sm">{r.state}</span> },
    { key: "district", header: "District", cell: (r) => <span className="text-sm">{r.district}</span> },
    { key: "area", header: "Area", cell: (r) => <span className="text-sm">{r.area}</span> },
    { key: "added", header: "Added Date", cell: (r) => <span className="whitespace-nowrap text-sm text-muted-foreground">{r.createdOn}</span> },
    { key: "sort", header: "Select Order", cell: (r) => r.sortOrder },
    { key: "status", header: "Status", cell: (r) => <StatusBadge status={r.status} /> },
    {
      key: "actions",
      header: "Action",
      cell: (r) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => navigate({ to: "/listings/banners/$bannerId/edit", params: { bannerId: r.id } })}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive"
            onClick={() => setDeleteTarget(r)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Banners"
        description="Manage all banners displayed in the app."
        breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "Listings", to: ROUTES.LISTINGS }, { label: "Banners" }]}
        actions={<Button onClick={() => navigate({ to: ROUTES.LISTINGS_BANNERS_ADD })}><Plus className="mr-2 h-4 w-4" />Add New Banner</Button>}
      />
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search banners..."
        showDateRange={false}
        dropdowns={[{
          key: "status",
          placeholder: "All Status",
          value: status || "all",
          options: [{ label: "All Status", value: "all" }, { label: "Active", value: "Active" }, { label: "Inactive", value: "Inactive" }],
          onChange: (v) => setStatus(v === "all" ? "" : v),
        }]}
      />
      <SortableList
        columns={columns}
        data={filtered}
        rowKey={(r) => r.id}
        loading={bannersQuery.isLoading}
        page={page}
        pageSize={10}
        onPageChange={setPage}
        onReorder={(pageRows) => {
          const otherIds = filtered.filter((_, idx) => idx < (page - 1) * 10 || idx >= page * 10).map((b) => b.id);
          const before = otherIds.filter((id) => filtered.findIndex((b) => b.id === id) < (page - 1) * 10);
          const after = otherIds.filter((id) => filtered.findIndex((b) => b.id === id) >= page * 10);
          reorder.mutate([...before, ...pageRows.map((b) => b.id), ...after]);
        }}
        emptyTitle="No banners found"
      />
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete banner?"
        description={`This will permanently remove "${deleteTarget?.name}". This action cannot be undone.`}
        confirmLabel="Delete"
        destructive
        onConfirm={async () => {
          if (!deleteTarget) return;
          await deleteBanner.mutateAsync(deleteTarget.id);
          toast.success("Banner deleted");
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
