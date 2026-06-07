import { API } from "@/lib/apiEndpoints";
import { httpClient } from "@/lib/httpClient";
import { toLanguage, type BackendLanguage } from "@/services/adapters/language.adapter";
import type { Language } from "@/types/system";

interface ListResponse<T> {
  items: T[];
  total?: number;
}

export interface LanguageListParams {
  search?: string;
  is_active?: boolean;
}

export interface CreateLanguagePayload {
  code: string;
  name: string;
  native_name?: string;
  direction?: "ltr" | "rtl";
  sort_order?: number;
  is_active?: boolean;
}

export type UpdateLanguagePayload = Partial<Omit<CreateLanguagePayload, "code">>;

export const languageService = {
  async list(params?: LanguageListParams): Promise<{ items: Language[]; total: number }> {
    const data = await httpClient.get<ListResponse<BackendLanguage>>(API.languages.adminList, { params });
    const items = (data.items || []).map(toLanguage);
    return { items, total: data.total ?? items.length };
  },

  async create(payload: CreateLanguagePayload) {
    return toLanguage(await httpClient.post<BackendLanguage>(API.languages.adminList, payload));
  },

  async get(id: string) {
    return toLanguage(await httpClient.get<BackendLanguage>(API.languages.detail(id)));
  },

  async update(id: string, payload: UpdateLanguagePayload) {
    return toLanguage(await httpClient.put<BackendLanguage>(API.languages.detail(id), payload));
  },

  async updateStatus(id: string, isActive: boolean) {
    return toLanguage(await httpClient.put<BackendLanguage>(API.languages.status(id), { is_active: isActive }));
  },

  async delete(id: string) {
    return httpClient.delete<void>(API.languages.detail(id));
  },
};
