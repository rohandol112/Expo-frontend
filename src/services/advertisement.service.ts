import { API } from "@/lib/apiEndpoints";
import { httpClient } from "@/lib/httpClient";
import type { AdBanner, AdBannerInput, AdBannerListData } from "@/types/advertisement";

export type AdBannerListParams = {
  page?: number;
  per_page?: number;
  banner_type?: string;
  status?: string;
  state_id?: number;
  district_id?: number;
  area_id?: number;
};

export const advertisementService = {
  list(params?: AdBannerListParams) {
    return httpClient.get<AdBannerListData>(API.advertisement.banners, { params });
  },
  get(id: string | number) {
    return httpClient.get<AdBanner>(API.advertisement.banner(id));
  },
  create(input: AdBannerInput) {
    return httpClient.post<AdBanner>(API.advertisement.banners, input);
  },
  update(id: string | number, patch: Partial<AdBannerInput>) {
    return httpClient.put<AdBanner>(API.advertisement.banner(id), patch);
  },
  remove(id: string | number) {
    return httpClient.delete<{ id: number }>(API.advertisement.banner(id));
  },
  uploadUrl(fileName: string, contentType: string) {
    return httpClient.post<{ upload_url: string; file_key: string; expires_in: number }>(
      API.advertisement.bannersUploadUrl,
      { file_name: fileName, content_type: contentType },
    );
  },
};
