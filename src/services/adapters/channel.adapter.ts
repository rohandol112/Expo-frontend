import type { Channel } from "@/types/channel";

interface BackendRegionRef {
  id: number;
  name: string;
}

export interface BackendChannel {
  id: number;
  title?: string;
  name?: string;
  company_name?: string | null;
  source_url?: string;
  image_url?: string | null;
  logo_url?: string | null;
  logo_key?: string | null;
  language_name?: string | null;
  language_code?: string | null;
  state_id?: number | null;
  state?: string | BackendRegionRef | null;
  district_id?: number | null;
  district?: string | BackendRegionRef | null;
  area_ids?: number[] | null;
  areas?: Array<string | BackendRegionRef> | null;
  is_active?: boolean;
  created_at?: string;
  post_count?: number;
  subscribers_count?: number;
  subscribersCount?: number;
  subscriber_count?: number;
  subscriberCount?: number;
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

function formatDateTime(value?: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

export function toChannel(row: BackendChannel): Channel {
  const name = row.title || row.name || row.company_name || "Untitled Channel";
  const stateId = row.state_id ?? (typeof row.state === "object" ? row.state?.id : undefined);
  const stateName = typeof row.state === "object" ? row.state?.name : row.state;
  const districtId = row.district_id ?? (typeof row.district === "object" ? row.district?.id : undefined);
  const districtName = typeof row.district === "object" ? row.district?.name : row.district;
  const areaIds = row.area_ids ?? row.areas?.map((area) => (typeof area === "object" ? area.id : undefined)).filter((id): id is number => Boolean(id));
  const areaNames = row.areas?.map((area) => (typeof area === "object" ? area.name : area)).filter(Boolean) as string[] | undefined;
  return {
    id: String(row.id),
    name,
    logo: initials(name) || "CH",
    logoUrl: row.logo_url || row.image_url || undefined,
    logoKey: row.logo_key || undefined,
    languageCode: row.language_code || undefined,
    language: row.language_name || row.language_code || "—",
    website: row.source_url || "",
    description: row.company_name || "—",
    stateId: stateId ?? undefined,
    state: stateName || "National",
    districtId: districtId ?? undefined,
    district: districtName || "—",
    areaIds: areaIds?.length ? areaIds : undefined,
    areas: areaNames?.length ? areaNames : [stateName ? "—" : "All India"],
    posts: row.post_count ?? 0,
    subscribers: Number(row.subscribers_count ?? row.subscribersCount ?? row.subscriber_count ?? row.subscriberCount ?? row.subscribers ?? 0),
    addedOn: formatDateTime(row.created_at),
    status: row.is_active === false ? "Inactive" : "Active",
    allowUserPosts: false,
  };
}
