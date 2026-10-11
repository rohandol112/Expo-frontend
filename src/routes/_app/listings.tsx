import { Outlet, createFileRoute, useLocation, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Download, Plus, Store, Package, Wrench, ListChecks } from "lucide-react";
import { AdminListPage } from "@/components/admin/AdminListPage";
import { ActionMenu } from "@/components/common/ActionMenu";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { useListings, useListingStats, useDeleteListing } from "@/hooks/api/useListings";
import type { Listing } from "@/types/listing";
import type { Column } from "@/components/tables/DataTable";
import { ROUTES } from "@/constants/routes.constants";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/listings")({ component: ListingsPage });

export function listingLocationLabel(listing: Listing) {
  const parts = [listing.location.area, listing.location.district, listing.location.state].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : "Online";
}

export function ListingTypeBadge({ type }: { type: Listing["type"] }) {
  const styles: Record<Listing["type"], string> = {
    Shop: "bg-blue-50 text-blue-700 border-blue-200",
    Product: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Service: "bg-violet-50 text-violet-700 border-violet-200",
  };
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles[type]}`}>{type}</span>;
}

export function listingColumns(handlers?: {
  onView: (listing: Listing) => void;
  onEdit: (listing: Listing) => void;
  onDelete: (listing: Listing) => void;
}): Column<Listing>[] {
  return [
    {
      key: "listing",
      header: "Listing Name",
      cell: (r) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-muted text-xs text-muted-foreground">
            No media
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium line-clamp-1">{r.name}</p>
            <p className="text-xs text-muted-foreground line-clamp-1">{r.shortDescription || r.offerMessage || "—"}</p>
          </div>
        </div>
      ),
    },
    { key: "type", header: "Type", cell: (r) => <ListingTypeBadge type={r.type} /> },
    { key: "category", header: "Category", cell: (r) => r.category },
    { key: "sub", header: "Sub Category", cell: (r) => r.subcategory || "—" },
    { key: "location", header: "Location", cell: (r) => <span className="whitespace-nowrap text-sm">{listingLocationLabel(r)}</span> },
    { key: "phone", header: "Phone Number", cell: (r) => <span className="whitespace-nowrap text-sm">{r.phone || "—"}</span> },
    { key: "offer", header: "Offer Message", cell: (r) => <span className="text-sm text-rose-600">{r.offerMessage || "—"}</span> },
    { key: "views", header: "Views", cell: (r) => r.views.toLocaleString() },
    { key: "status", header: "Status", cell: (r) => <StatusBadge status={r.status} /> },
    {
      key: "actions",
      header: "Actions",
      cell: (r) => (
        <ActionMenu
          onView={() => handlers?.onView(r)}
          onEdit={() => handlers?.onEdit(r)}
          onDelete={() => handlers?.onDelete(r)}
        />
      ),
    },
  ];
}

function ListingsPage() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const listingsQuery = useListings();
  const statsQuery = useListingStats();
  const deleteListing = useDeleteListing();
  const [deleteTarget, setDeleteTarget] = useState<Listing | null>(null);
  if (pathname !== ROUTES.LISTINGS) return <Outlet />;

  const listings = listingsQuery.data?.items ?? [];
  const categories = [...new Set(listings.map((l) => l.category))];
  const subCategories = [...new Set(listings.map((l) => l.subcategory).filter(Boolean))];

  return (
    <div>
      <AdminListPage
        title="All Listings"
        breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "Listings" }]}
        actions={
          <>
            <Button variant="outline"><Download className="mr-2 h-4 w-4" />Export</Button>
            <Button onClick={() => navigate({ to: ROUTES.LISTINGS_ADD })}><Plus className="mr-2 h-4 w-4" />Add New Listing</Button>
          </>
        }
        stats={[
          { title: "Total Shops", value: statsQuery.data?.totalShops ?? 0, icon: Store, variant: "blue" },
          { title: "Total Products", value: statsQuery.data?.totalProducts ?? 0, icon: Package, variant: "green" },
          { title: "Total Services", value: statsQuery.data?.totalServices ?? 0, icon: Wrench, variant: "amber" },
          { title: "Total Listings", value: statsQuery.data?.totalListings ?? 0, icon: ListChecks, variant: "violet" },
        ]}
        data={listings}
        columns={listingColumns({
          onView: (l) => navigate({ to: "/listings/$listingId", params: { listingId: l.id } }),
          onEdit: (l) => navigate({ to: "/listings/$listingId/edit", params: { listingId: l.id } }),
          onDelete: (l) => setDeleteTarget(l),
        })}
        loading={listingsQuery.isLoading}
        rowKey={(r) => r.id}
        searchPlaceholder="Search by name, phone number..."
        dropdowns={[
          { key: "type", placeholder: "Listing Type", options: ["Shop", "Product", "Service"].map((s) => ({ label: s, value: s })) },
          { key: "category", placeholder: "Category", options: categories.map((c) => ({ label: c, value: c })) },
          { key: "sub", placeholder: "Sub Category", options: subCategories.map((s) => ({ label: s, value: s })) },
          { key: "status", placeholder: "Status", options: ["Active", "Inactive"].map((s) => ({ label: s, value: s })) },
        ]}
        filter={(row, search, dropdowns) =>
          (!dropdowns.type || row.type === dropdowns.type) &&
          (!dropdowns.category || row.category === dropdowns.category) &&
          (!dropdowns.sub || row.subcategory === dropdowns.sub) &&
          (!dropdowns.status || row.status === dropdowns.status) &&
          (!search || [row.name, row.phone].some((v) => v?.toLowerCase().includes(search.toLowerCase())))
        }
      />
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete listing?"
        description={`This will permanently remove "${deleteTarget?.name}". This action cannot be undone.`}
        confirmLabel="Delete"
        destructive
        onConfirm={async () => {
          if (!deleteTarget) return;
          await deleteListing.mutateAsync(deleteTarget.id);
          toast.success("Listing deleted");
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
