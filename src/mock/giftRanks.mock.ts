import type { GiftRank } from "@/types/referrals";

const DEFAULT_GIFTS = [
  { giftName: "iPhone 15", shortDescription: "Latest Apple smartphone with 128GB storage" },
  { giftName: "Samsung Smart TV 43\"", shortDescription: "4K UHD smart television" },
  { giftName: "Amazon Gift Voucher ₹10,000", shortDescription: "Redeemable on amazon.in" },
  { giftName: "Noise Smartwatch", shortDescription: "Fitness tracking smartwatch with AMOLED display" },
  { giftName: "Bluetooth Speaker", shortDescription: "Portable wireless speaker with 20hr battery" },
  { giftName: "Gift Hamper", shortDescription: "Premium curated gift hamper" },
  { giftName: "Amazon Gift Voucher ₹2,000", shortDescription: "Redeemable on amazon.in" },
  { giftName: "Wireless Earbuds", shortDescription: "Noise cancelling wireless earbuds" },
  { giftName: "Amazon Gift Voucher ₹1,000", shortDescription: "Redeemable on amazon.in" },
  { giftName: "Amazon Gift Voucher ₹500", shortDescription: "Redeemable on amazon.in" },
];

export function defaultGiftRanksForLocation(locationId: string): GiftRank[] {
  return DEFAULT_GIFTS.map((g, i) => ({ rank: i + 1, locationId, ...g, photo: undefined }));
}

export const giftRanks: GiftRank[] = defaultGiftRanksForLocation("all");
