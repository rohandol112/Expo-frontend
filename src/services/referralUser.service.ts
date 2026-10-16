import { API } from "@/lib/apiEndpoints";
import { httpClient } from "@/lib/httpClient";
import { cleanParams, toRewardUser, toTrend, type ApiPage, type ApiRewardUser, type ApiTrendStat } from "@/services/adapters/rewards.adapter";
import type { AudienceParams } from "@/hooks/useAudienceFilters";
import type { ReferralStats, ReferralUser } from "@/types/referrals";

export interface ReportQuery extends AudienceParams {
  page: number;
  per_page: number;
  search?: string;
  from?: string;
  to?: string;
}

interface ApiReferralUser extends ApiRewardUser {
  rank: number;
  referral_code: string;
  total_referred: number;
  successful: number;
  pending: number;
  active_users: number;
  inactive_users: number;
  referral_points: number;
}

interface ApiReferralUsers extends ApiPage<ApiReferralUser> {
  stats: Record<
    "referrers" | "referred_users" | "successful_referrals" | "pending_referrals" | "active_referred_users" | "inactive_referred_users" | "referral_points",
    ApiTrendStat
  >;
}

export const referralUserService = {
  async list(query: ReportQuery): Promise<{ items: ReferralUser[]; total: number; stats: ReferralStats }> {
    const data = await httpClient.get<ApiReferralUsers>(API.rewards.referralUsers, { params: cleanParams({ ...query }) });
    return {
      total: data.total,
      items: data.items.map((r) => ({
        ...toRewardUser(r),
        id: String(r.user_id),
        rank: r.rank,
        referralCode: r.referral_code,
        totalReferredUsers: r.total_referred,
        successfulReferrals: r.successful,
        pendingReferrals: r.pending,
        activeUsers: r.active_users,
        uninstalledUsers: r.inactive_users,
        totalReferredPoints: r.referral_points,
      })),
      stats: {
        referrers: toTrend(data.stats.referrers),
        referredUsers: toTrend(data.stats.referred_users),
        successfulReferrals: toTrend(data.stats.successful_referrals),
        pendingReferrals: toTrend(data.stats.pending_referrals),
        activeReferredUsers: toTrend(data.stats.active_referred_users),
        inactiveReferredUsers: toTrend(data.stats.inactive_referred_users),
        referralPoints: toTrend(data.stats.referral_points),
      },
    };
  },
};
