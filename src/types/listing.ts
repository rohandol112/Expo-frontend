import type { AdminStatus } from "@/types/system";

export type ListingType = "Shop" | "Product" | "Service";

export interface ListingLocation {
  stateId?: string;
  state?: string;
  districtId?: string;
  district?: string;
  area?: string;
  address?: string;
  latitude?: string;
  longitude?: string;
}

export interface ShopTimings {
  mode: "all_days" | "custom";
  open24Hours: boolean;
  openingTime?: string;
  closingTime?: string;
  weeklyOff?: string;
}

export interface ServiceAvailability {
  days: string[];
  startTime?: string;
  endTime?: string;
  is24Hours: boolean;
}

export interface Listing {
  id: string;
  name: string;
  type: ListingType;
  categoryIds: string[];
  category: string;
  subCategoryIds: string[];
  subcategory: string;
  shopIds?: string[];
  coverImage?: string;
  images: string[];
  phone?: string;
  whatsapp?: string;
  email?: string;
  pincode?: string;
  location: ListingLocation;
  city: string;
  contact: string;
  offerMessage?: string;
  shortDescription?: string;
  fullDescription?: string;
  highlights?: string[];
  price?: number;
  salePrice?: number;
  discountShortMessage?: string;
  discountMessage?: string;
  timings?: ShopTimings;
  availability?: ServiceAvailability;
  featured?: boolean;
  createdOn: string;
  views: number;
  status: AdminStatus;
}
