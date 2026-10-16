import { API } from "@/lib/apiEndpoints";
import { httpClient } from "@/lib/httpClient";
import { formatDateTime, toAdminStatus, toApiStatus } from "@/lib/format";
import { imageKey, storedImage } from "@/lib/mediaUpload";
import { uploadListingImage } from "@/services/listing.service";
import type { ListingType } from "@/types/listing";
import type { ListingSubCategory, ListingSubCategoryInput } from "@/types/listingCategory";

interface ApiSubCategory {
  id: number;
  category_id: number;
  category_name: string | null;
  name: string;
  type: "shop" | "product" | "service";
  icon_key: string | null;
  icon_url: string | null;
  status: string;
  sort_order: number;
  display_on_home: boolean;
  shops_count: number;
  products_count: number;
  services_count: number;
  created_at: string;
}

const TYPE_LABEL: Record<ApiSubCategory["type"], ListingType> = { shop: "Shop", product: "Product", service: "Service" };

function toSubCategory(r: ApiSubCategory): ListingSubCategory {
  return {
    id: String(r.id),
    categoryId: String(r.category_id),
    category: r.category_name ?? "",
    name: r.name,
    type: TYPE_LABEL[r.type],
    icon: storedImage(r.icon_key, r.icon_url),
    status: toAdminStatus(r.status),
    sortOrder: r.sort_order,
    displayOnHome: r.display_on_home,
    shopsCount: r.shops_count,
    productsCount: r.products_count,
    servicesCount: r.services_count,
    createdOn: formatDateTime(r.created_at),
  };
}

async function toBody(input: ListingSubCategoryInput) {
  return {
    category_id: Number(input.categoryId),
    name: input.name.trim(),
    type: input.type.toLowerCase(),
    icon_key: await imageKey(input.icon, uploadListingImage("sub-category-icon")),
    status: toApiStatus(input.status),
    sort_order: input.sortOrder,
    display_on_home: input.displayOnHome,
  };
}

export const listingSubCategoryService = {
  async list(params?: { categoryId?: string }): Promise<{ items: ListingSubCategory[]; total: number }> {
    const data = await httpClient.get<{ items: ApiSubCategory[] }>(API.listings.subCategories, {
      params: { category_id: params?.categoryId ? Number(params.categoryId) : undefined },
    });
    const items = data.items.map(toSubCategory).sort((a, b) => a.sortOrder - b.sortOrder);
    return { items, total: items.length };
  },

  async get(id: string): Promise<ListingSubCategory> {
    return toSubCategory(await httpClient.get<ApiSubCategory>(API.listings.subCategory(id)));
  },

  async create(input: ListingSubCategoryInput): Promise<ListingSubCategory> {
    return toSubCategory(await httpClient.post<ApiSubCategory>(API.listings.subCategories, await toBody(input)));
  },

  async update(id: string, input: ListingSubCategoryInput): Promise<ListingSubCategory> {
    return toSubCategory(await httpClient.put<ApiSubCategory>(API.listings.subCategory(id), await toBody(input)));
  },

  async remove(id: string): Promise<void> {
    await httpClient.delete(API.listings.subCategory(id));
  },

  async reorder(orderedIds: string[]): Promise<void> {
    await httpClient.put(API.listings.subCategoriesReorder, { ids: orderedIds.map(Number) });
  },
};
