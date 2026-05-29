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
  name: string;
  code: string;
  status: AdminStatus;
  addedOn: string;
}

export interface DistrictItem {
  id: string;
  name: string;
  state: string;
  status: AdminStatus;
  addedOn: string;
}

export interface AreaItem {
  id: string;
  name: string;
  district: string;
  state: string;
  status: AdminStatus;
  addedOn: string;
}
