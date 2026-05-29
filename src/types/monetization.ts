import type { AdminStatus } from "@/types/system";

export interface AdUnit {
  id: string;
  name: string;
  preview: string;
  language: string;
  location: string;
  area: string;
  revenue: string;
  clicks: number;
  impressions: number;
  status: AdminStatus;
}
