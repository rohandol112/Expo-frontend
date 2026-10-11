import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { ROUTES } from "@/constants/routes.constants";
import { useBanner } from "@/hooks/api/useBanners";
import { BannerForm } from "@/routes/_app/listings/banners/add";

export const Route = createFileRoute("/_app/listings/banners/$bannerId/edit")({ component: EditBannerPage });

function EditBannerPage() {
  const { bannerId } = Route.useParams();
  const navigate = useNavigate();
  const bannerQuery = useBanner(bannerId);
  const banner = bannerQuery.data;

  if (!bannerQuery.isLoading && !banner) {
    return (
      <div>
        <PageHeader
          title="Edit Banner"
          breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "Banners", to: ROUTES.LISTINGS_BANNERS }, { label: "Edit" }]}
        />
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">Banner not found.</div>
      </div>
    );
  }

  return banner ? <BannerForm initial={banner} onDone={() => navigate({ to: ROUTES.LISTINGS_BANNERS })} /> : null;
}
