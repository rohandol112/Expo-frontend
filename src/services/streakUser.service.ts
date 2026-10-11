import type { StreakUser } from "@/types/referrals";
import { streakUsers as seedStreakUsers } from "@/mock/streakUsers.mock";

const streakUsers: StreakUser[] = [...seedStreakUsers];

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

export const streakUserService = {
  async list(): Promise<{ items: StreakUser[]; total: number }> {
    const items = [...streakUsers].sort((a, b) => a.rank - b.rank);
    return { items: clone(items), total: items.length };
  },
};
