export type NotificationStatus = "draft" | "scheduled" | "published" | "expired";

export type NotificationDeliveryOption =
  | "save_as_draft"
  | "publish_now"
  | "schedule_for_later";

export interface NewsNotification {
  id: string;
  title: string;
  message: string;
  languageCode: string;
  language: string;
  stateId?: number;
  state: string;
  districtId?: number;
  district: string;
  areaId?: number;
  city: string;
  thumbnailKey?: string;
  thumbnailUrl?: string;
  inAppLink?: string;
  scheduledAt?: string;
  expiresAt?: string;
  sentOn: string;
  reach: number;
  open: number;
  status: NotificationStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface NotificationStats {
  total: number;
  sentSuccessfully: number;
  scheduled: number;
  totalReach: number;
  failedOrClosed: number;
}

export interface NotificationListResult {
  items: NewsNotification[];
  total: number;
  page: number;
  perPage: number;
}
