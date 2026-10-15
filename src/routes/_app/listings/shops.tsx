import { createFileRoute } from "@tanstack/react-router";
import { TypedListingsPage } from "@/components/admin/TypedListingsPage";

export const Route = createFileRoute("/_app/listings/shops")({
  component: () => <TypedListingsPage type="Shop" title="Shops" />,
});
