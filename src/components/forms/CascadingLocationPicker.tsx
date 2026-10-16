import { useEffect } from "react";
import { MultiSelect } from "@/components/common/MultiSelect";
import { Label } from "@/components/ui/label";
import { useRegionOptions } from "@/hooks/useRegionOptions";

/** Selected region ids (as strings). An empty level means "all" under the levels above it. */
export interface CascadingLocationValue {
  states: string[];
  districts: string[];
  areas: string[];
}

/**
 * Three cascading multi-selects (States → Districts → Areas), each filtered by
 * the previous selection, over the real region tree from the API.
 */
export function CascadingLocationPicker({
  value,
  onChange,
}: {
  value: CascadingLocationValue;
  onChange: (next: CascadingLocationValue) => void;
}) {
  const { loading, stateOptions, districtOptions: districtsFor, areaOptions: areasFor } = useRegionOptions();
  const districtOptions = districtsFor(value.states);
  const areaOptions = areasFor(value.districts);

  // Prune downstream selections when an upstream filter narrows them out.
  // Skipped while the tree loads, so saved selections aren't dropped before
  // their options exist.
  useEffect(() => {
    if (loading) return;
    const validDistricts = value.districts.filter((d) => districtOptions.some((o) => o.value === d));
    if (validDistricts.length !== value.districts.length) {
      onChange({ ...value, districts: validDistricts });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.states, loading]);

  useEffect(() => {
    if (loading) return;
    const validAreas = value.areas.filter((a) => areaOptions.some((o) => o.value === a));
    if (validAreas.length !== value.areas.length) {
      onChange({ ...value, areas: validAreas });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.districts, loading]);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Select States</Label>
        <p className="text-xs text-muted-foreground">Choose one or more states for this location.</p>
        <MultiSelect options={stateOptions} value={value.states} onChange={(next) => onChange({ ...value, states: next })} placeholder={loading ? "Loading states..." : "Search states..."} />
      </div>
      <div className="space-y-2">
        <Label>Select Districts</Label>
        <p className="text-xs text-muted-foreground">Choose one or more districts from the selected states. Leave empty for all districts.</p>
        <MultiSelect options={districtOptions} value={value.districts} onChange={(next) => onChange({ ...value, districts: next })} placeholder="Search districts..." />
      </div>
      <div className="space-y-2">
        <Label>Select Areas</Label>
        <p className="text-xs text-muted-foreground">Choose one or more areas from the selected districts. Leave empty for all areas.</p>
        <MultiSelect options={areaOptions} value={value.areas} onChange={(next) => onChange({ ...value, areas: next })} placeholder="Search areas..." />
      </div>
    </div>
  );
}
