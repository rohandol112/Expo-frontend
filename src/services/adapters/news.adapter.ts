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
  location?: {
    state?: string | number | null;
    district?: string | number | null;
    area?: string | number | null;
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
  creator?: { id: number; name: string | null; phone: string; email: string | null; avatar_url: string | null; role?: string | null } | null;
  created_by_user?: { id: number; name: string | null; phone: string; email: string | null; avatar_url: string | null; role?: string | null } | null;
  created_by_role?: string | null;
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
          state: typeof row.location.state === 'object' && row.location.state !== null
            ? (row.location.state as any).name
            : row.location.state ?? null,
          district: typeof row.location.district === 'object' && row.location.district !== null
            ? (row.location.district as any).name
            : row.location.district ?? null,
          area: typeof row.location.area === 'object' && row.location.area !== null
            ? (row.location.area as any).name
            : row.location.area ?? null,
          stateId: row.location.state_id ?? (typeof row.location.state === 'object' && row.location.state !== null ? (row.location.state as any).id : null),
          districtId: row.location.district_id ?? (typeof row.location.district === 'object' && row.location.district !== null ? (row.location.district as any).id : null),
          areaId: row.location.area_id ?? (typeof row.location.area === 'object' && row.location.area !== null ? (row.location.area as any).id : null),
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
    publishedOn: formatDate(row.published_at || row.created_at),
    createdBy: creatorName,
    createdById,
    createdByRole: creatorRole,
    uploadedBy: creator
      ? {
          id: creator.id,
          name: creator.name || `User #${creator.id}`,
          email: creator.email ?? undefined,
          avatar: creator.avatar_url ?? undefined,
          role: creatorRole,
        }
      : createdById
        ? {
            id: createdById,
            name: `User #${createdById}`,
            role: creatorRole,
          }
        : undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    isFeatured: row.is_featured,
    isAdminNews: row.is_admin_news,
  };
}
