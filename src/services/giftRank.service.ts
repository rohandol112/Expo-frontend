import type { GiftRank } from "@/types/referrals";
import { giftRanks as seedGiftRanks, defaultGiftRanksForLocation } from "@/mock/giftRanks.mock";

let ranksByLocation: Record<string, GiftRank[]> = { all: [...seedGiftRanks] };

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

export const giftRankService = {
  async list(locationId: string): Promise<GiftRank[]> {
    if (!ranksByLocation[locationId]) {
      ranksByLocation[locationId] = defaultGiftRanksForLocation(locationId);
    }
    return clone(ranksByLocation[locationId]);
  },

  async saveAll(locationId: string, ranks: GiftRank[]): Promise<GiftRank[]> {
    ranksByLocation = { ...ranksByLocation, [locationId]: ranks.map((r) => ({ ...r, locationId })) };
    return clone(ranksByLocation[locationId]);
  },
};
