import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Save } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { CascadingLocationPicker, type CascadingLocationValue } from "@/components/forms/CascadingLocationPicker";
import { FormSection } from "@/components/forms/FormSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateCompetitionLocation, useUpdateCompetitionLocation } from "@/hooks/api/useRewardsSettings";
import type { CompetitionLocation } from "@/types/referrals";
import { ROUTES } from "@/constants/routes.constants";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/referrals/settings/locations/add")({ component: AddLocationPage });

function AddLocationPage() {
  const navigate = useNavigate();
  return <LocationForm onDone={() => navigate({ to: ROUTES.REFERRALS_SETTINGS })} />;
}

function splitList(value: string) {
  return value ? value.split(", ").filter(Boolean) : [];
}

export function LocationForm({ onDone, initial }: { onDone: () => void; initial?: CompetitionLocation }) {
  const createLocation = useCreateCompetitionLocation();
  const updateLocation = useUpdateCompetitionLocation();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [selection, setSelection] = useState<CascadingLocationValue>({
    states: splitList(initial?.state ?? ""),
    districts: splitList(initial?.district ?? ""),
    areas: splitList(initial?.area ?? ""),
  });
  const saving = createLocation.isPending || updateLocation.isPending;

  const submit = async () => {
    if (!title.trim() || selection.states.length === 0) {
      toast.error("Please enter a location title and select at least one state.");
      return;
    }
    const payload = {
      title: title.trim(),
      state: selection.states.join(", "),
      district: selection.districts.join(", "),
      area: selection.areas.length ? selection.areas.join(", ") : "All Areas",
      status: initial?.status ?? ("Active" as const),
    };
    if (initial) {
      await updateLocation.mutateAsync({ id: initial.id, payload });
    } else {
      await createLocation.mutateAsync(payload);
    }
    toast.success(initial ? "Location updated" : "Location saved");
    onDone();
  };

  return (
    <div>
      <PageHeader
        title={initial ? "Edit Location" : "Add Location"}
        description="Create a new location by adding a title and selecting states, districts and areas."
        breadcrumbs={[
          { label: "Dashboard", to: ROUTES.DASHBOARD },
          { label: "Referrals & Points", to: ROUTES.REFERRALS },
          { label: "Settings", to: ROUTES.REFERRALS_SETTINGS },
          { label: initial ? "Edit Location" : "Add Location" },
        ]}
      />

      <div className="space-y-4">
        <FormSection title="1. Location Title" description="Enter a name for this location.">
          <div className="space-y-2">
            <Label>Title <span className="text-destructive">*</span></Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter location title (e.g. Mumbai, Maharashtra or North India etc.)" />
          </div>
        </FormSection>

        <FormSection title="2. Select Locations" description="Choose states, then districts and areas within them.">
          <CascadingLocationPicker value={selection} onChange={setSelection} />
        </FormSection>
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <Button variant="outline" onClick={onDone}>Cancel</Button>
        <Button onClick={submit} disabled={saving}><Save className="mr-2 h-4 w-4" />{saving ? "Saving..." : initial ? "Save Changes" : "Save Location"}</Button>
      </div>
    </div>
  );
}
