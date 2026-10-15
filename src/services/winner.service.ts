import type { Winner } from "@/types/referrals";
import { winners as seedWinners } from "@/mock/winners.mock";

let winners: Winner[] = [...seedWinners];

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

export const winnerService = {
  async list(): Promise<{ items: Winner[]; total: number }> {
    const items = [...winners].sort((a, b) => b.totalPoints - a.totalPoints);
    return { items: clone(items), total: items.length };
  },

  async getByUserId(userId: string): Promise<Winner | undefined> {
    return clone(winners.find((w) => w.userId === userId));
  },

  async submitPhoto(id: string): Promise<Winner | undefined> {
    winners = winners.map((w) => (w.id === id ? { ...w, rewardsStatus: "Submitted" } : w));
    return clone(winners.find((w) => w.id === id));
  },
};
