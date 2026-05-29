import type { AdminStatus } from "@/types/system";

export interface Channel {
  id: string;
  name: string;
  logo: string;
  language: string;
  website: string;
  description: string;
  state: string;
  district: string;
  areas: string[];
  posts: number;
  addedOn: string;
  status: AdminStatus;
  allowUserPosts: boolean;
}
