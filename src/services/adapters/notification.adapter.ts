import type { NewsNotification, NotificationStats, NotificationStatus } from "@/types/notification";

export interface BackendNotification {
  id?: number | string;
  title?: string;
  news?: string;
  message?: string;
  language_code?: string;
  language?: string;
  language_name?: string;
  state_id?: number;
  state?: string | { id?: number | string; name?: string };
  state_name?: string;
  target_state?: string;
  district_id?: number;
  district?: string | { id?: number | string; name?: string };
  district_name?: string;
  area_id?: number;
  area?: string | { id?: number | string; name?: string };
  area_name?: string;
  city?: string;
  thumbnail_key?: string;
  thumbnail_url?: string;
  image_url?: string;
  in_app_link?: string;
  scheduled_at?: string;
  expires_at?: string;
  sent_at?: string;
  sent_on?: string;
  published_at?: string;
  created_at?: string;
  updated_at?: string;
  reach?: number;
  total_reach?: number;
  recipients?: number;
  open?: number;
  opens?: number;
  open_count?: number;
  status?: string;
}

export interface BackendNotificationStats {
  total?: number;
  total_notifications?: number;
  sent_successfully?: number;
  published?: number;
  scheduled?: number;
  total_reach?: number;
  reach?: number;
  failed?: number;
  closed?: number;
  expired?: number;
  by_status?: {
    draft?: number;
    scheduled?: number;
    published?: number;
    expired?: number;
  };
}

function formatDate(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function languageName(code?: string, fallback?: string) {
  if (fallback) return fallback;
  const map: Record<string, string> = {
    en: "English",
    hi: "Hindi",
    mr: "Marathi",
    ta: "Tamil",
    bn: "Bengali",
    gu: "Gujarati",
    pa: "Punjabi",
  };
  return code ? map[code] ?? code.toUpperCase() : "—";
}

function entityName(value?: string | { name?: string } | null) {
  if (!value) return undefined;
  return typeof value === "string" ? value : value.name;
}

function entityId(value?: number | string | { id?: number | string } | null) {
  if (value === undefined || value === null) return undefined;
  const raw = typeof value === "object" ? value.id : value;
  const id = Number(raw);
  return Number.isFinite(id) ? id : undefined;
}

function normalizeStatus(status?: string): NotificationStatus {
  if (status === "scheduled" || status === "published" || status === "expired") return status;
  return "draft";
}

export function notificationStatusLabel(status: NotificationStatus) {
  const map: Record<NotificationStatus, string> = {
    draft: "Pending",
    scheduled: "Scheduled",
    published: "Active",
    expired: "Failed",
  };
  return map[status];
}

export function toNotification(row: BackendNotification): NewsNotification {
  const languageCode = row.language_code || "";
  return {
    id: String(row.id ?? ""),
    title: row.title || row.news || "Untitled notification",
    message: row.message || "",
    languageCode,
    language: languageName(languageCode, row.language_name || row.language),
    stateId: row.state_id ?? entityId(row.state),
    state: row.state_name || entityName(row.state) || row.target_state || "—",
    districtId: row.district_id ?? entityId(row.district),
    district: row.district_name || entityName(row.district) || "—",
    areaId: row.area_id ?? entityId(row.area),
    city: row.area_name || entityName(row.area) || row.city || "—",
    thumbnailKey: row.thumbnail_key,
    thumbnailUrl: row.thumbnail_url || row.image_url,
    inAppLink: row.in_app_link,
    scheduledAt: row.scheduled_at,
    expiresAt: row.expires_at,
    sentOn: formatDate(row.sent_at || row.sent_on || row.published_at || row.scheduled_at || row.created_at),
    reach: row.reach ?? row.total_reach ?? row.recipients ?? 0,
    open: row.open ?? row.opens ?? row.open_count ?? 0,
    status: normalizeStatus(row.status),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function toNotificationStats(row?: BackendNotificationStats): NotificationStats {
  return {
    total: row?.total_notifications ?? row?.total ?? 0,
    sentSuccessfully: row?.sent_successfully ?? row?.published ?? row?.by_status?.published ?? 0,
    scheduled: row?.scheduled ?? row?.by_status?.scheduled ?? 0,
    totalReach: row?.total_reach ?? row?.reach ?? 0,
    failedOrClosed: (row?.failed ?? 0) + (row?.closed ?? 0) + (row?.expired ?? row?.by_status?.expired ?? 0),
  };
}
