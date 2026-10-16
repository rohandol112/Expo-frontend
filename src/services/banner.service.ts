import { API } from "@/lib/apiEndpoints";
import { httpClient } from "@/lib/httpClient";
import { capitalize, formatDateTime } from "@/lib/format";
import { imageKey, storedImage } from "@/lib/mediaUpload";
import { fetchAllPages, uploadListingImage } from "@/services/listing.service";
import type { Banner, BannerInput, BannerStatus } from "@/types/banner";

interface NamedRef {
  id: number;
  name: string;
}

interface ApiBanner {
  id: number;
  name: string;
  image_key: string | null;
  image_url: string | null;
  link_url: string | null;
  category_ids: number[];
  categories: NamedRef[];
  sub_category_ids: number[];
  sub_categories: NamedRef[];
  state_ids: number[];
  states: NamedRef[];
  district_ids: number[];
  districts: NamedRef[];
  area_ids: number[];
  areas: NamedRef[];
  sort_order: number;
  status: "active" | "inactive" | "draft";
  views: number;
  created_at: string;
}

const names = (refs: NamedRef[], whenEmpty = "") => (refs.length ? refs.map((r) => r.name).join(", ") : whenEmpty);

function toBanner(r: ApiBanner): Banner {
  return {
    id: String(r.id),
    name: r.name,
    image: storedImage(r.image_key, r.image_url),
    link: r.link_url ?? undefined,
    categoryIds: r.category_ids.map(String),
    category: names(r.categories),
    subCategoryIds: r.sub_category_ids.map(String),
    subcategory: names(r.sub_categories),
    stateIds: r.state_ids.map(String),
    districtIds: r.district_ids.map(String),
    areaIds: r.area_ids.map(String),
    state: names(r.states, "All States"),
    district: names(r.districts, "All Districts"),
    area: names(r.areas, "All Areas"),
    sortOrder: r.sort_order,
    status: capitalize(r.status) as BannerStatus,
    views: r.views,
    createdOn: formatDateTime(r.created_at),
  };
}

async function toBody(input: BannerInput) {
  return {
    name: input.name.trim(),
    image_key: await imageKey(input.image, uploadListingImage("banner")),
    link_url: input.link.trim(),
    category_ids: input.categoryIds.map(Number),
    sub_category_ids: input.subCategoryIds.map(Number),
    state_ids: input.stateIds.map(Number),
    district_ids: input.districtIds.map(Number),
    area_ids: input.areaIds.map(Number),
    sort_order: input.sortOrder,
    status: input.status.toLowerCase(),
  };
}

export const bannerService = {
  async list(): Promise<{ items: Banner[]; total: number }> {
    const items = (await fetchAllPages<ApiBanner>(API.listings.banners)).map(toBanner).sort((a, b) => a.sortOrder - b.sortOrder);
    return { items, total: items.length };
  },

  async get(id: string): Promise<Banner> {
    return toBanner(await httpClient.get<ApiBanner>(API.listings.banner(id)));
  },

  async create(input: BannerInput): Promise<Banner> {
    return toBanner(await httpClient.post<ApiBanner>(API.listings.banners, await toBody(input)));
  },

  async update(id: string, input: BannerInput): Promise<Banner> {
    return toBanner(await httpClient.put<ApiBanner>(API.listings.banner(id), await toBody(input)));
  },

  async remove(id: string): Promise<void> {
    await httpClient.delete(API.listings.banner(id));
  },

  async reorder(orderedIds: string[]): Promise<void> {
    await httpClient.put(API.listings.bannersReorder, { ids: orderedIds.map(Number) });
  },
};
