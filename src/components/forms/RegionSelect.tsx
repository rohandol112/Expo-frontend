import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRegionOptions } from "@/hooks/useRegionOptions";

/** One state / district / area, as id strings ("" when unset). */
export interface RegionValue {
  stateId: string;
  districtId: string;
  areaId: string;
}

export const EMPTY_REGION: RegionValue = { stateId: "", districtId: "", areaId: "" };

const NONE = "__none__";

/** State → District → Area single selects over the region tree; changing a level clears the ones below it. */
export function RegionSelect({
  value,
  onChange,
  required = false,
}: {
  value: RegionValue;
  onChange: (next: RegionValue) => void;
  /** Marks State and District as required (shops need both). */
  required?: boolean;
}) {
  const { loading, stateOptions, districtOptions, areaOptions } = useRegionOptions();
  const districts = value.stateId ? districtOptions([value.stateId]) : [];
  const areas = value.districtId ? areaOptions([value.districtId]) : [];
  const mark = required ? <span className="text-destructive"> *</span> : null;

  const level = (
    label: string,
    current: string,
    options: { label: string; value: string }[],
    placeholder: string,
    set: (id: string) => void,
    disabled: boolean,
    star: React.ReactNode,
  ) => (
    <div className="space-y-2">
      <Label>{label}{star}</Label>
      <Select value={current || NONE} onValueChange={(v) => set(v === NONE ? "" : v)} disabled={disabled}>
        <SelectTrigger><SelectValue placeholder={placeholder} /></SelectTrigger>
        <SelectContent>
          <SelectItem value={NONE}>{placeholder}</SelectItem>
          {options.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {level("State", value.stateId, stateOptions, loading ? "Loading..." : "Select state", (id) => onChange({ stateId: id, districtId: "", areaId: "" }), loading, mark)}
      {level("District", value.districtId, districts, "Select district", (id) => onChange({ ...value, districtId: id, areaId: "" }), !value.stateId, mark)}
      {level("Area", value.areaId, areas, "Select area", (id) => onChange({ ...value, areaId: id }), !value.districtId, null)}
    </div>
  );
}
