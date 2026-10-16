import { API } from "@/lib/apiEndpoints";
import { httpClient } from "@/lib/httpClient";
import { formatDateTime, toAdminStatus, toApiStatus } from "@/lib/format";
import { imageKey, storedImage } from "@/lib/mediaUpload";
import { uploadListingImage } from "@/services/listing.service";
import type { ListingCategory, ListingCategoryInput } from "@/types/listingCategory";

interface ApiCategory {
  id: number;
  name: string;
  slug: string;
  icon_key: string | null;
  icon_url: string | null;
  status: string;
  sort_order: number;
  sub_category_count: number;
  listing_count: number;
  created_at: string;
}

function toCategory(r: ApiCategory): ListingCategory {
  return {
    id: String(r.id),
    name: r.name,
    slug: r.slug,
    icon: storedImage(r.icon_key, r.icon_url),
    status: toAdminStatus(r.status),
    sortOrder: r.sort_order,
    subCategoryCount: r.sub_category_count,
    listingCount: r.listing_count,
    createdOn: formatDateTime(r.created_at),
  };
}

async function toBody(input: ListingCategoryInput) {
  return {
    name: input.name.trim(),
    slug: input.slug.trim() || undefined,
    icon_key: await imageKey(input.icon, uploadListingImage("category-icon")),
    status: toApiStatus(input.status),
    sort_order: input.sortOrder,
  };
}

export const listingCategoryService = {
  async list(): Promise<{ items: ListingCategory[]; total: number }> {
    const data = await httpClient.get<{ items: ApiCategory[] }>(API.listings.categories);
    const items = data.items.map(toCategory).sort((a, b) => a.sortOrder - b.sortOrder);
    return { items, total: items.length };
  },

  async get(id: string): Promise<ListingCategory> {
    return toCategory(await httpClient.get<ApiCategory>(API.listings.category(id)));
  },

  async create(input: ListingCategoryInput): Promise<ListingCategory> {
    return toCategory(await httpClient.post<ApiCategory>(API.listings.categories, await toBody(input)));
  },

  async update(id: string, input: ListingCategoryInput): Promise<ListingCategory> {
    return toCategory(await httpClient.put<ApiCategory>(API.listings.category(id), await toBody(input)));
  },

  async remove(id: string): Promise<void> {
    await httpClient.delete(API.listings.category(id));
  },

  async reorder(orderedIds: string[]): Promise<void> {
    await httpClient.put(API.listings.categoriesReorder, { ids: orderedIds.map(Number) });
  },
};
