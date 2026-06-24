import type { AdminUser } from "@/types/user";

export interface BackendRegionRef {
  id: number;
  name: string;
}

export interface BackendAdminUser {
  id: number;
  name?: string | null;
  avatar_url?: string | null;
  phone?: string | null;
  email?: string | null;
  dob?: string | null;
  gender?: string | null;
  role?: string;
  is_guest?: boolean;
  is_active?: boolean;
  language_code?: string | null;
  language_name?: string | null;
  state?: BackendRegionRef | null;
  district?: BackendRegionRef | null;
  area?: BackendRegionRef | null;
  referred_by?: { id: number; name: string | null } | null;
  posts?: number;
  registered_on?: string;
  last_active_at?: string | null;
  device_id?: string | null;
  "x-device-id"?: string | null;
  x_device_id?: string | null;
}

function formatDateTime(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(date);
}

export function toAdminUser(row: BackendAdminUser): AdminUser {
  return {
    id: String(row.id),
    name: row.name || (row.is_guest ? `Guest ${row.id}` : "—"),
    email: row.email || "—",
    phone: row.phone || "—",
    avatar: row.avatar_url || undefined,
    dob: formatDateTime(row.dob),
    language: row.language_name || row.language_code || "—",
    state: row.state?.name || "—",
    district: row.district?.name || "—",
    area: row.area?.name || "—",
    referredBy: row.referred_by?.name || "—",
    registeredOn: formatDateTime(row.registered_on),
    lastActive: formatDateTime(row.last_active_at),
    posts: row.posts ?? 0,
    status: row.is_active === false ? "Inactive" : "Active",
    type: row.is_guest ? "Guest" : "Registered",
    deviceId: row.device_id || row["x-device-id"] || row.x_device_id || "—",
  };
}
