import { API } from "@/lib/apiEndpoints";
import { httpClient } from "@/lib/httpClient";
import type { BackendArea, BackendDistrict, BackendState, LocationPage, LocationSummaryItem } from "@/types/location";

interface BackendListResponse<T> {
  items?: T[];
  page?: number;
  per_page?: number;
  total?: number;
  has_more?: boolean;
}

export interface LocationListParams {
  language_code?: string;
  search?: string;
  page?: number;
  per_page?: number;
}

export interface CreateStatePayload {
  language_code: string;
  code: string;
  name: string;
  is_active?: boolean;
  sort_order?: number;
}

export interface UpdateStatePayload {
  name?: string;
  is_active?: boolean;
  sort_order?: number;
}

export interface CreateDistrictPayload {
  language_code: string;
  state_id: number;
  code?: string | null;
  name: string;
  is_active?: boolean;
  sort_order?: number;
}

export interface UpdateDistrictPayload {
  name?: string;
  code?: string | null;
  is_active?: boolean;
  sort_order?: number;
}

export interface CreateAreaPayload {
  language_code: string;
  district_id: number;
  name: string;
  is_active?: boolean;
  sort_order?: number;
}

export interface UpdateAreaPayload {
  name?: string;
  is_active?: boolean;
  sort_order?: number;
}

function normalizePage<T>(data: BackendListResponse<T>, params?: LocationListParams): LocationPage<T> {
  return {
    items: data.items ?? [],
    page: data.page ?? params?.page ?? 1,
    perPage: data.per_page ?? params?.per_page ?? 20,
    total: data.total ?? data.items?.length ?? 0,
    hasMore: data.has_more ?? false,
  };
}

export const locationService = {
  async summary() {
    const data = await httpClient.get<{ items?: LocationSummaryItem[] }>(API.locations.summary);
    return data.items ?? [];
  },

  async listStates(params?: LocationListParams) {
    return normalizePage(await httpClient.get<BackendListResponse<BackendState>>(API.locations.states, { params }), params);
  },

  async createState(payload: CreateStatePayload) {
    return httpClient.post<BackendState>(API.locations.states, payload);
  },

  async getState(id: string) {
    return httpClient.get<BackendState>(API.locations.stateDetail(id));
  },

  async updateState(id: string, payload: UpdateStatePayload) {
    return httpClient.put<BackendState>(API.locations.stateDetail(id), payload);
  },

  async updateStateStatus(id: string, isActive: boolean) {
    return httpClient.put<BackendState>(API.locations.stateStatus(id), { is_active: isActive });
  },

  async deleteState(id: string) {
    return httpClient.delete<void>(API.locations.stateDetail(id));
  },

  async listDistricts(params?: LocationListParams) {
    return normalizePage(await httpClient.get<BackendListResponse<BackendDistrict>>(API.locations.districts, { params }), params);
  },

  async createDistrict(payload: CreateDistrictPayload) {
    return httpClient.post<BackendDistrict>(API.locations.districts, payload);
  },

  async getDistrict(id: string) {
    return httpClient.get<BackendDistrict>(API.locations.districtDetail(id));
  },

  async updateDistrict(id: string, payload: UpdateDistrictPayload) {
    return httpClient.put<BackendDistrict>(API.locations.districtDetail(id), payload);
  },

  async updateDistrictStatus(id: string, isActive: boolean) {
    return httpClient.put<BackendDistrict>(API.locations.districtStatus(id), { is_active: isActive });
  },

  async deleteDistrict(id: string) {
    return httpClient.delete<void>(API.locations.districtDetail(id));
  },

  async listAreas(params?: LocationListParams) {
    return normalizePage(await httpClient.get<BackendListResponse<BackendArea>>(API.locations.areas, { params }), params);
  },

  async createArea(payload: CreateAreaPayload) {
    return httpClient.post<BackendArea>(API.locations.areas, payload);
  },

  async getArea(id: string) {
    return httpClient.get<BackendArea>(API.locations.areaDetail(id));
  },

  async updateArea(id: string, payload: UpdateAreaPayload) {
    return httpClient.put<BackendArea>(API.locations.areaDetail(id), payload);
  },

  async updateAreaStatus(id: string, isActive: boolean) {
    return httpClient.put<BackendArea>(API.locations.areaStatus(id), { is_active: isActive });
  },

  async deleteArea(id: string) {
    return httpClient.delete<void>(API.locations.areaDetail(id));
  },
};
