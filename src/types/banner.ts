import type { ImageValue, StoredImage } from "@/lib/mediaUpload";

export type BannerStatus = "Active" | "Inactive" | "Draft";

export interface Banner {
  id: string;
  name: string;
  image?: StoredImage;
  link?: string;
  categoryIds: string[];
  category: string;
  subCategoryIds: string[];
  subcategory: string;
  stateIds: string[];
  districtIds: string[];
  areaIds: string[];
  state: string;
  district: string;
  area: string;
  sortOrder: number;
  status: BannerStatus;
  views: number;
  createdOn: string;
}

export interface BannerInput {
  name: string;
  image: ImageValue[];
  link: string;
  categoryIds: string[];
  subCategoryIds: string[];
  stateIds: string[];
  districtIds: string[];
  areaIds: string[];
  sortOrder: number;
  status: BannerStatus;
}
