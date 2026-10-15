import type { ReferralUser } from "@/types/referrals";
import { referralUsers as seedReferralUsers } from "@/mock/referralUsers.mock";

const referralUsers: ReferralUser[] = [...seedReferralUsers];

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

export const referralUserService = {
  async list(): Promise<{ items: ReferralUser[]; total: number }> {
    const items = [...referralUsers].sort((a, b) => a.rank - b.rank);
    return { items: clone(items), total: items.length };
  },
};
