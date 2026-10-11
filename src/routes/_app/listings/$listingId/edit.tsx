import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { ROUTES } from "@/constants/routes.constants";
import { useListing } from "@/hooks/api/useListings";
import { ProductForm, ServiceForm, ShopForm } from "@/routes/_app/listings/add";

export const Route = createFileRoute("/_app/listings/$listingId/edit")({ component: EditListingPage });

function EditListingPage() {
  const { listingId } = Route.useParams();
  const navigate = useNavigate();
  const listingQuery = useListing(listingId);
  const listing = listingQuery.data;
  const onDone = () => navigate({ to: "/listings/$listingId", params: { listingId } });

  return (
    <div>
      <PageHeader
        title={listing ? `Edit ${listing.type}` : "Edit Listing"}
        breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "Listings", to: ROUTES.LISTINGS }, { label: "Edit" }]}
      />
      {!listingQuery.isLoading && !listing && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">Listing not found.</div>
      )}
      {listing?.type === "Shop" && <ShopForm initial={listing} onDone={onDone} />}
      {listing?.type === "Service" && <ServiceForm initial={listing} onDone={onDone} />}
      {listing?.type === "Product" && <ProductForm initial={listing} onDone={onDone} />}
    </div>
  );
}
