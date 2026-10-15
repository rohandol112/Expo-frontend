import type { ListingCategory } from "@/types/listingCategory";
import { listingCategories as seedCategories } from "@/mock/listingCategories.mock";

// Mock-backed for now — the real backend is being built separately. Each
// function mutates this in-memory copy and returns the same shape a real API
// would, so swapping the body for an httpClient call later is mechanical.
let categories: ListingCategory[] = [...seedCategories];
let nextId = categories.length + 1;

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

export const listingCategoryService = {
  async list(): Promise<{ items: ListingCategory[]; total: number }> {
    const items = [...categories].sort((a, b) => a.sortOrder - b.sortOrder);
    return { items: clone(items), total: items.length };
  },

  async get(id: string): Promise<ListingCategory | undefined> {
    return clone(categories.find((c) => c.id === id));
  },

  async create(payload: Omit<ListingCategory, "id" | "createdOn">): Promise<ListingCategory> {
    const category: ListingCategory = {
      ...payload,
      id: `cat-${nextId++}`,
      createdOn: new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date()),
    };
    categories = [...categories, category];
    return clone(category);
  },

  async update(id: string, payload: Partial<Omit<ListingCategory, "id">>): Promise<ListingCategory | undefined> {
    categories = categories.map((c) => (c.id === id ? { ...c, ...payload } : c));
    return clone(categories.find((c) => c.id === id));
  },

  async remove(id: string): Promise<void> {
    categories = categories.filter((c) => c.id !== id);
  },

  async reorder(orderedIds: string[]): Promise<ListingCategory[]> {
    const order = new Map(orderedIds.map((id, index) => [id, index + 1]));
    categories = categories.map((c) => (order.has(c.id) ? { ...c, sortOrder: order.get(c.id)! } : c));
    return clone([...categories].sort((a, b) => a.sortOrder - b.sortOrder));
  },
};
