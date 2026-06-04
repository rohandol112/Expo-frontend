import { API } from "@/lib/apiEndpoints";
import { httpClient } from "@/lib/httpClient";
import { toNewsItem, type BackendNews } from "@/services/adapters/news.adapter";
import type { NewsItem } from "@/types/news";

interface ListResponse<T> {
  items: T[];
  page?: number;
  per_page?: number;
  total?: number;
  has_more?: boolean;
}

export interface NewsListParams {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string;
  type?: string;
  language_code?: string;
  category_id?: number;
  news_source_id?: number;
  is_admin_news?: boolean;
  from_date?: string;
  to_date?: string;
}

export interface AdminNewsStats {
  draft?: number;
  submitted?: number;
  approved?: number;
  rejected?: number;
  scheduled?: number;
  total?: number;
  total_views?: number;
  admin_news?: number;
  user_news?: number;
}

export type NewsContentType = "article" | "video" | "short" | "story";
export type NewsVisibilityScope = "all_india" | "state" | "district" | "area";
export type NewsCreateStatus = "draft" | "publish" | "schedule";

export interface CreateAdminNewsPayload {
  type: NewsContentType;
  language_code: string;
  title: string;
  description: string;
  bottom_description?: string;
  news_source_id: number;
  source_link?: string;
  category_ids: number[];
  subcategory_ids?: number[];
  location?: {
    state_id?: number | null;
    district_id?: number | null;
    area_id?: number | null;
  };
  visibility?: {
    scope: NewsVisibilityScope;
    state_ids?: number[];
    district_ids?: number[];
    area_ids?: number[];
  };
  translations?: Array<{
    language_code: string;
    title: string;
    description?: string | null;
    bottom_description?: string | null;
  }>;
  status?: NewsCreateStatus;
  scheduled_for?: string;
}

export interface UploadUrlPayload {
  file_name: string;
  content_type: string;
}

export interface UploadUrlResponse {
  upload_url: string;
  file_key: string;
  expires_in: number;
}

export interface NewsComment {
  id: number;
  video_id: number;
  user_id?: number | null;
  body: string;
  created_at?: string;
  updated_at?: string;
}

export interface NewsCommentListParams {
  page?: number;
  per_page?: number;
}

export const newsService = {
  async list(params?: NewsListParams): Promise<{ items: NewsItem[]; total: number; page: number; perPage: number }> {
    const data = await httpClient.get<ListResponse<BackendNews>>(API.news.adminList, { params });
    return {
      items: (data.items || []).map(toNewsItem),
      total: data.total ?? data.items?.length ?? 0,
      page: data.page ?? params?.page ?? 1,
      perPage: data.per_page ?? params?.per_page ?? 10,
    };
  },

  async create(payload: CreateAdminNewsPayload): Promise<NewsItem> {
    return toNewsItem(await httpClient.post<BackendNews>(API.news.adminList, payload));
  },

  async get(id: string) {
    return toNewsItem(await httpClient.get<BackendNews>(API.news.detail(id)));
  },

  async update(id: string, payload: unknown) {
    return toNewsItem(await httpClient.put<BackendNews>(API.news.detail(id), payload));
  },

  async delete(id: string) {
    return httpClient.delete<void>(API.news.detail(id));
  },

  async stats(params?: { is_admin_news?: boolean }) {
    return httpClient.get<AdminNewsStats>(API.news.adminStats, { params });
  },

  async approve(id: string) {
    return toNewsItem(await httpClient.post<BackendNews>(API.news.approve(id)));
  },

  async reject(id: string, reason: string) {
    return toNewsItem(await httpClient.post<BackendNews>(API.news.reject(id), { reason }));
  },

  async schedule(id: string, scheduledFor: string) {
    return toNewsItem(await httpClient.post<BackendNews>(API.news.schedule(id), { scheduled_for: scheduledFor }));
  },

  async requestVideoUploadUrl(id: string, payload: UploadUrlPayload) {
    return httpClient.post<UploadUrlResponse>(API.news.uploadUrl(id), payload);
  },

  async confirmVideoUpload(id: string, payload: { file_key: string; duration_seconds?: number }) {
    return httpClient.post<{ video_url: string; duration_seconds?: number | null }>(API.news.uploadConfirm(id), payload);
  },

  async requestThumbnailUploadUrl(id: string, payload: UploadUrlPayload) {
    return httpClient.post<UploadUrlResponse>(API.news.thumbnailUploadUrl(id), payload);
  },

  async confirmThumbnailUpload(id: string, payload: { file_key: string }) {
    return httpClient.post<{ thumbnail_url: string }>(API.news.thumbnailConfirm(id), payload);
  },

  async recordView(id: string) {
    return httpClient.post<{ viewed?: boolean }>(API.news.view(id));
  },

  async like(id: string) {
    return httpClient.post<{ liked: boolean }>(API.news.like(id));
  },

  async share(id: string, payload: { channel?: string } = {}) {
    return httpClient.post<{ shared: boolean }>(API.news.share(id), payload);
  },

  async listComments(id: string, params?: NewsCommentListParams) {
    const data = await httpClient.get<ListResponse<NewsComment>>(API.news.comments(id), { params });
    return {
      items: data.items || [],
      total: data.total ?? data.items?.length ?? 0,
      page: data.page ?? params?.page ?? 1,
      perPage: data.per_page ?? params?.per_page ?? 20,
    };
  },

  async addComment(id: string, body: string) {
    return httpClient.post<NewsComment>(API.news.comments(id), { body });
  },

  async updateCategories(id: string, payload: { category_ids?: number[]; subcategory_ids?: number[] }) {
    return httpClient.put<void>(API.news.categories(id), payload);
  },
};
