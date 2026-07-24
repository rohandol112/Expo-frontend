import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { BannerForm } from "@/components/advertisement/BannerForm";
import { useAdBanner, useUpdateAdBanner } from "@/hooks/api/useAdvertisement";
import { ROUTES } from "@/constants/routes.constants";

export const Route = createFileRoute("/_app/advertisement/banners/$bannerId/edit")({ component: EditBannerPage });

function EditBannerPage() {
  const { bannerId } = Route.useParams();
  const navigate = useNavigate();
  const bannerQuery = useAdBanner(bannerId);
  const updateBanner = useUpdateAdBanner(bannerId);
  const banner = bannerQuery.data;

  return (
    <div>
      <PageHeader
        title="Edit Banner"
        breadcrumbs={[
          { label: "Dashboard", to: ROUTES.DASHBOARD },
          { label: "Advertisement" },
          { label: "Banners", to: ROUTES.ADS_BANNERS },
          { label: banner?.name ?? "Edit" },
        ]}
      />
      {bannerQuery.isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {banner && (
        <BannerForm
          submitLabel="Update Banner"
          submitting={updateBanner.isPending}
          initialImageUrl={banner.image_url}
          initial={{
            name: banner.name,
            banner_type: banner.banner_type,
            external_link: banner.external_link,
            link_url: banner.link_url,
            display_order: banner.display_order,
            status: banner.status,
            image_key: banner.image_key,
            state_ids: banner.state_ids,
            district_ids: banner.district_ids,
            area_ids: banner.area_ids,
          }}
          onCancel={() => navigate({ to: ROUTES.ADS_BANNERS })}
          onSubmit={(data) =>
            updateBanner.mutate(data, {
              onSuccess: () => {
                toast.success("Banner updated");
                navigate({ to: ROUTES.ADS_BANNERS });
              },
              onError: (err) => toast.error(err instanceof Error ? err.message : "Could not update banner"),
            })
          }
        />
      )}
    </div>
  );
}
