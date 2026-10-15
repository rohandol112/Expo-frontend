import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Store, Package, Wrench, Tags } from "lucide-react";
import { AdminListPage } from "@/components/admin/AdminListPage";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { useListings, useDeleteListing } from "@/hooks/api/useListings";
import { listingColumns } from "@/routes/_app/listings";
import type { Listing } from "@/types/listing";
import { ROUTES } from "@/constants/routes.constants";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/offers")({ component: OffersPage });

function OffersPage() {
  const navigate = useNavigate();
  const listingsQuery = useListings({ hasOffer: true });
  const deleteListing = useDeleteListing();
  const [deleteTarget, setDeleteTarget] = useState<Listing | null>(null);

  const offers = listingsQuery.data?.items ?? [];
  const categories = [...new Set(offers.map((l) => l.category))];
  const subCategories = [...new Set(offers.map((l) => l.subcategory).filter(Boolean))];

  return (
    <div>
      <AdminListPage
        title="Offers"
        breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "Offers" }]}
        actions={<Button onClick={() => navigate({ to: ROUTES.LISTINGS_ADD })}><Plus className="mr-2 h-4 w-4" />Add New Listing</Button>}
        stats={[
          { title: "Shop Offers", value: offers.filter((o) => o.type === "Shop").length, icon: Store, variant: "blue" },
          { title: "Product Offers", value: offers.filter((o) => o.type === "Product").length, icon: Package, variant: "green" },
          { title: "Service Offers", value: offers.filter((o) => o.type === "Service").length, icon: Wrench, variant: "amber" },
          { title: "Total Offers", value: offers.length, icon: Tags, variant: "violet" },
        ]}
        data={offers}
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
