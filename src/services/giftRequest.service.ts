import type { GiftRequest } from "@/types/referrals";
import { giftRequests as seedGiftRequests } from "@/mock/giftRequests.mock";

let giftRequests: GiftRequest[] = [...seedGiftRequests];

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

export const giftRequestService = {
  async list(): Promise<{ items: GiftRequest[]; total: number }> {
    const items = [...giftRequests].sort((a, b) => b.requestedAt.localeCompare(a.requestedAt));
    return { items: clone(items), total: items.length };
  },

  async get(id: string): Promise<GiftRequest | undefined> {
    return clone(giftRequests.find((g) => g.id === id));
  },

  async approve(id: string): Promise<GiftRequest | undefined> {
    giftRequests = giftRequests.map((g) => (g.id === id ? { ...g, status: "Approved", rejectionReason: undefined } : g));
    return clone(giftRequests.find((g) => g.id === id));
  },

  async reject(id: string, reason?: string): Promise<GiftRequest | undefined> {
    giftRequests = giftRequests.map((g) => (g.id === id ? { ...g, status: "Rejected", rejectionReason: reason } : g));
    return clone(giftRequests.find((g) => g.id === id));
  },
};
