import { API } from "@/lib/apiEndpoints";
import { httpClient } from "@/lib/httpClient";
import { formatDate } from "@/lib/format";
import { cleanParams, toTrend, type ApiTrendStat } from "@/services/adapters/rewards.adapter";
import type { AudienceParams } from "@/hooks/useAudienceFilters";
import type { RewardsOverview } from "@/types/referrals";

interface ApiOverview {
  from: string;
  to: string;
  stats: Record<"users_earning_points" | "points_earned" | "points_redeemed" | "registered_users", ApiTrendStat>;
  quiz_participants: { total: number; average_daily: number; series: { date: string; participants: number }[] };
  referral_users: { total: number; average_daily: number; series: { date: string; referrals: number }[] };
  streak_users: { series: { streak_days: number; users: number }[]; more_than_30: number };
  total_points: { series: { date: string; points: number }[] };
}

/** "15 Oct" for chart axes. */
const day = (date: string) => formatDate(date).slice(0, 6);

export const rewardsOverviewService = {
  async get(query: AudienceParams & { from?: string; to?: string; source?: string }): Promise<RewardsOverview> {
    const d = await httpClient.get<ApiOverview>(API.rewards.overview, { params: cleanParams({ ...query }) });
    return {
      from: d.from,
      to: d.to,
      stats: {
        usersEarningPoints: toTrend(d.stats.users_earning_points),
        pointsEarned: toTrend(d.stats.points_earned),
        pointsRedeemed: toTrend(d.stats.points_redeemed),
        registeredUsers: toTrend(d.stats.registered_users),
      },
      quizParticipants: {
        total: d.quiz_participants.total,
        averageDaily: d.quiz_participants.average_daily,
        series: d.quiz_participants.series.map((p) => ({ date: day(p.date), participants: p.participants })),
      },
      referralUsers: {
        total: d.referral_users.total,
        averageDaily: d.referral_users.average_daily,
        series: d.referral_users.series.map((p) => ({ date: day(p.date), referrals: p.referrals })),
      },
      streakUsers: {
        series: d.streak_users.series.map((p) => ({ day: p.streak_days, users: p.users })),
        moreThan30: d.streak_users.more_than_30,
      },
      totalPoints: { series: d.total_points.series.map((p) => ({ date: day(p.date), points: p.points })) },
    };
  },
};
