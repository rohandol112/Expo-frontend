export type ManualAdStatus = "active" | "paused" | "scheduled";
export type AdPlacementKey = "news_feed" | "shorts" | "detail_page";

export interface MonetizationSettings {
  admob_enabled: boolean;
  manual_ads_enabled: boolean;
  updated_at: string;
}

export interface ManualAd {
  id: number;
  name: string;
  description: string;
  image_key: string | null;
  image_url: string | null;
  target_url: string | null;
  language_code: string | null;
  state_ids: number[];
  district_ids: number[];
  area_ids: number[];
  placements: AdPlacementKey[];
  frequency: number;
  display_order: number;
  status: ManualAdStatus;
  starts_at: string | null;
  ends_at: string | null;
  clicks: number;
  impressions: number;
  created_at: string;
}

export interface ManualAdListData {
  items: ManualAd[];
  page: number;
  per_page: number;
  total: number;
  has_more: boolean;
  counts: { total: number; active: number; paused: number; scheduled: number };
}

export interface ManualAdInput {
  name: string;
  description?: string;
  image_key?: string | null;
  target_url?: string | null;
  language_code?: string | null;
  state_ids?: number[];
  district_ids?: number[];
  area_ids?: number[];
  placements?: AdPlacementKey[];
  frequency?: number;
  display_order?: number;
  status?: ManualAdStatus;
  starts_at?: string | null;
  ends_at?: string | null;
}

export const PLACEMENT_LABELS: Record<AdPlacementKey, string> = {
  news_feed: "News Feed",
  shorts: "Shorts",
  detail_page: "Detail Page",
};
