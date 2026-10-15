import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Edit, Eye, ImageIcon, MapPin } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatsCard } from "@/components/common/StatsCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes.constants";
import { useListing } from "@/hooks/api/useListings";
import { ListingTypeBadge, listingLocationLabel } from "@/routes/_app/listings";

export const Route = createFileRoute("/_app/listings/$listingId/")({ component: ListingDetailPage });

function ListingDetailPage() {
  const { listingId } = Route.useParams();
  const navigate = useNavigate();
  const listingQuery = useListing(listingId);
  const listing = listingQuery.data;

  return (
    <div>
      <PageHeader
        title={listing?.name ?? "Listing Details"}
        breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "Listings", to: ROUTES.LISTINGS }, { label: "Details" }]}
        actions={
          <Button onClick={() => navigate({ to: "/listings/$listingId/edit", params: { listingId } })}>
            <Edit className="mr-2 h-4 w-4" />Edit Listing
          </Button>
        }
      />
      {!listingQuery.isLoading && !listing && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">Listing not found.</div>
      )}
      {listing && (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <StatsCard title="Views" value={listing.views.toLocaleString()} icon={Eye} variant="blue" />
            <StatsCard title="Type" value={listing.type} icon={MapPin} variant="violet" />
            <StatsCard title="Images" value={listing.images.length} icon={ImageIcon} variant="amber" />
          </div>
          <div className="mt-6 grid gap-6 lg:grid-cols-[280px_1fr]">
            <div className="rounded-lg border bg-card p-4">
              {listing.coverImage || listing.images[0] ? (
                <div className="flex aspect-square items-center justify-center rounded-md bg-muted text-xs text-muted-foreground">{listing.coverImage ?? listing.images[0]}</div>
              ) : (
                <div className="flex aspect-square items-center justify-center rounded-md bg-muted"><ImageIcon className="h-8 w-8 text-muted-foreground" /></div>
              )}
            </div>
            <div className="rounded-lg border bg-card p-6">
              <dl className="grid gap-4 md:grid-cols-2">
                <Detail label="Listing Name" value={listing.name} />
                <div><dt className="text-xs font-medium uppercase text-muted-foreground">Type</dt><dd className="mt-1"><ListingTypeBadge type={listing.type} /></dd></div>
                <Detail label="Category" value={listing.category} />
                <Detail label="Sub Category" value={listing.subcategory} />
                <Detail label="Location" value={listingLocationLabel(listing)} />
                <Detail label="Phone Number" value={listing.phone} />
                <Detail label="WhatsApp Number" value={listing.whatsapp} />
                <Detail label="Email" value={listing.email} />
                <Detail label="Price" value={listing.price != null ? `₹${listing.price}` : undefined} />
                <Detail label="Sale Price" value={listing.salePrice != null ? `₹${listing.salePrice}` : undefined} />
                <Detail label="Offer Message" value={listing.offerMessage} />
                <Detail label="Views" value={listing.views} />
                <div><dt className="text-xs font-medium uppercase text-muted-foreground">Status</dt><dd className="mt-1"><StatusBadge status={listing.status} /></dd></div>
                <Detail label="Created On" value={listing.createdOn} />
              </dl>
              {listing.shortDescription && (
                <div className="mt-4">
                  <dt className="text-xs font-medium uppercase text-muted-foreground">Short Description</dt>
                  <dd className="mt-1 text-sm">{listing.shortDescription}</dd>
                </div>
              )}
              {listing.fullDescription && (
                <div className="mt-4">
                  <dt className="text-xs font-medium uppercase text-muted-foreground">Full Description</dt>
                  <dd className="mt-1 text-sm">{listing.fullDescription}</dd>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Detail({ label, value }: { label: string; value?: string | number }) {
  return <div><dt className="text-xs font-medium uppercase text-muted-foreground">{label}</dt><dd className="mt-1 text-sm font-medium">{value || "—"}</dd></div>;
}
