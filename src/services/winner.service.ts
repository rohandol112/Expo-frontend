import { API } from "@/lib/apiEndpoints";
import { httpClient } from "@/lib/httpClient";
import { formatDateTime } from "@/lib/format";
import { cleanParams, toRewardUser, uploadRewardImage, type ApiPage, type ApiRewardUser } from "@/services/adapters/rewards.adapter";
import type { ReportQuery } from "@/services/referralUser.service";
import type { Winner } from "@/types/referrals";

interface ApiPointsRow extends ApiRewardUser {
  rank: number;
  location_rank?: number | null;
  location_title?: string | null;
  total_points?: number;
  reading_points?: number;
  quiz_points: number;
  referral_points?: number;
  streak_points?: number;
  bonus_points?: number;
  streak_days?: number;
  won_gift?: { name: string; value: number | null } | null;
  gift_request?: { id: number; status: string; requested_at: string | null } | null;
  rewards_status?: "pending" | "submitted" | null;
  quiz1_results?: boolean[] | null;
  quiz1_submitted_at?: string | null;
  quiz2_results?: boolean[] | null;
  quiz2_submitted_at?: string | null;
  gift_position?: number | null;
  is_winner?: boolean;
  day_gift?: { name: string; value: number | null } | null;
}

function toWinner(r: ApiPointsRow): Winner {
  const request = r.gift_request ?? null;
  return {
    ...toRewardUser(r),
    id: String(r.user_id),
    rank: r.rank,
    locationRank: r.location_rank ?? null,
    locationTitle: r.location_title ?? null,
    totalPoints: r.total_points ?? r.quiz_points ?? 0,
    readingPoints: r.reading_points ?? 0,
    quizPoints: r.quiz_points ?? 0,
    bonusPoints: (r.bonus_points ?? 0) + (r.streak_points ?? 0),
    referralPoints: r.referral_points ?? 0,
    streakDays: r.streak_days ?? 0,
    wonGift: r.won_gift?.name ?? r.day_gift?.name ?? null,
    giftRequestId: request ? String(request.id) : null,
    giftRequestStatus: request ? "Requested" : "Not Requested",
    giftRequestedAt: request?.requested_at ? formatDateTime(request.requested_at) : undefined,
    rewardsStatus: r.rewards_status === "submitted" ? "Submitted" : r.rewards_status === "pending" ? "Pending" : "-",
    quiz1Results: r.quiz1_results ?? undefined,
    quiz1AttemptTime: r.quiz1_submitted_at ? formatDateTime(r.quiz1_submitted_at) : undefined,
    quiz2Results: r.quiz2_results ?? undefined,
    quiz2AttemptTime: r.quiz2_submitted_at ? formatDateTime(r.quiz2_submitted_at) : undefined,
    giftPosition: r.gift_position ?? null,
    isWinner: r.is_winner ?? false,
  };
}

export interface WinnersPage {
  items: Winner[];
  total: number;
}

export const winnerService = {
  /** Points-ranked users for a month, each with the rank gift they win in their location. */
  async monthly(query: ReportQuery & { month: string; location_id?: number }): Promise<WinnersPage & { monthClosed: boolean }> {
    const data = await httpClient.get<ApiPage<ApiPointsRow> & { month_closed: boolean }>(API.rewards.monthlyWinners, { params: cleanParams({ ...query }) });
    return { items: data.items.map(toWinner), total: data.total, monthClosed: data.month_closed };
  },

  /** Everyone who played a day's quizzes, with per-question results and the day's winners marked. */
  async quiz(query: ReportQuery & { date: string; location_id?: number }): Promise<WinnersPage & { winnersPerLocation: number }> {
    const data = await httpClient.get<ApiPage<ApiPointsRow> & { winners_per_location: number }>(API.rewards.quizWinners, { params: cleanParams({ ...query }) });
    return { items: data.items.map(toWinner), total: data.total, winnersPerLocation: data.winners_per_location };
  },

  async leaderboard(query: ReportQuery & { period: "all_time" | "month"; month?: string; location_id?: number }): Promise<WinnersPage> {
    const data = await httpClient.get<ApiPage<ApiPointsRow>>(API.rewards.leaderboard, { params: cleanParams({ ...query }) });
    return { items: data.items.map(toWinner), total: data.total };
  },

  /** Uploads the "gift delivered" photo for an approved gift request. */
  async submitDeliveryPhoto(giftRequestId: string, file: File): Promise<void> {
    const photoKey = await uploadRewardImage("delivery")(file);
    await httpClient.put(API.rewards.giftRequestDeliveryPhoto(giftRequestId), { photo_key: photoKey });
  },
};
