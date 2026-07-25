import { API } from "@/lib/apiEndpoints";
import { httpClient } from "@/lib/httpClient";
import type { ManualAd, ManualAdInput, ManualAdListData, MonetizationSettings } from "@/types/monetization";

export type ManualAdListParams = {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string;
  language_code?: string;
  state_id?: number;
  district_id?: number;
  area_id?: number;
};

export const monetizationService = {
  settings() {
    return httpClient.get<MonetizationSettings>(API.monetization.settings);
  },
  updateSettings(patch: Partial<Pick<MonetizationSettings, "admob_enabled" | "manual_ads_enabled">>) {
    return httpClient.put<MonetizationSettings>(API.monetization.settings, patch);
  },
  list(params?: ManualAdListParams) {
    return httpClient.get<ManualAdListData>(API.monetization.ads, { params });
  },
  create(input: ManualAdInput) {
    return httpClient.post<ManualAd>(API.monetization.ads, input);
  },
  update(id: number, patch: Partial<ManualAdInput>) {
    return httpClient.put<ManualAd>(API.monetization.ad(id), patch);
  },
  remove(id: number) {
    return httpClient.delete<{ id: number }>(API.monetization.ad(id));
  },
  reorder(ids: number[]) {
    return httpClient.put<{ ids: number[] }>(API.monetization.reorder, { ids });
  },
  async uploadImage(file: File): Promise<string> {
    const { upload_url, file_key } = await httpClient.post<{ upload_url: string; file_key: string }>(
      API.monetization.uploadUrl,
      { file_name: file.name, content_type: file.type },
    );
    const put = await fetch(upload_url, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
    if (!put.ok) throw new Error(`Upload failed (${put.status})`);
    return file_key;
  },
};
