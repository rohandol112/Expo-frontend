import type { AdminStatus } from "@/types/system";

export interface Banner {
  id: string;
  name: string;
  image?: string;
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
  status: AdminStatus;
  createdOn: string;
}
