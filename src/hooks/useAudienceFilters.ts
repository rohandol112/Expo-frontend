import { useMemo } from "react";
import type { FilterDropdown } from "@/components/common/FilterBar";
import { useLanguages } from "@/hooks/api/useLanguages";
import { useRegionOptions } from "@/hooks/useRegionOptions";

/** Query params the reward reports accept for "who": region ids and a language code. */
export interface AudienceParams {
  state_id?: number;
  district_id?: number;
  area_id?: number;
  language?: string;
}

/**
 * State / District / Area / Language dropdowns for AdminListPage (keys `state`,
 * `district`, `area`, `language`), plus the API params for the current values.
 * District and area options narrow to the selected parent.
 */
export function useAudienceFilters(values: Record<string, string>, include: { area?: boolean; language?: boolean } = {}) {
  const { stateOptions, districtOptions, areaOptions } = useRegionOptions();
  const languagesQuery = useLanguages();
  const withArea = include.area ?? true;
  const withLanguage = include.language ?? true;

  const dropdowns = useMemo<FilterDropdown[]>(() => {
    const list: FilterDropdown[] = [
      { key: "state", placeholder: "State", options: stateOptions },
      { key: "district", placeholder: "District", options: values.state ? districtOptions([values.state]) : [] },
    ];
    if (withArea) list.push({ key: "area", placeholder: "Area", options: values.district ? areaOptions([values.district]) : [] });
    if (withLanguage) {
      list.push({
        key: "language",
        placeholder: "Language",
        options: (languagesQuery.data?.items ?? []).map((l) => ({ label: l.name, value: l.code })),
      });
    }
    return list;
  }, [stateOptions, districtOptions, areaOptions, values.state, values.district, languagesQuery.data, withArea, withLanguage]);

  const params: AudienceParams = {
    state_id: values.state ? Number(values.state) : undefined,
    district_id: values.state && values.district ? Number(values.district) : undefined,
    area_id: values.state && values.district && values.area ? Number(values.area) : undefined,
    language: values.language || undefined,
  };
  return { dropdowns, params };
}
