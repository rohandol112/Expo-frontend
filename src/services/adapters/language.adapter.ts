import type { Language } from "@/types/system";

export interface BackendLanguage {
  id: number;
  code: string;
  name: string;
  native_name?: string | null;
  direction?: "ltr" | "rtl";
  sort_order?: number;
  is_active?: boolean;
  created_at?: string;
  content_count?: number;
}

function formatDate(value?: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

export function toLanguage(row: BackendLanguage): Language {
  return {
    id: String(row.id),
    name: row.name,
    nativeName: row.native_name || row.name,
    code: row.code,
    direction: row.direction === "rtl" ? "RTL" : "LTR",
    status: row.is_active === false ? "Inactive" : "Active",
    contentCount: row.content_count ?? 0,
    addedOn: formatDate(row.created_at),
  };
}
