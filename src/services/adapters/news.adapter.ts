import type { NewsItem, ContentType, NewsStatus } from "@/types/news";

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
  status?: string;
  status_label?: string;
  rejection_reason?: string | null;
  scheduled_for?: string | null;
  published_at?: string | null;
  created_at?: string;
  updated_at?: string;
  created_by?: number;
  location?: {
    state?: string | number | null;
    district?: string | number | null;
    area?: string | number | null;
    state_id?: number | null;
    district_id?: number | null;
    area_id?: number | null;
  } | null;
  visibility?: {
    scope?: "all_india" | "state" | "district" | "area";
    states?: string[];
    districts?: string[];
    areas?: string[];
    state_ids?: number[];
    district_ids?: number[];
    area_ids?: number[];
  };
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

function visibility(value: BackendNews["visibility"]): NewsItem["visibility"] {
  if (!value || value.scope === "all_india") return { type: "All India" };
  if (value.scope === "state") return { type: "By State", state: value.states?.join(", ") || value.state_ids?.join(", ") };
  if (value.scope === "district") return { type: "By District", district: value.districts?.join(", ") || value.district_ids?.join(", ") };
  return { type: "By Area", area: value.areas?.join(", ") || value.area_ids?.join(", ") };
}

export function toNewsItem(row: BackendNews): NewsItem {
  const thumbnail = row.thumbnail_url || "";

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
          state: row.location.state ?? row.location.state_id ?? null,
          district: row.location.district ?? row.location.district_id ?? null,
          area: row.location.area ?? row.location.area_id ?? null,
          stateId: row.location.state_id ?? null,
          districtId: row.location.district_id ?? null,
          areaId: row.location.area_id ?? null,
        }
      : undefined,
    visibility: visibility(row.visibility),
    tags: row.tags ?? [],
    translations: row.translations ?? [],
    views: row.view_count ?? 0,
    status: status(row.status),
    statusLabel: row.status_label,
    rejectionReason: row.rejection_reason ?? null,
    scheduledFor: row.scheduled_for ?? null,
    publishedOn: formatDate(row.published_at || row.created_at),
    createdBy: row.created_by ? `User #${row.created_by}` : "Admin",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    isFeatured: row.is_featured,
    isAdminNews: row.is_admin_news,
  };
}
