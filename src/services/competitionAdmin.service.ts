import { API } from "@/lib/apiEndpoints";
import { httpClient } from "@/lib/httpClient";
import type {
  AdminBannerListData,
  AdminEntryDetail,
  AdminEntryListItem,
  CompetitionAdminStats,
  CompetitionConfig,
  LeaderboardData,
  Paged,
} from "@/types/competitionAdmin";

export type EntryListParams = {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string;
  district_id?: number;
  area_id?: number;
};

export type LeaderboardParams = {
  page?: number;
  per_page?: number;
  state_id?: number;
  district_id?: number;
  area_id?: number;
};

export type BannerListParams = {
  page?: number;
  per_page?: number;
  status?: string;
  ai_status?: string;
  search?: string;
};

export const competitionAdminService = {
  stats() {
    return httpClient.get<CompetitionAdminStats>(API.competition.adminStats);
  },

  leaderboard(params?: LeaderboardParams) {
    return httpClient.get<LeaderboardData>(API.competition.adminLeaderboard, { params });
  },

  entries(params?: EntryListParams) {
    return httpClient.get<Paged<AdminEntryListItem>>(API.competition.adminEntries, { params });
  },

  entry(id: string | number) {
    return httpClient.get<AdminEntryDetail>(API.competition.adminEntry(id));
  },

  reviewEntry(id: string | number, status: "approved" | "rejected", rejectionReason?: string) {
    return httpClient.put<{ id: number; status: string }>(API.competition.adminReviewEntry(id), {
      status,
      rejection_reason: rejectionReason,
    });
  },

  banners(params?: BannerListParams) {
    return httpClient.get<AdminBannerListData>(API.competition.adminBanners, { params });
  },

  reviewBanner(id: string | number, status: "approved" | "rejected", rejectionReason?: string) {
    return httpClient.put<{ id: number; status: string }>(API.competition.adminReviewBanner(id), {
      status,
      rejection_reason: rejectionReason,
    });
  },

  aiReviewBanner(id: string | number) {
    return httpClient.post<{ id: number; ai_status: string; ai_confidence: number | null; status: string }>(
      API.competition.adminAiReviewBanner(id),
    );
  },

  aiReviewPending() {
    return httpClient.post<{ reviewed: number }>(API.competition.adminAiReviewPending);
  },

  config() {
    return httpClient.get<CompetitionConfig>(API.competition.publicConfig);
  },

  updateConfig(patch: Partial<Pick<CompetitionConfig, "title" | "subtitle" | "is_active" | "banner_points" | "voting_starts_at" | "voting_ends_at">>) {
    return httpClient.put<CompetitionConfig>(API.competition.adminConfig, patch);
  },
};
