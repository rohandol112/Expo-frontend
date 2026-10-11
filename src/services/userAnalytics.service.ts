import type { UserAnalytics, UserAnalyticsActivity, UserAnalyticsDayPoint } from "@/types/referrals";
import { winners } from "@/mock/winners.mock";

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

const ACTIVITY_TYPES: UserAnalyticsActivity["type"][] = ["Reading", "Quiz", "Referral", "Bonus"];

function buildDayWisePoints(total: UserAnalytics["totalPoints"], seed: number): UserAnalyticsDayPoint[] {
  const days: UserAnalyticsDayPoint[] = [];
  for (let day = 1; day <= 30; day++) {
    const base = total / 30;
    const variance = Math.sin(day + seed) * (base * 0.4);
    const value = Math.max(0, Math.round(base + variance));
    days.push({
      date: `${String(day).padStart(2, "0")} Sep`,
      reading: Math.round(value * 0.38),
      quiz: Math.round(value * 0.22),
      bonus: Math.round(value * 0.14),
      referral: Math.round(value * 0.26),
    });
  }
  return days;
}

function buildRecentActivity(seed: number): UserAnalyticsActivity[] {
  return Array.from({ length: 10 }, (_, i) => {
    const type = ACTIVITY_TYPES[(seed + i) % ACTIVITY_TYPES.length];
    const activityLabel: Record<UserAnalyticsActivity["type"], string> = {
      Reading: "Read news article",
      Quiz: "Completed daily quiz",
      Referral: "Referred a new user",
      Bonus: "Daily login bonus",
    };
    return {
      id: `activity-${seed}-${i + 1}`,
      dateTime: `28 Sep 2026, ${10 - i}:${(i * 7) % 60 < 10 ? "0" : ""}${(i * 7) % 60} AM`,
      activity: activityLabel[type],
      points: 50 + ((seed + i) % 5) * 20,
      type,
    };
  });
}

export const userAnalyticsService = {
  async get(userId: string): Promise<UserAnalytics | undefined> {
    const winner = winners.find((w) => w.userId === userId);
    if (!winner) return undefined;
    const seed = Number(userId.replace(/\D/g, "")) || 1;
    const analytics: UserAnalytics = {
      userId: winner.userId,
      name: winner.name,
      phone: winner.phone,
      status: "Active",
      language: winner.language,
      location: `${winner.area}, ${winner.district}, ${winner.state}`,
      memberSince: "12 Aug 2026",
      lastActiveAt: "28 Sep 2026, 10:24 AM",
      totalPoints: winner.totalPoints,
      readingPoints: winner.readingPoints,
      quizPoints: winner.quizPoints,
      bonusPoints: winner.bonusPoints,
      referralPoints: winner.referralPoints,
      giftRequestsCount: winner.giftRequestStatus === "Requested" ? 3 : 0,
      giftRequestsSubmitted: winner.giftRequestStatus === "Requested" ? 2 : 0,
      giftRequestsPending: winner.giftRequestStatus === "Requested" ? 1 : 0,
      dayWisePoints: buildDayWisePoints(winner.totalPoints, seed),
      recentActivity: buildRecentActivity(seed),
    };
    return clone(analytics);
  },
};
