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
  image_key?: string | null;
}

export interface UpdateStatePayload {
  name?: string;
  is_active?: boolean;
  sort_order?: number;
  image_key?: string | null;
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

// All location data is stored under language_code 'hi'; the admin states list
// endpoint requires language_code, so default it here unless a caller overrides.
const DEFAULT_LOCATION_LANGUAGE = "hi";
function withLang(params?: LocationListParams): LocationListParams {
  return { language_code: DEFAULT_LOCATION_LANGUAGE, ...params };
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
    const p = withLang(params);
    return normalizePage(await httpClient.get<BackendListResponse<BackendState>>(API.locations.states, { params: p }), p);
  },

  async createState(payload: CreateStatePayload) {
    return httpClient.post<BackendState>(API.locations.states, payload);
  },

  async getState(id: string, languageCode: string = DEFAULT_LOCATION_LANGUAGE) {
    return httpClient.get<BackendState>(API.locations.stateDetail(id), { params: { language_code: languageCode } });
  },

  async updateState(id: string, payload: UpdateStatePayload, languageCode: string = DEFAULT_LOCATION_LANGUAGE) {
    return httpClient.put<BackendState>(API.locations.stateDetail(id), payload, { params: { language_code: languageCode } });
  },

  async updateStateStatus(id: string, isActive: boolean) {
    return httpClient.put<BackendState>(API.locations.stateStatus(id), { is_active: isActive });
  },

  async deleteState(id: string) {
    return httpClient.delete<void>(API.locations.stateDetail(id));
  },

  async getStateImageUploadUrl(payload: { file_name: string; content_type: string }) {
    return httpClient.post<{ upload_url: string; file_key: string; expires_in: number }>(
      API.locations.stateImageUploadUrl,
      payload
    );
  },

  async listDistricts(params?: LocationListParams) {
    const p = withLang(params);
    return normalizePage(await httpClient.get<BackendListResponse<BackendDistrict>>(API.locations.districts, { params: p }), p);
  },

  async createDistrict(payload: CreateDistrictPayload) {
    return httpClient.post<BackendDistrict>(API.locations.districts, payload);
  },

  async getDistrict(id: string, languageCode: string = DEFAULT_LOCATION_LANGUAGE) {
    return httpClient.get<BackendDistrict>(API.locations.districtDetail(id), { params: { language_code: languageCode } });
  },

  async updateDistrict(id: string, payload: UpdateDistrictPayload, languageCode: string = DEFAULT_LOCATION_LANGUAGE) {
    return httpClient.put<BackendDistrict>(API.locations.districtDetail(id), payload, { params: { language_code: languageCode } });
  },

  async updateDistrictStatus(id: string, isActive: boolean) {
    return httpClient.put<BackendDistrict>(API.locations.districtStatus(id), { is_active: isActive });
  },

  async deleteDistrict(id: string) {
    return httpClient.delete<void>(API.locations.districtDetail(id));
  },

  async listAreas(params?: LocationListParams) {
    const p = withLang(params);
    return normalizePage(await httpClient.get<BackendListResponse<BackendArea>>(API.locations.areas, { params: p }), p);
  },

  async createArea(payload: CreateAreaPayload) {
    return httpClient.post<BackendArea>(API.locations.areas, payload);
  },

  async getArea(id: string, languageCode: string = DEFAULT_LOCATION_LANGUAGE) {
    return httpClient.get<BackendArea>(API.locations.areaDetail(id), { params: { language_code: languageCode } });
  },

  async updateArea(id: string, payload: UpdateAreaPayload, languageCode: string = DEFAULT_LOCATION_LANGUAGE) {
    return httpClient.put<BackendArea>(API.locations.areaDetail(id), payload, { params: { language_code: languageCode } });
  },

  async updateAreaStatus(id: string, isActive: boolean) {
    return httpClient.put<BackendArea>(API.locations.areaStatus(id), { is_active: isActive });
  },

  async deleteArea(id: string) {
    return httpClient.delete<void>(API.locations.areaDetail(id));
  },
};
