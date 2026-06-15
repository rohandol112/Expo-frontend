import { API } from "@/lib/apiEndpoints";
import { httpClient } from "@/lib/httpClient";
import { toCategory, type BackendCategory } from "@/services/adapters/category.adapter";
import type { Category } from "@/types/category";

interface ListResponse<T> {
  items: T[];
  total?: number;
}

export interface CategoryListParams {
  search?: string;
  is_active?: boolean;
  parent_id?: string | number;
}

export interface CategoryChildListParams {
  page?: number;
  per_page?: number;
}

export interface CreateCategoryPayload {
  slug?: string;
  parent_id?: number | null;
  icon_url?: string | null;
  sort_order?: number;
  is_active?: boolean;
  is_featured?: boolean;
  translations: Array<{ language_code: string; name: string; description?: string | null }>;
}

export type UpdateCategoryPayload = Partial<CreateCategoryPayload>;

export interface SortCategoriesPayload {
  parent_id: number | null;
  ordered_ids: number[];
}

export const categoryService = {
  async list(params?: CategoryListParams): Promise<{ items: Category[]; total: number }> {
    const data = await httpClient.get<ListResponse<BackendCategory>>(API.categories.adminList, { params });
    const items = (data.items || []).map(toCategory);
    return { items, total: data.total ?? items.length };
  },

  async publicList(params?: CategoryListParams): Promise<{ items: Category[]; total: number }> {
    const data = await httpClient.get<ListResponse<BackendCategory>>(API.categories.publicList, { params });
    const items = (data.items || []).map(toCategory);
    return { items, total: data.total ?? items.length };
  },

  async publicGet(id: string) {
    return toCategory(await httpClient.get<BackendCategory>(API.categories.publicDetail(id)));
  },

  async listSubcategories(id: string, params?: CategoryChildListParams): Promise<{ items: Category[]; total: number }> {
    const data = await httpClient.get<ListResponse<BackendCategory>>(API.categories.subcategories(id), { params });
    const items = (data.items || []).map(toCategory);
    return { items, total: data.total ?? items.length };
  },

  async listCategoryNews(id: string, params?: CategoryChildListParams) {
    return httpClient.get<unknown>(API.categories.videos(id), { params });
  },

  async create(payload: CreateCategoryPayload) {
    return toCategory(await httpClient.post<BackendCategory>(API.categories.adminList, payload));
  },

  async get(id: string) {
    return toCategory(await httpClient.get<BackendCategory>(API.categories.detail(id)));
  },

  async update(id: string, payload: UpdateCategoryPayload) {
    return toCategory(await httpClient.put<BackendCategory>(API.categories.detail(id), payload));
  },

  async updateStatus(id: string, isActive: boolean) {
    return toCategory(await httpClient.put<BackendCategory>(API.categories.status(id), { is_active: isActive }));
  },

  async sort(payload: SortCategoriesPayload) {
    return httpClient.put<void>(API.categories.sort, payload);
  },

  async delete(id: string) {
    return httpClient.delete<void>(API.categories.detail(id));
  },
};
