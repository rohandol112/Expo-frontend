import type { AdminStatus } from "@/types/system";

export interface Channel {
  id: string;
  name: string;
  logo: string;
  logoUrl?: string;
  languageCode?: string;
  language: string;
  website: string;
  description: string;
  stateId?: number;
  state: string;
  districtId?: number;
  district: string;
  areaIds?: number[];
  areas: string[];
  posts: number;
  subscribers: number;
  addedOn: string;
  status: AdminStatus;
  allowUserPosts: boolean;
}
