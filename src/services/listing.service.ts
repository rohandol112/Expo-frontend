import type { Listing } from "@/types/listing";
import { listings as seedListings } from "@/mock/listings.mock";

// Mock-backed for now — see listingCategory.service.ts for the pattern.
let listings: Listing[] = [...seedListings];
let nextId = listings.length + 1;

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

export interface ListingStats {
  totalShops: number;
  totalProducts: number;
  totalServices: number;
  totalListings: number;
}

export const listingService = {
  async list(params?: { type?: Listing["type"]; hasOffer?: boolean }): Promise<{ items: Listing[]; total: number }> {
    let items = [...listings];
    if (params?.type) items = items.filter((l) => l.type === params.type);
    if (params?.hasOffer) items = items.filter((l) => Boolean(l.offerMessage?.trim()));
    return { items: clone(items), total: items.length };
  },

  async stats(): Promise<ListingStats> {
    return {
      totalShops: listings.filter((l) => l.type === "Shop").length,
      totalProducts: listings.filter((l) => l.type === "Product").length,
      totalServices: listings.filter((l) => l.type === "Service").length,
      totalListings: listings.length,
    };
  },

  async get(id: string): Promise<Listing | undefined> {
    return clone(listings.find((l) => l.id === id));
  },

  async create(payload: Omit<Listing, "id" | "createdOn" | "views">): Promise<Listing> {
    const listing: Listing = {
      ...payload,
      id: `lst-${nextId++}`,
      views: 0,
      createdOn: new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date()),
    };
    listings = [...listings, listing];
    return clone(listing);
  },

  async update(id: string, payload: Partial<Omit<Listing, "id">>): Promise<Listing | undefined> {
    listings = listings.map((l) => (l.id === id ? { ...l, ...payload } : l));
    return clone(listings.find((l) => l.id === id));
  },

  async remove(id: string): Promise<void> {
    listings = listings.filter((l) => l.id !== id);
  },
};
