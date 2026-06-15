import type { NewsItem, ContentType, NewsPoll, NewsStatus } from "@/types/news";

type LocationRef = string | number | { id?: number; name?: string | null } | null;

export interface BackendNews {
  id: number;
  type?: "video" | "short" | "article" | "story";
  title: string;
  description?: string | null;
  bottom_description?: string | null;
  slug?: string;
  thumbnail_url?: string | null;
  video_url?: string | null;
  duration_seconds?: number | null;
  language_code?: string;
  language_name?: string;
  news_source_id?: number | null;
  channel?: { id: number; name: string; image_url?: string | null } | null;
  source_name?: string | null;
  source_link?: string | null;
  categories?: Array<{ id: number; name: string }>;
  view_count?: number;
  share_count?: number;
  comment_count?: number;
  status?: string;
  status_label?: string;
  rejection_reason?: string | null;
  scheduled_for?: string | null;
  published_at?: string | null;
  created_at?: string;
  updated_at?: string;
  created_by?: number;
  created_by_role?: string | null;
  creator?: { id?: number; name?: string | null; email?: string | null; avatar_url?: string | null; role?: string | null } | null;
  created_by_user?: { id?: number; name?: string | null; email?: string | null; avatar_url?: string | null; role?: string | null } | null;
  location?: {
    state?: LocationRef;
    district?: LocationRef;
    area?: LocationRef;
    state_id?: number | null;
    district_id?: number | null;
    area_id?: number | null;
  } | null;
  visibility?: {
    scope?: "all_india" | "state" | "district" | "area" | "private";
    states?: string[];
    districts?: string[];
    areas?: string[];
    users?: string[];
    state_ids?: number[];
    district_ids?: number[];
    area_ids?: number[];
    user_ids?: number[];
  };
  has_poll?: boolean;
  poll_question?: string | null;
  poll?: NewsPoll | null;
  tags?: string[];
  translations?: Array<{
    language_code?: string;
    title?: string;
    description?: string | null;
    bottom_description?: string | null;
  }>;
  is_featured?: boolean;
  is_admin_news?: boolean;
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

function formatDateTime(value?: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function contentType(type?: BackendNews["type"]): ContentType {
  if (type === "short") return "Shorts";
  if (type === "video") return "Video";
  if (type === "story") return "Story";
  return "Article";
}

function status(value?: string): NewsStatus {
  const map: Record<string, NewsStatus> = {
    approved: "Published",
    published: "Published",
    submitted: "Pending",
    draft: "Draft",
    scheduled: "Scheduled",
    rejected: "Rejected",
  };
  return value ? map[value] ?? "Pending" : "Pending";
}

function locationName(value: LocationRef): string | number | null {
  if (value && typeof value === "object") return value.name || value.id || null;
  return value ?? null;
}

function locationId(value: LocationRef, fallback?: number | null): number | null {
  if (typeof value === "number") return value;
  if (value && typeof value === "object" && typeof value.id === "number") return value.id;
  return fallback ?? null;
}

function visibility(value: BackendNews["visibility"]): NewsItem["visibility"] {
  if (!value || value.scope === "all_india") return { type: "All India" };
  if (value.scope === "state") {
    return { type: "By State", state: value.states?.join(", ") || value.state_ids?.join(", "), stateIds: value.state_ids ?? [] };
  }
  if (value.scope === "district") {
    return { type: "By District", district: value.districts?.join(", ") || value.district_ids?.join(", "), districtIds: value.district_ids ?? [] };
  }
  if (value.scope === "area") {
    return { type: "By Area", area: value.areas?.join(", ") || value.area_ids?.join(", "), areaIds: value.area_ids ?? [] };
  }
  return { type: "Private", users: value.users?.join(", ") || value.user_ids?.join(", "), userIds: value.user_ids ?? [] };
}

export function toNewsItem(row: BackendNews): NewsItem {
  const thumbnail = row.thumbnail_url || "";
  const creator = row.creator ?? row.created_by_user ?? null;
  const createdById = row.created_by ?? creator?.id ?? null;
  const creatorName = creator?.name || (createdById ? `User #${createdById}` : "Admin");
  const creatorRole = creator?.role ?? row.created_by_role ?? (row.is_admin_news ? "Admin" : "User");
  const views = row.view_count ?? 0;

  return {
    id: String(row.id),
    code: `NWS${row.id}`,
    title: row.title,
    description: row.description ?? null,
    bottomDescription: row.bottom_description ?? null,
    slug: row.slug,
    thumbnail,
    thumbnailUrl: row.thumbnail_url ?? null,
    videoUrl: row.video_url ?? null,
    durationSeconds: row.duration_seconds ?? null,
    category: row.categories?.[0]?.name || "General",
    categories: row.categories,
    channel: row.channel ? { name: row.channel.name, logo: row.channel.image_url || undefined } : undefined,
    newsSourceId: row.news_source_id ?? row.channel?.id ?? null,
    sourceName: row.source_name ?? null,
    sourceLink: row.source_link ?? null,
    contentType: contentType(row.type),
    type: row.type,
    languageCode: row.language_code,
    language: row.language_name || row.language_code || "—",
    location: row.location
      ? {
          state: locationName(row.location.state) ?? row.location.state_id ?? null,
          district: locationName(row.location.district) ?? row.location.district_id ?? null,
          area: locationName(row.location.area) ?? row.location.area_id ?? null,
          stateId: locationId(row.location.state, row.location.state_id),
          districtId: locationId(row.location.district, row.location.district_id),
          areaId: locationId(row.location.area, row.location.area_id),
        }
      : undefined,
    visibility: visibility(row.visibility),
    hasPoll: row.has_poll ?? Boolean(row.poll),
    pollQuestion: row.poll_question ?? row.poll?.question ?? null,
    poll: row.poll ?? null,
    tags: row.tags ?? [],
    translations: row.translations ?? [],
    views,
    status: status(row.status),
    statusLabel: row.status_label,
    rejectionReason: row.rejection_reason ?? null,
    scheduledFor: row.scheduled_for ?? null,
    publishedOn: formatDateTime(row.published_at || row.created_at),
    uploadedOn: formatDateTime(row.created_at),
    uploadedBy: {
      id: createdById ?? undefined,
      name: creatorName,
      email: creator?.email ?? undefined,
      avatar: creator?.avatar_url ?? undefined,
      role: creatorRole,
    },
    createdBy: creatorName,
    createdById,
    createdByRole: creatorRole,
    analytics: {
      views,
      shares: row.share_count ?? 0,
      comments: row.comment_count ?? 0,
      hasPoll: row.has_poll ?? Boolean(row.poll),
    },
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    isFeatured: row.is_featured,
    isAdminNews: row.is_admin_news,
  };
}
