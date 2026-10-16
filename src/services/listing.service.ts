import { API } from "@/lib/apiEndpoints";
import { httpClient } from "@/lib/httpClient";
import { formatDate, toAdminStatus, toApiStatus } from "@/lib/format";
import { imageKey, imageKeys, storedImage, uploadFile, type StoredImage } from "@/lib/mediaUpload";
import type { Listing, ListingInput, ListingType } from "@/types/listing";

export type ListingUploadKind = "category-icon" | "sub-category-icon" | "listing-cover" | "listing-image" | "banner";

/** Uploads one admin listings image (icon, cover, gallery or banner) and returns its storage key. */
export function uploadListingImage(kind: ListingUploadKind) {
  return (file: File) => uploadFile(API.listings.uploadUrl, { kind }, file);
}

interface NamedRef {
  id: number;
  name: string;
}

interface Page<T> {
  items: T[];
  page: number;
  per_page: number;
  total: number;
  has_more: boolean;
}

/** Every page of a paginated admin list (100 per request), for pages that filter on the client. */
export async function fetchAllPages<T>(path: string, params: Record<string, string | number | boolean | undefined> = {}): Promise<T[]> {
  const items: T[] = [];
  for (let page = 1; page <= 50; page++) {
    const data = await httpClient.get<Page<T>>(path, { params: { ...params, page, per_page: 100 } });
    items.push(...data.items);
    if (!data.has_more) break;
  }
  return items;
}

interface ApiListing {
  id: number;
  type: "shop" | "product" | "service";
  name: string;
  category_ids: number[];
  categories: NamedRef[];
  sub_category_ids: number[];
  sub_categories: NamedRef[];
  shop_ids: number[];
  shops: NamedRef[];
  cover_image_key: string | null;
  cover_image_url: string | null;
  image_keys: string[];
  image_urls: string[];
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  pincode: string | null;
  state_id: number | null;
  state_name: string | null;
  district_id: number | null;
  district_name: string | null;
  area_id: number | null;
  area_name: string | null;
  locality: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  offer_message: string | null;
  short_description: string | null;
  full_description: string | null;
  highlights: string[];
  price: number | null;
  sale_price: number | null;
  discount_short_message: string | null;
  discount_message: string | null;
  timings: {
    mode: "all_days" | "custom";
    open_24_hours: boolean;
    opening_time?: string | null;
    closing_time?: string | null;
    weekly_off?: string | null;
  } | null;
  availability: { days: string[]; start_time?: string | null; end_time?: string | null; is_24_hours: boolean } | null;
  is_featured: boolean;
  status: string;
  views: number;
  created_at: string;
}

export interface ListingStats {
  totalShops: number;
  totalProducts: number;
  totalServices: number;
  totalListings: number;
}

const TYPE_LABEL: Record<ApiListing["type"], ListingType> = { shop: "Shop", product: "Product", service: "Service" };
const dayLabel = (day: string) => day.charAt(0).toUpperCase() + day.slice(1, 3);
const str = (v: string | number | null | undefined) => (v === null || v === undefined ? undefined : String(v));
const names = (refs: NamedRef[]) => refs.map((r) => r.name).join(", ");

function toListing(r: ApiListing): Listing {
  const images = r.image_keys
    .map((key, i) => storedImage(key, r.image_urls[i]))
    .filter((img): img is StoredImage => Boolean(img));
  return {
    id: String(r.id),
    name: r.name,
    type: TYPE_LABEL[r.type],
    categoryIds: r.category_ids.map(String),
    category: names(r.categories),
    subCategoryIds: r.sub_category_ids.map(String),
    subcategory: names(r.sub_categories),
    shopIds: r.shop_ids.map(String),
    shops: names(r.shops),
    coverImage: storedImage(r.cover_image_key, r.cover_image_url),
    images,
    phone: r.phone ?? undefined,
    whatsapp: r.whatsapp ?? undefined,
    email: r.email ?? undefined,
    pincode: r.pincode ?? undefined,
    location: {
      stateId: str(r.state_id),
      state: r.state_name ?? undefined,
      districtId: str(r.district_id),
      district: r.district_name ?? undefined,
      areaId: str(r.area_id),
      area: r.area_name ?? undefined,
      locality: r.locality ?? undefined,
      address: r.address ?? undefined,
      latitude: str(r.latitude),
      longitude: str(r.longitude),
    },
    offerMessage: r.offer_message ?? undefined,
    shortDescription: r.short_description ?? undefined,
    fullDescription: r.full_description ?? undefined,
    highlights: r.highlights,
    price: r.price ?? undefined,
    salePrice: r.sale_price ?? undefined,
    discountShortMessage: r.discount_short_message ?? undefined,
    discountMessage: r.discount_message ?? undefined,
    timings: r.timings
      ? {
          mode: r.timings.mode,
          open24Hours: r.timings.open_24_hours,
          openingTime: r.timings.opening_time ?? undefined,
          closingTime: r.timings.closing_time ?? undefined,
          weeklyOff: r.timings.weekly_off ?? undefined,
        }
      : undefined,
    availability: r.availability
      ? {
          days: r.availability.days.map(dayLabel),
          startTime: r.availability.start_time ?? undefined,
          endTime: r.availability.end_time ?? undefined,
          is24Hours: r.availability.is_24_hours,
        }
      : undefined,
    featured: r.is_featured,
    createdOn: formatDate(r.created_at),
    views: r.views,
    status: toAdminStatus(r.status),
  };
}

