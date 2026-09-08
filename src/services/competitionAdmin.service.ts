import { API } from "@/lib/apiEndpoints";
import { httpClient } from "@/lib/httpClient";
import type {
  AdminBannerListData,
  AdminEntryDetail,
  AdminEntryListData,
  AdminReportListData,
  CompetitionAdminStats,
  CompetitionConfig,
  CompetitionReport,
  CompetitionRule,
  CompetitionRuleInput,
  CreateFormFieldInput,
  FormField,
  LeaderboardData,
  UpdateEntryInput,
} from "@/types/competitionAdmin";

export type EntryListParams = {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string;
  state_id?: number;
  district_id?: number;
  area_id?: number;
  /** Only entries a participant edited since an admin last opened them. */
  unviewed?: boolean;
  /** Only approved entries whose photo change is waiting for review. */
  pending_photos?: boolean;
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
  slot?: number;
  state_id?: number;
  district_id?: number;
  area_id?: number;
  pending?: boolean;
  priority?: "high" | "medium" | "low";
  overdue?: boolean;
  reviewed?: boolean;
  date_from?: string;
  date_to?: string;
};

export type ReportListParams = {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string;
  date_from?: string;
  date_to?: string;
};

export const competitionAdminService = {
  stats() {
    return httpClient.get<CompetitionAdminStats>(API.competition.adminStats);
  },

  leaderboard(params?: LeaderboardParams) {
    return httpClient.get<LeaderboardData>(API.competition.adminLeaderboard, { params });
  },

  entries(params?: EntryListParams) {
    return httpClient.get<AdminEntryListData>(API.competition.adminEntries, { params });
  },

  /** Clears an entry's "edited, not looked at yet" highlight. */
  markEntryViewed(id: string | number) {
    return httpClient.put<{ id: number }>(API.competition.adminEntryViewed(id));
  },

  /** Accepts a photo change on an approved entry, dropping its review badge. */
  clearNeedsReview(id: string | number) {
    return httpClient.put<{ id: number }>(API.competition.adminEntryReviewed(id));
  },

  /**
   * Publishes or discards a staged photo change. Until this runs the app keeps
   * showing the previously approved photos.
   */
  reviewPhotos(id: string | number, status: "approved" | "rejected", rejectionReason?: string) {
    return httpClient.put<AdminEntryDetail>(API.competition.adminEntryReviewPhotos(id), {
      status,
      rejection_reason: rejectionReason,
    });
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

  updateEntry(id: string | number, patch: UpdateEntryInput) {
    return httpClient.put<AdminEntryDetail>(API.competition.adminUpdateEntry(id), patch);
  },

  deleteEntry(id: string | number) {
    return httpClient.delete<{ id: number }>(API.competition.adminDeleteEntry(id));
  },

  saveEntryNote(id: string | number, note: string) {
    return httpClient.put<{ id: number; admin_notes: string }>(API.competition.adminEntryNotes(id), { note });
  },

  banners(params?: BannerListParams) {
    return httpClient.get<AdminBannerListData>(API.competition.adminBanners, { params });
  },

  reviewBanner(id: string | number, status: "approved" | "rejected" | "in_review", rejectionReason?: string) {
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

  updateConfig(patch: Partial<CompetitionConfig>) {
    return httpClient.put<CompetitionConfig>(API.competition.adminConfig, patch);
  },

  assetUploadUrl(fileName: string, contentType: string, asset: "share_template" | "banner" | "cover_photo" | "pandal_photo") {
    return httpClient.post<{ upload_url: string; file_key: string; expires_in: number }>(
      API.competition.adminAssetUploadUrl,
      { file_name: fileName, content_type: contentType, asset },
    );
  },

  /** Presign, PUT the file to R2, and return the stored key. */
  async uploadAsset(file: File, asset: "share_template" | "banner" | "cover_photo" | "pandal_photo"): Promise<string> {
    const { upload_url, file_key } = await this.assetUploadUrl(file.name, file.type, asset);
    const put = await fetch(upload_url, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
    if (!put.ok) throw new Error(`Upload failed (${put.status})`);
    return file_key;
  },

  formFields() {
    return httpClient.get<FormField[]>(API.competition.adminFormFields);
  },

  createFormField(input: CreateFormFieldInput) {
    return httpClient.post<FormField>(API.competition.adminFormFields, input);
  },

  updateFormField(id: number, patch: Partial<CreateFormFieldInput>) {
    return httpClient.put<FormField>(API.competition.adminFormField(id), patch);
  },

  deleteFormField(id: number) {
    return httpClient.delete<{ id: number }>(API.competition.adminFormField(id));
  },

  reorderFormFields(ids: number[]) {
    return httpClient.put<FormField[]>(API.competition.adminFormFieldsReorder, { ids });
  },

  // ---- User reports ----

  reports(params?: ReportListParams) {
    return httpClient.get<AdminReportListData>(API.competition.adminReports, { params });
  },

  updateReport(id: number, status: "wrong" | "resolved") {
    return httpClient.put<CompetitionReport>(API.competition.adminReport(id), { status });
  },

  deleteReport(id: number) {
    return httpClient.delete<{ id: number }>(API.competition.adminReport(id));
  },

  // ---- Competition rules ----

  rules() {
    return httpClient.get<CompetitionRule[]>(API.competition.adminRules);
  },

  createRule(input: CompetitionRuleInput) {
    return httpClient.post<CompetitionRule>(API.competition.adminRules, input);
  },

  updateRule(id: number, patch: Partial<CompetitionRuleInput>) {
    return httpClient.put<CompetitionRule>(API.competition.adminRule(id), patch);
  },

  deleteRule(id: number) {
    return httpClient.delete<{ id: number }>(API.competition.adminRule(id));
  },
};
