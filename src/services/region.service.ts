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

const DEFAULT_REGION_LANGUAGE_CODE = "en";

export const regionService = {
  async list(params: RegionListParams = {}) {
    const data = await httpClient.get<RegionTreeResponse>(API.regions, {
      params: { language_code: params.language_code || DEFAULT_REGION_LANGUAGE_CODE },
    });
    return data.states || [];
  },
};
