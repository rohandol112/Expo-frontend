import type { AdminStatus } from "@/types/system";
import type { ListingType } from "@/types/listing";

export interface ListingCategory {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  status: AdminStatus;
  sortOrder: number;
  createdOn: string;
}

export interface ListingSubCategory {
  id: string;
  categoryId: string;
  category: string;
  name: string;
  type: ListingType;
  icon?: string;
  status: AdminStatus;
  sortOrder: number;
  displayOnHome: boolean;
  shopsCount?: number;
  productsCount?: number;
  servicesCount?: number;
  createdOn: string;
}
