import { useMemo } from "react";
import { useRegions } from "@/hooks/api/useRegions";
import type { RegionArea, RegionDistrict, RegionState } from "@/services/region.service";

export interface RegionOption {
  label: string;
  value: string;
}

const toOption = (r: { id: number; name: string }): RegionOption => ({ label: r.name, value: String(r.id) });

/**
 * The state → district → area tree from GET /regions, flattened for pickers.
 * Values are ids as strings (what Select / MultiSelect hold); an empty parent
 * selection means "every one under any parent".
 */
export function useRegionOptions() {
  const regionsQuery = useRegions();
  return useMemo(() => {
    const states: RegionState[] = regionsQuery.data ?? [];
    const districts: Array<RegionDistrict & { stateId: number }> = states.flatMap((s) => s.districts.map((d) => ({ ...d, stateId: s.id })));
    const areas: Array<RegionArea & { districtId: number }> = districts.flatMap((d) => d.areas.map((a) => ({ ...a, districtId: d.id })));
    return {
      loading: regionsQuery.isLoading,
      stateOptions: states.map(toOption),
      districtOptions: (stateIds: string[]) =>
        districts.filter((d) => stateIds.length === 0 || stateIds.includes(String(d.stateId))).map(toOption),
      areaOptions: (districtIds: string[]) =>
        areas.filter((a) => districtIds.length === 0 || districtIds.includes(String(a.districtId))).map(toOption),
    };
  }, [regionsQuery.data, regionsQuery.isLoading]);
}
