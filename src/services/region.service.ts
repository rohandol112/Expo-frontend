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

export const regionService = {
  async list() {
    const data = await httpClient.get<RegionTreeResponse>(API.regions);
    return data.states || [];
  },
};
