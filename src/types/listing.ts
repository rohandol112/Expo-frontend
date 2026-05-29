import type { AdminStatus } from "@/types/system";

export interface Listing {
  id: string;
  name: string;
  type: "Shop" | "Service";
  category: string;
  subcategory: string;
  city: string;
  contact: string;
  createdOn: string;
  views: number;
  status: AdminStatus;
}
