import { createFileRoute } from "@tanstack/react-router";
import { TypedListingsPage } from "@/components/admin/TypedListingsPage";

export const Route = createFileRoute("/_app/listings/services")({
  component: () => <TypedListingsPage type="Service" title="Services" />,
});
