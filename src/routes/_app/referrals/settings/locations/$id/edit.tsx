import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { ROUTES } from "@/constants/routes.constants";
import { useCompetitionLocation } from "@/hooks/api/useRewardsSettings";
import { LocationForm } from "@/routes/_app/referrals/settings/locations/add";

export const Route = createFileRoute("/_app/referrals/settings/locations/$id/edit")({ component: EditLocationPage });

function EditLocationPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const locationQuery = useCompetitionLocation(id);
  const location = locationQuery.data;
  const onDone = () => navigate({ to: ROUTES.REFERRALS_SETTINGS });

  if (!locationQuery.isLoading && !location) {
    return (
      <div>
        <PageHeader title="Edit Location" breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "Referrals & Points", to: ROUTES.REFERRALS }, { label: "Settings", to: ROUTES.REFERRALS_SETTINGS }, { label: "Edit Location" }]} />
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">Location not found.</div>
      </div>
    );
  }

  return location ? <LocationForm initial={location} onDone={onDone} /> : null;
}
