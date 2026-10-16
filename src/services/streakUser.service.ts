import { API } from "@/lib/apiEndpoints";
import { httpClient } from "@/lib/httpClient";
import { formatDateTime } from "@/lib/format";
import { cleanParams, toRewardUser, type ApiPage, type ApiRewardUser } from "@/services/adapters/rewards.adapter";
import type { ReportQuery } from "@/services/referralUser.service";
import type { StreakStats, StreakUser } from "@/types/referrals";

interface ApiStreakUser extends ApiRewardUser {
  rank: number;
  current_streak: number;
  longest_streak: number;
  total_active_days: number;
  last_active_at: string | null;
  streak_points: number;
}

interface ApiStreakUsers extends ApiPage<ApiStreakUser> {
  stats: { streak_users: number; active_today: number; longest_streak: number; average_streak: number; streak_points: number };
}

export const streakUserService = {
  async list(query: ReportQuery & { streak_range?: string }): Promise<{ items: StreakUser[]; total: number; stats: StreakStats }> {
    const data = await httpClient.get<ApiStreakUsers>(API.rewards.streakUsers, { params: cleanParams({ ...query }) });
    return {
      total: data.total,
      items: data.items.map((r) => ({
        ...toRewardUser(r),
        id: String(r.user_id),
        rank: r.rank,
        currentStreak: r.current_streak,
        longestStreak: r.longest_streak,
        totalActiveDays: r.total_active_days,
        lastActiveAt: formatDateTime(r.last_active_at) || "—",
        streakPoints: r.streak_points,
      })),
      stats: {
        streakUsers: data.stats.streak_users,
        activeToday: data.stats.active_today,
        longestStreak: data.stats.longest_streak,
        averageStreak: data.stats.average_streak,
        streakPoints: data.stats.streak_points,
      },
    };
  },
};
