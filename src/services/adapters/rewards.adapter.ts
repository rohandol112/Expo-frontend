import { API } from "@/lib/apiEndpoints";
import { uploadFile } from "@/lib/mediaUpload";
import type { RewardUserBase, TrendStat } from "@/types/referrals";

/** The user columns every reward report row carries. */
export interface ApiRewardUser {
  user_id: number;
  name: string | null;
  phone: string | null;
  state: string | null;
  district: string | null;
  area: string | null;
  language_code: string | null;
  language: string | null;
}

export interface ApiTrendStat {
  value: number;
  previous?: number;
  change_pct: number | null;
}

export interface ApiPage<T> {
  items: T[];
  page: number;
  per_page: number;
  total: number;
  has_more: boolean;
}

export function toRewardUser(r: ApiRewardUser): RewardUserBase {
  return {
    userId: String(r.user_id),
    name: r.name || "Unnamed user",
    phone: r.phone ?? "",
    state: r.state ?? "",
    district: r.district ?? "",
    area: r.area ?? "",
    language: r.language ?? r.language_code ?? "",
  };
}

export function toTrend(s: ApiTrendStat | undefined): TrendStat {
  return { value: s?.value ?? 0, changePct: s?.change_pct ?? null };
}

/** "Area, District, State" without the empty parts. */
export function placeLabel(r: { area: string; district: string; state: string }): string {
  return [r.area, r.district, r.state].filter(Boolean).join(", ") || "—";
}

/** "↑12% · label" / "↓3% · label" / "label" for a stat card subtitle. */
export function trendSubtitle(stat: TrendStat, label: string): string {
  if (stat.changePct === null) return label;
  const arrow = stat.changePct >= 0 ? "↑" : "↓";
  return `${arrow}${Math.abs(stat.changePct)}% · ${label}`;
}

/** Uploads a rewards image (rank gift, quiz gift or delivery photo) and returns its key. */
export function uploadRewardImage(kind: "gift" | "quiz-gift" | "delivery") {
  return (file: File) => uploadFile(API.rewards.uploadUrl, { kind }, file);
}

/** Drops empty values so they never reach the query string. */
export function cleanParams<T extends Record<string, string | number | boolean | null | undefined>>(params: T) {
  const out: Record<string, string | number | boolean> = {};
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") out[k] = v;
  }
  return out;
}
