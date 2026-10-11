import { useEffect } from "react";
import { MultiSelect } from "@/components/common/MultiSelect";
import { Label } from "@/components/ui/label";
import { states, districts, areas } from "@/mock/location.mock";

export interface CascadingLocationValue {
  states: string[];
  districts: string[];
  areas: string[];
}

/**
 * Three cascading multi-selects (States → Districts → Areas), each filtered by
 * the previous selection. Reuses the existing System Management location data
 * (src/mock/location.mock.ts) rather than inventing a parallel dataset.
 */
export function CascadingLocationPicker({
  value,
  onChange,
}: {
  value: CascadingLocationValue;
  onChange: (next: CascadingLocationValue) => void;
}) {
  const stateOptions = states.map((s) => ({ label: s.name, value: s.name }));
  const districtOptions = districts
    .filter((d) => value.states.length === 0 || value.states.includes(d.state))
    .map((d) => ({ label: d.name, value: d.name }));
  const areaOptions = areas
    .filter((a) => value.districts.length === 0 || value.districts.includes(a.district))
    .map((a) => ({ label: a.name, value: a.name }));

  // Prune downstream selections when an upstream filter narrows them out.
  useEffect(() => {
    const validDistricts = value.districts.filter((d) => districtOptions.some((o) => o.value === d));
    if (validDistricts.length !== value.districts.length) {
      onChange({ ...value, districts: validDistricts });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.states]);

  useEffect(() => {
    const validAreas = value.areas.filter((a) => areaOptions.some((o) => o.value === a));
    if (validAreas.length !== value.areas.length) {
      onChange({ ...value, areas: validAreas });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.districts]);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Select States</Label>
        <p className="text-xs text-muted-foreground">Choose one or more states for this location.</p>
        <MultiSelect options={stateOptions} value={value.states} onChange={(next) => onChange({ ...value, states: next })} placeholder="Search states..." />
      </div>
      <div className="space-y-2">
        <Label>Select Districts</Label>
        <p className="text-xs text-muted-foreground">Choose one or more districts from the selected states.</p>
        <MultiSelect options={districtOptions} value={value.districts} onChange={(next) => onChange({ ...value, districts: next })} placeholder="Search districts..." />
      </div>
      <div className="space-y-2">
        <Label>Select Areas</Label>
        <p className="text-xs text-muted-foreground">Choose one or more areas from the selected districts.</p>
        <MultiSelect options={areaOptions} value={value.areas} onChange={(next) => onChange({ ...value, areas: next })} placeholder="Search areas..." />
      </div>
    </div>
  );
}
