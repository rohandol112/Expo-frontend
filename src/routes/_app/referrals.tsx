import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/admin/PlaceholderPage";

export const Route = createFileRoute("/_app/referrals")({
  component: () => <PlaceholderPage title="Referrals & Points" description="Referral tracking and points ledger management will appear here." />,
});
