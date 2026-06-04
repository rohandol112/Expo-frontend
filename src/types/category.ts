import type { AdminStatus } from "@/types/system";

export interface Category {
  id: string;
  name: string;
  slug: string;
  language: string;
  posts: number;
  featured: boolean;
  status: AdminStatus;
  preferredUser: string;
  displayOrder: number;
  createdOn: string;
  updatedOn: string;
  imageUrl: string;
  videoUrl?: string;
}
