import type { Channel } from "@/types/channel";

export interface BackendChannel {
  id: number;
  title?: string;
  name?: string;
  company_name?: string | null;
  source_url?: string;
  image_url?: string | null;
  is_active?: boolean;
  created_at?: string;
  post_count?: number;
  subscribers?: number;
}

function initials(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function formatDate(value?: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

export function toChannel(row: BackendChannel): Channel {
  const name = row.title || row.name || row.company_name || "Untitled Channel";
  return {
    id: String(row.id),
    name,
    logo: initials(name) || "CH",
    language: "Hindi",
    website: row.source_url || "",
    description: row.company_name || "News source",
    state: "All India",
    district: "—",
    areas: ["All Areas"],
    posts: row.post_count ?? 0,
    subscribers: row.subscribers ?? 0,
    addedOn: formatDate(row.created_at),
    status: row.is_active === false ? "Inactive" : "Active",
    allowUserPosts: false,
  };
}
