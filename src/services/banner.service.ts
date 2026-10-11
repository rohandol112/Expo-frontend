import type { Banner } from "@/types/banner";
import { banners as seedBanners } from "@/mock/banners.mock";

// Mock-backed for now — see listingCategory.service.ts for the pattern.
let banners: Banner[] = [...seedBanners];
let nextId = banners.length + 1;

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

export const bannerService = {
  async list(): Promise<{ items: Banner[]; total: number }> {
    const items = [...banners].sort((a, b) => a.sortOrder - b.sortOrder);
    return { items: clone(items), total: items.length };
  },

  async get(id: string): Promise<Banner | undefined> {
    return clone(banners.find((b) => b.id === id));
  },

  async create(payload: Omit<Banner, "id" | "createdOn">): Promise<Banner> {
    const banner: Banner = {
      ...payload,
      id: `ban-${nextId++}`,
      createdOn: new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date()),
    };
    banners = [...banners, banner];
    return clone(banner);
  },

  async update(id: string, payload: Partial<Omit<Banner, "id">>): Promise<Banner | undefined> {
    banners = banners.map((b) => (b.id === id ? { ...b, ...payload } : b));
    return clone(banners.find((b) => b.id === id));
  },

  async remove(id: string): Promise<void> {
    banners = banners.filter((b) => b.id !== id);
  },

  async reorder(orderedIds: string[]): Promise<Banner[]> {
    const order = new Map(orderedIds.map((id, index) => [id, index + 1]));
    banners = banners.map((b) => (order.has(b.id) ? { ...b, sortOrder: order.get(b.id)! } : b));
    return clone([...banners].sort((a, b) => a.sortOrder - b.sortOrder));
  },
};
