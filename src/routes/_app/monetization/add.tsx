import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { AdForm } from "@/components/monetization/AdForm";
import { useCreateManualAd } from "@/hooks/api/useMonetization";
import { ROUTES } from "@/constants/routes.constants";

export const Route = createFileRoute("/_app/monetization/add")({ component: AddAdPage });

function AddAdPage() {
  const navigate = useNavigate();
  const createAd = useCreateManualAd();

  return (
    <div>
      <PageHeader
        title="Add New Ad"
        description="Create a manual ad and choose where and how often it is shown."
        breadcrumbs={[
          { label: "Dashboard", to: ROUTES.DASHBOARD },
          { label: "Monetization Management", to: ROUTES.MONETIZATION },
          { label: "Add New Ad" },
        ]}
      />
      <div className="max-w-3xl rounded-xl border bg-card p-5 shadow-sm">
        <AdForm
          submitLabel="Save Ad"
          saving={createAd.isPending}
          onCancel={() => navigate({ to: ROUTES.MONETIZATION })}
          onSubmit={(data) =>
            createAd.mutate(data, {
              onSuccess: () => {
                toast.success("Ad created");
                navigate({ to: ROUTES.MONETIZATION });
              },
              onError: (err) => toast.error(err instanceof Error ? err.message : "Could not create ad"),
            })
          }
        />
      </div>
    </div>
  );
}
