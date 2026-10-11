import type { ListingSubCategory } from "@/types/listingCategory";
import { listingSubCategories as seedSubCategories } from "@/mock/listingSubCategories.mock";

// Mock-backed for now — see listingCategory.service.ts for the pattern.
let subCategories: ListingSubCategory[] = [...seedSubCategories];
let nextId = subCategories.length + 1;

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

export const listingSubCategoryService = {
  async list(params?: { categoryId?: string }): Promise<{ items: ListingSubCategory[]; total: number }> {
    let items = [...subCategories];
    if (params?.categoryId) items = items.filter((s) => s.categoryId === params.categoryId);
    items.sort((a, b) => a.sortOrder - b.sortOrder);
    return { items: clone(items), total: items.length };
  },

  async get(id: string): Promise<ListingSubCategory | undefined> {
    return clone(subCategories.find((s) => s.id === id));
  },

  async create(payload: Omit<ListingSubCategory, "id" | "createdOn">): Promise<ListingSubCategory> {
    const subCategory: ListingSubCategory = {
      ...payload,
      id: `sub-${nextId++}`,
      createdOn: new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date()),
    };
    subCategories = [...subCategories, subCategory];
    return clone(subCategory);
  },

  async update(id: string, payload: Partial<Omit<ListingSubCategory, "id">>): Promise<ListingSubCategory | undefined> {
    subCategories = subCategories.map((s) => (s.id === id ? { ...s, ...payload } : s));
    return clone(subCategories.find((s) => s.id === id));
  },

  async remove(id: string): Promise<void> {
    subCategories = subCategories.filter((s) => s.id !== id);
  },

  async reorder(orderedIds: string[]): Promise<ListingSubCategory[]> {
    const order = new Map(orderedIds.map((id, index) => [id, index + 1]));
    subCategories = subCategories.map((s) => (order.has(s.id) ? { ...s, sortOrder: order.get(s.id)! } : s));
    return clone([...subCategories].sort((a, b) => a.sortOrder - b.sortOrder));
  },
};
