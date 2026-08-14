import type { AdminStatus } from "@/types/system";

export interface LocationOverview {
  id: string;
  language: string;
  states: number;
  districts: number;
  areas: number;
  status: AdminStatus;
}

export interface StateItem {
  id: string;
  language: string;
  name: string;
  code: string;
  status: AdminStatus;
  addedOn: string;
  imageUrl: string | null;
}

export interface DistrictItem {
  id: string;
  language: string;
  name: string;
  state: string;
  status: AdminStatus;
  addedOn: string;
}

export interface AreaItem {
  id: string;
  language: string;
  name: string;
  district: string;
  state: string;
  status: AdminStatus;
  addedOn: string;
}

export interface LocationPage<T> {
  items: T[];
  page: number;
  perPage: number;
  total: number;
  hasMore: boolean;
}

export interface BackendState {
  id: number;
  language_code: string;
  code: string;
  name: string;
  is_active: boolean;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
  image_url?: string | null;
}

export interface BackendDistrict {
  id: number;
  language_code: string;
  state_id: number;
  code?: string | null;
  name: string;
  is_active: boolean;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
}

export interface BackendArea {
  id: number;
  language_code: string;
  district_id: number;
  name: string;
  is_active: boolean;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
}

export interface LocationSummaryItem {
  language_code: string;
  states: number;
  districts: number;
  areas: number;
}
