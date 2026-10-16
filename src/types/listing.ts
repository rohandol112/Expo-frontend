import type { AdminStatus } from "@/types/system";
import type { ImageValue, StoredImage } from "@/lib/mediaUpload";

export type ListingType = "Shop" | "Product" | "Service";

export interface ListingLocation {
  stateId?: string;
  state?: string;
  districtId?: string;
  district?: string;
  areaId?: string;
  area?: string;
  locality?: string;
  address?: string;
  latitude?: string;
  longitude?: string;
}

export interface ShopTimings {
  mode: "all_days" | "custom";
  open24Hours: boolean;
  openingTime?: string;
  closingTime?: string;
  /** Lower-case day code ("sun"), when the shop has one weekly off. */
  weeklyOff?: string;
}

export interface ServiceAvailability {
  /** Display day names: "Mon".."Sun". */
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
  shops?: string;
  coverImage?: StoredImage;
  images: StoredImage[];
  phone?: string;
  whatsapp?: string;
  email?: string;
  pincode?: string;
  location: ListingLocation;
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

/** What the add / edit forms send; images may still be files that the service uploads. */
export interface ListingInput {
  name: string;
  type: ListingType;
  categoryIds: string[];
  subCategoryIds: string[];
  shopIds?: string[];
  coverImage?: ImageValue[];
  images?: ImageValue[];
  phone?: string;
  whatsapp?: string;
  email?: string;
  pincode?: string;
  location?: ListingLocation;
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
  status: "Active" | "Inactive";
}
