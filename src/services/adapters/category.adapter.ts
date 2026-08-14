import type { Category } from "@/types/category";

export interface BackendCategory {
  id: number;
  slug: string;
  parent_id?: number | null;
  icon_url?: string | null;
  sort_order?: number;
  is_active?: boolean;
  name?: string;
  description?: string | null;
  language_code?: string;
  created_at?: string;
  updated_at?: string;
  post_count?: number;
  video_count?: number;
  is_featured?: boolean;
}

function formatDate(value?: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function languageName(code?: string) {
  const map: Record<string, string> = { hi: "Hindi", en: "English", mr: "Marathi", ta: "Tamil", bn: "Bengali", gu: "Gujarati", pa: "Punjabi" };
  return code ? map[code] ?? code.toUpperCase() : "—";
}

export function toCategory(row: BackendCategory): Category {
  return {
    id: String(row.id),
    name: row.name || row.slug,
    slug: row.slug,
    language: languageName(row.language_code),
    posts: row.post_count ?? row.video_count ?? 0,
    featured: row.is_featured ?? false,
    status: row.is_active === false ? "Inactive" : "Active",
    // TODO: replace with backend mobile-user preference count when exposed by category APIs.
    preferredUser: "0",
    displayOrder: row.sort_order ?? 0,
    createdOn: formatDate(row.created_at),
    updatedOn: formatDate(row.updated_at),
    imageUrl: row.icon_url || "",
  };
}
