export type BannerType = "main_slider" | "in_list" | "in_detail";
export type AdBannerStatus = "active" | "inactive";

export interface AdBanner {
  id: number;
  name: string;
  banner_type: BannerType;
  external_link: boolean;
  link_url: string | null;
  display_order: number;
  status: AdBannerStatus;
  image_key: string | null;
  image_url: string | null;
  state_ids: number[];
  district_ids: number[];
  area_ids: number[];
  views: number;
  created_at: string;
}

export interface AdBannerListData {
  items: AdBanner[];
  page: number;
  per_page: number;
  total: number;
  has_more: boolean;
}

export interface AdBannerInput {
  name: string;
  banner_type: BannerType;
  external_link: boolean;
  link_url: string | null;
  display_order: number;
  status: AdBannerStatus;
  image_key: string | null;
  state_ids: number[];
  district_ids: number[];
  area_ids: number[];
}

export const BANNER_TYPE_LABELS: Record<BannerType, string> = {
  main_slider: "Main Page Slider",
  in_list: "In List",
  in_detail: "In Detail Page",
};
