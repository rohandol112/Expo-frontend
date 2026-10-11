import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { AdminListPage } from "@/components/admin/AdminListPage";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { useListings, useDeleteListing } from "@/hooks/api/useListings";
import { listingColumns } from "@/routes/_app/listings";
import type { Listing } from "@/types/listing";
import { ROUTES } from "@/constants/routes.constants";
import { toast } from "sonner";

/** All Listings table pre-filtered to one type — backs the Shops/Products/Services nav items. */
export function TypedListingsPage({ type, title }: { type: Listing["type"]; title: string }) {
  const navigate = useNavigate();
  const listingsQuery = useListings({ type });
  const deleteListing = useDeleteListing();
  const [deleteTarget, setDeleteTarget] = useState<Listing | null>(null);
  const listings = listingsQuery.data?.items ?? [];
  const categories = [...new Set(listings.map((l) => l.category))];

  return (
    <div>
      <AdminListPage
        title={title}
        breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "Listings", to: ROUTES.LISTINGS }, { label: title }]}
        actions={<Button onClick={() => navigate({ to: ROUTES.LISTINGS_ADD })}><Plus className="mr-2 h-4 w-4" />Add New Listing</Button>}
        data={listings}
        columns={listingColumns({
          onView: (l) => navigate({ to: "/listings/$listingId", params: { listingId: l.id } }),
          onEdit: (l) => navigate({ to: "/listings/$listingId/edit", params: { listingId: l.id } }),
          onDelete: (l) => setDeleteTarget(l),
        })}
        loading={listingsQuery.isLoading}
        rowKey={(r) => r.id}
        searchPlaceholder={`Search ${title.toLowerCase()}...`}
        dropdowns={[{ key: "category", placeholder: "Category", options: categories.map((c) => ({ label: c, value: c })) }]}
        filter={(row, search, dropdowns) =>
          (!dropdowns.category || row.category === dropdowns.category) &&
          (!search || row.name.toLowerCase().includes(search.toLowerCase()))
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
