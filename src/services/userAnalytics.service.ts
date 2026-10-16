import { API } from "@/lib/apiEndpoints";
import { httpClient } from "@/lib/httpClient";
import { formatDate, formatDateTime } from "@/lib/format";
import { placeLabel, toRewardUser, type ApiRewardUser } from "@/services/adapters/rewards.adapter";
import type { UserAnalytics, UserAnalyticsActivity } from "@/types/referrals";

interface ApiAnalytics {
  month: string;
  user: ApiRewardUser & {
    is_active: boolean;
    location_title: string | null;
    member_since: string | null;
    last_active_at: string | null;
  };
  points: {
    total_points: number;
    reading_points: number;
    quiz_points: number;
    referral_points: number;
    streak_points: number;
    bonus_points: number;
  };
  streak: { current_streak: number; longest_streak: number };
  gift_requests: { total: number; pending: number; approved: number; rejected: number; delivered: number };
  day_wise: Array<{ date: string; reading: number; quiz: number; referral: number; streak: number; bonus: number }>;
  recent_activity: Array<{ id: number; source: string; points: number; description: string | null; created_at: string | null }>;
}

const ACTIVITY_TYPE: Record<string, UserAnalyticsActivity["type"]> = {
  reading: "Reading",
  quiz: "Quiz",
  referral: "Referral",
  streak: "Streak",
};

const ACTIVITY_LABEL: Record<string, string> = {
  reading: "Read news",
  quiz: "Played the daily quiz",
  referral: "Referred a friend",
  streak: "Daily streak",
  task: "Daily task bonus",
  welcome: "Welcome bonus",
  bonus: "Bonus points",
  adjustment: "Points adjustment",
  redemption: "Points redeemed",
};

export const userAnalyticsService = {
  async get(userId: string, month?: string): Promise<UserAnalytics> {
    const d = await httpClient.get<ApiAnalytics>(API.rewards.userAnalytics(userId), { params: month ? { month } : undefined });
    const base = toRewardUser(d.user);
    return {
      userId: base.userId,
      name: base.name,
      phone: base.phone,
      status: d.user.is_active ? "Active" : "Inactive",
      language: base.language || "—",
      location: placeLabel(base),
      competitionLocation: d.user.location_title,
      memberSince: formatDate(d.user.member_since) || "—",
      lastActiveAt: formatDateTime(d.user.last_active_at) || "—",
      totalPoints: d.points.total_points,
      readingPoints: d.points.reading_points,
      quizPoints: d.points.quiz_points,
      bonusPoints: d.points.bonus_points + d.points.streak_points,
      referralPoints: d.points.referral_points,
      currentStreak: d.streak.current_streak,
      longestStreak: d.streak.longest_streak,
      giftRequestsCount: d.gift_requests.total,
      giftRequestsSubmitted: d.gift_requests.approved,
      giftRequestsPending: d.gift_requests.pending,
      dayWisePoints: d.day_wise.map((day) => ({
        date: formatDate(day.date).slice(0, 6),
        reading: day.reading,
        quiz: day.quiz,
        bonus: day.bonus + day.streak,
        referral: day.referral,
      })),
      recentActivity: d.recent_activity.map((a) => ({
        id: String(a.id),
        dateTime: formatDateTime(a.created_at),
        activity: a.description || ACTIVITY_LABEL[a.source] || a.source,
        points: a.points,
        type: ACTIVITY_TYPE[a.source] ?? "Bonus",
      })),
    };
  },
};
