import type { AdminStatus } from "@/types/system";
import type { ListingType } from "@/types/listing";
import type { ImageValue, StoredImage } from "@/lib/mediaUpload";

export interface ListingCategory {
  id: string;
  name: string;
  slug: string;
  icon?: StoredImage;
  status: AdminStatus;
  sortOrder: number;
  subCategoryCount: number;
  listingCount: number;
  createdOn: string;
}

export interface ListingCategoryInput {
  name: string;
  slug: string;
  icon: ImageValue[];
  status: "Active" | "Inactive";
  sortOrder: number;
}

export interface ListingSubCategory {
  id: string;
  categoryId: string;
  category: string;
  name: string;
  type: ListingType;
  icon?: StoredImage;
  status: AdminStatus;
  sortOrder: number;
  displayOnHome: boolean;
  shopsCount?: number;
  productsCount?: number;
  servicesCount?: number;
  createdOn: string;
}

export interface ListingSubCategoryInput {
  categoryId: string;
  name: string;
  type: ListingType;
  icon: ImageValue[];
  status: "Active" | "Inactive";
  sortOrder: number;
  displayOnHome: boolean;
}