const idOrNull = (v: string | undefined) => (v ? Number(v) : null);
const numOrNull = (v: string | undefined) => (v && v.trim() !== "" && Number.isFinite(Number(v)) ? Number(v) : null);

async function toBody(input: ListingInput) {
  const [coverKey, galleryKeys] = await Promise.all([
    input.coverImage ? imageKey(input.coverImage, uploadListingImage("listing-cover")) : Promise.resolve(undefined),
    input.images ? imageKeys(input.images, uploadListingImage("listing-image")) : Promise.resolve(undefined),
  ]);
  const loc = input.location ?? {};
  return {
    name: input.name.trim(),
    category_ids: input.categoryIds.map(Number),
    sub_category_ids: input.subCategoryIds.map(Number),
    shop_ids: (input.shopIds ?? []).map(Number),
    ...(coverKey !== undefined ? { cover_image_key: coverKey } : {}),
    ...(galleryKeys !== undefined ? { image_keys: galleryKeys } : {}),
    phone: input.phone ?? null,
    whatsapp: input.whatsapp ?? null,
    email: input.email ?? null,
    pincode: input.pincode ?? null,
    state_id: idOrNull(loc.stateId),
    district_id: idOrNull(loc.districtId),
    area_id: idOrNull(loc.areaId),
    locality: loc.locality ?? null,
    address: loc.address ?? null,
    latitude: numOrNull(loc.latitude),
    longitude: numOrNull(loc.longitude),
    offer_message: input.offerMessage ?? null,
    short_description: input.shortDescription ?? null,
    full_description: input.fullDescription ?? null,
    highlights: (input.highlights ?? []).map((h) => h.trim()).filter(Boolean),
    price: input.price ?? null,
    sale_price: input.salePrice ?? null,
    discount_short_message: input.discountShortMessage ?? null,
    discount_message: input.discountMessage ?? null,
    timings: input.timings
      ? {
          mode: input.timings.mode,
          open_24_hours: input.timings.open24Hours,
          opening_time: input.timings.open24Hours ? null : input.timings.openingTime || null,
          closing_time: input.timings.open24Hours ? null : input.timings.closingTime || null,
          weekly_off: input.timings.weeklyOff || null,
        }
      : null,
    availability: input.availability
      ? {
          days: input.availability.days.map((d) => d.slice(0, 3).toLowerCase()),
          start_time: input.availability.is24Hours ? null : input.availability.startTime || null,
          end_time: input.availability.is24Hours ? null : input.availability.endTime || null,
          is_24_hours: input.availability.is24Hours,
        }
      : null,
    is_featured: input.featured ?? false,
    status: toApiStatus(input.status),
  };
}

export const listingService = {
  async list(params?: { type?: ListingType; hasOffer?: boolean }): Promise<{ items: Listing[]; total: number }> {
    const rows = await fetchAllPages<ApiListing>(API.listings.list, {
      type: params?.type?.toLowerCase(),
      has_offer: params?.hasOffer ? true : undefined,
    });
    const items = rows.map(toListing);
    return { items, total: items.length };
  },

  async stats(): Promise<ListingStats> {
    const s = await httpClient.get<{ total_shops: number; total_products: number; total_services: number; total_listings: number }>(API.listings.stats);
    return { totalShops: s.total_shops, totalProducts: s.total_products, totalServices: s.total_services, totalListings: s.total_listings };
  },

  async get(id: string): Promise<Listing> {
    return toListing(await httpClient.get<ApiListing>(API.listings.detail(id)));
  },

  async create(input: ListingInput): Promise<Listing> {
    const body = await toBody(input);
    return toListing(await httpClient.post<ApiListing>(API.listings.list, { type: input.type.toLowerCase(), ...body }));
  },

  async update(id: string, input: ListingInput): Promise<Listing> {
    return toListing(await httpClient.put<ApiListing>(API.listings.detail(id), await toBody(input)));
  },

  async remove(id: string): Promise<void> {
    await httpClient.delete(API.listings.detail(id));
  },
};
