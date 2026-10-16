import { API } from "@/lib/apiEndpoints";
import { httpClient } from "@/lib/httpClient";
import { imageKey, storedImage } from "@/lib/mediaUpload";
import { uploadRewardImage } from "@/services/adapters/rewards.adapter";
import type { GiftRank, GiftRankInput } from "@/types/referrals";

interface ApiGiftRank {
  rank: number;
  location_id: number | null;
  inherited: boolean;
  gift_name: string;
  short_description: string | null;
  photo_key: string | null;
  photo_url: string | null;
  gift_value: number | null;
}

/** "all" is the All Locations default; anything else is a competition location id. */
const scopeParam = (locationId: string) => (locationId === "all" ? undefined : Number(locationId));

function toRank(r: ApiGiftRank, locationId: string): GiftRank {
  return {
    rank: r.rank,
    locationId,
    giftName: r.gift_name ?? "",
    shortDescription: r.short_description ?? "",
    photo: storedImage(r.photo_key, r.photo_url),
    giftValue: r.gift_value,
    inherited: r.inherited,
  };
}

export const giftRankService = {
  /** The 10 rank slots for a scope; empty slots come back with a blank gift name. */
  async list(locationId: string): Promise<GiftRank[]> {
    const data = await httpClient.get<{ location_id: number | null; ranks: ApiGiftRank[] }>(API.rewards.giftRanks, {
      params: { location_id: scopeParam(locationId) },
    });
    return data.ranks.map((r) => toRank(r, locationId));
  },

  /**
   * Replaces the scope's ranks. For a location, rows still inherited from All
   * Locations are left out, so they keep following the default.
   */
  async saveAll(locationId: string, ranks: GiftRankInput[]): Promise<GiftRank[]> {
    const upload = uploadRewardImage("gift");
    const own = locationId === "all" ? ranks : ranks.filter((r) => !r.inherited);
    const body = await Promise.all(
      own.map(async (r) => ({
        rank: r.rank,
        gift_name: r.giftName.trim(),
        short_description: r.shortDescription.trim() || null,
        photo_key: await imageKey(r.photo, upload),
        gift_value: r.giftValue,
      })),
    );
    await httpClient.put(API.rewards.giftRanks, { location_id: scopeParam(locationId) ?? null, ranks: body });
    return this.list(locationId);
  },
};
