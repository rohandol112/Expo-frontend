import type { NewsItem, ContentType, NewsStatus } from "@/types/news";

export interface BackendNews {
  id: number;
  type?: "video" | "short" | "article" | "story";
  title: string;
  thumbnail_url?: string | null;
  language_code?: string;
  language_name?: string;
  channel?: { id: number; name: string } | null;
  categories?: Array<{ id: number; name: string }>;
  view_count?: number;
  status?: string;
  status_label?: string;
  published_at?: string | null;
  created_at?: string;
  created_by?: number;
  visibility?: {
    scope?: "all_india" | "state" | "district" | "area";
    states?: string[];
    districts?: string[];
    areas?: string[];
    state_ids?: number[];
    district_ids?: number[];
    area_ids?: number[];
  };
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
  return {
    id: String(row.id),
    code: `NWS${row.id}`,
    title: row.title,
    thumbnail: row.thumbnail_url || "https://images.unsplash.com/photo-1495020689067-958852a7765e?w=320&h=180&fit=crop",
    category: row.categories?.[0]?.name || "General",
    channel: row.channel ? { name: row.channel.name } : undefined,
    contentType: contentType(row.type),
    language: row.language_name || row.language_code || "Hindi",
    visibility: visibility(row.visibility),
    views: row.view_count ?? 0,
    status: status(row.status),
    publishedOn: formatDate(row.published_at || row.created_at),
    createdBy: row.created_by ? `User #${row.created_by}` : "Admin",
  };
}
