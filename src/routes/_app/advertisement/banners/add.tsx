import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { BannerForm } from "@/components/advertisement/BannerForm";
import { useCreateAdBanner } from "@/hooks/api/useAdvertisement";
import { ROUTES } from "@/constants/routes.constants";

export const Route = createFileRoute("/_app/advertisement/banners/add")({ component: AddBannerPage });

function AddBannerPage() {
  const navigate = useNavigate();
  const createBanner = useCreateAdBanner();

  return (
    <div>
      <PageHeader
        title="Add New Banner"
        breadcrumbs={[
          { label: "Dashboard", to: ROUTES.DASHBOARD },
          { label: "Advertisement" },
          { label: "Banners", to: ROUTES.ADS_BANNERS },
          { label: "Add New Banner" },
        ]}
      />
      <BannerForm
        submitLabel="Save Banner"
        submitting={createBanner.isPending}
        onCancel={() => navigate({ to: ROUTES.ADS_BANNERS })}
        onSubmit={(data) =>
          createBanner.mutate(data, {
            onSuccess: () => {
              toast.success("Banner created");
              navigate({ to: ROUTES.ADS_BANNERS });
            },
            onError: (err) => toast.error(err instanceof Error ? err.message : "Could not create banner"),
          })
        }
      />
    </div>
  );
}
