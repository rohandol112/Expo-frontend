import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { ROUTES } from "@/constants/routes.constants";
import { useImportantLink } from "@/hooks/api/useRewardsSettings";
import { LinkForm } from "@/routes/_app/referrals/settings/links/add";

export const Route = createFileRoute("/_app/referrals/settings/links/$id/edit")({ component: EditLinkPage });

function EditLinkPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const linkQuery = useImportantLink(id);
  const link = linkQuery.data;
  const onDone = () => navigate({ to: ROUTES.REFERRALS_SETTINGS });

  if (!linkQuery.isLoading && !link) {
    return (
      <div>
        <PageHeader title="Edit Important Link" breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "Referrals & Points", to: ROUTES.REFERRALS }, { label: "Settings", to: ROUTES.REFERRALS_SETTINGS }, { label: "Edit Important Link" }]} />
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">Link not found.</div>
      </div>
    );
  }

  return link ? <LinkForm initial={link} onDone={onDone} /> : null;
}
