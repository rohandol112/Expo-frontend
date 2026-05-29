import type { AdminStatus } from "@/types/system";

export interface NewsNotification {
  id: string;
  news: string;
  language: string;
  targetState: string;
  district: string;
  city: string;
  sentOn: string;
  targetLanguage: string;
  reach: number;
  open: number;
  status: AdminStatus;
}
