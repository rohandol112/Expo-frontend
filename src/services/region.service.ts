import { API } from "@/lib/apiEndpoints";
import { httpClient } from "@/lib/httpClient";

export interface RegionArea {
  id: number;
  name: string;
}

export interface RegionDistrict {
  id: number;
  name: string;
  areas: RegionArea[];
}

export interface RegionState {
  id: number;
  name: string;
  districts: RegionDistrict[];
}

interface RegionTreeResponse {
  states: RegionState[];
}

export interface RegionListParams {
  language_code?: string;
}

// Location data (states/districts/areas) was migrated under language_code='hi';
// querying 'en' returns an empty tree (empty location dropdowns everywhere).
const DEFAULT_REGION_LANGUAGE_CODE = "hi";

export const regionService = {
  async list(params: RegionListParams = {}) {
    const data = await httpClient.get<RegionTreeResponse>(API.regions, {
      params: { language_code: params.language_code || DEFAULT_REGION_LANGUAGE_CODE },
    });
    return data.states || [];
  },
};
