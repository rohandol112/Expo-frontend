import { API } from "@/lib/apiEndpoints";
import { httpClient } from "@/lib/httpClient";
import {
  toNotification,
  toNotificationStats,
  type BackendNotification,
  type BackendNotificationStats,
} from "@/services/adapters/notification.adapter";
import type {
  NewsNotification,
  NotificationDeliveryOption,
  NotificationListResult,
  NotificationStats,
  NotificationStatus,
} from "@/types/notification";

interface ListResponse<T> {
  items?: T[];
  data?: T[];
  total?: number;
  page?: number;
  per_page?: number;
  perPage?: number;
}

export interface NotificationListParams {
  page?: number;
  per_page?: number;
  status?: NotificationStatus;
  language_code?: string;
  state_id?: number;
  search?: string;
}

export interface NotificationPayload {
  title: string;
  message: string;
  language_code: string;
  state_id: number;
  district_id?: number;
  area_id?: number;
  thumbnail_key?: string;
  in_app_link?: string;
  delivery_option?: NotificationDeliveryOption;
  scheduled_at?: string;
  expires_at?: string;
}

export type UpdateNotificationPayload = Partial<Omit<NotificationPayload, "delivery_option">>;

export interface NotificationPublishPayload {
  scheduled_at?: string | null;
}

export interface NotificationThumbnailUploadPayload {
  file_name: string;
  content_type: string;
}

export interface NotificationThumbnailUploadResult {
  upload_url: string;
  file_key: string;
  expires_in: number;
}

function readList(data: ListResponse<BackendNotification> | BackendNotification[] | null | undefined): NotificationListResult {
  if (!data) return { items: [], total: 0, page: 1, perPage: 10 };
  if (Array.isArray(data)) {
    const items = data.filter(Boolean).map(toNotification);
    return { items, total: items.length, page: 1, perPage: items.length || 10 };
  }

  const rawItems = (data.items || data.data || []).filter(Boolean);
  const items = rawItems.map(toNotification);
  return {
    items,
    total: data.total ?? items.length,
    page: data.page ?? 1,
    perPage: data.per_page ?? data.perPage ?? 10,
  };
}

export const notificationService = {
  async list(params?: NotificationListParams): Promise<NotificationListResult> {
    const data = await httpClient.get<ListResponse<BackendNotification> | BackendNotification[]>(
      API.notifications.adminList,
      { params: params as unknown as Record<string, string | number | boolean | undefined> },
    );
    return readList(data);
  },

  async stats(): Promise<NotificationStats> {
    return toNotificationStats(await httpClient.get<BackendNotificationStats>(API.notifications.adminStats));
  },

  async create(payload: NotificationPayload): Promise<NewsNotification> {
    return toNotification(await httpClient.post<BackendNotification>(API.notifications.adminList, payload));
  },

  async get(id: string): Promise<NewsNotification> {
    return toNotification(await httpClient.get<BackendNotification>(API.notifications.detail(id)));
  },

  async update(id: string, payload: UpdateNotificationPayload): Promise<NewsNotification> {
    return toNotification(await httpClient.put<BackendNotification>(API.notifications.detail(id), payload));
  },

  async delete(id: string) {
    return httpClient.delete<void>(API.notifications.detail(id));
  },

  async publish(id: string, payload: NotificationPublishPayload = { scheduled_at: null }) {
    return toNotification(await httpClient.post<BackendNotification>(API.notifications.publish(id), payload));
  },

  async send(id: string) {
    return httpClient.post<{ notificationId?: string; recipients?: number }>(API.notifications.send(id));
  },

  async createThumbnailUploadUrl(payload: NotificationThumbnailUploadPayload) {
    return httpClient.post<NotificationThumbnailUploadResult>(
      API.notifications.thumbnailUploadUrl,
      payload,
    );
  },
};
