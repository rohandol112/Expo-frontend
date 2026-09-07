import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  competitionAdminService,
  type BannerListParams,
  type EntryListParams,
  type LeaderboardParams,
  type ReportListParams,
} from "@/services/competitionAdmin.service";
import type {
  CompetitionConfig,
  CompetitionRuleInput,
  CreateFormFieldInput,
  UpdateEntryInput,
} from "@/types/competitionAdmin";

export const competitionKeys = {
  all: ["admin-competition"] as const,
  stats: () => [...competitionKeys.all, "stats"] as const,
  config: () => [...competitionKeys.all, "config"] as const,
  leaderboard: (params?: LeaderboardParams) => [...competitionKeys.all, "leaderboard", params] as const,
  entries: (params?: EntryListParams) => [...competitionKeys.all, "entries", params] as const,
  entry: (id: string) => [...competitionKeys.all, "entry", id] as const,
  banners: (params?: BannerListParams) => [...competitionKeys.all, "banners", params] as const,
  formFields: () => [...competitionKeys.all, "form-fields"] as const,
  reports: (params?: ReportListParams) => [...competitionKeys.all, "reports", params] as const,
  rules: () => [...competitionKeys.all, "rules"] as const,
};

// ---- Competition ----

export function useCompetitionStats() {
  return useQuery({ queryKey: competitionKeys.stats(), queryFn: () => competitionAdminService.stats() });
}

export function useCompetitionConfig() {
  return useQuery({ queryKey: competitionKeys.config(), queryFn: () => competitionAdminService.config() });
}

export function useUpdateCompetitionConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: Partial<CompetitionConfig>) => competitionAdminService.updateConfig(patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: competitionKeys.all }),
  });
}

export function useUploadCompetitionAsset() {
  return useMutation({
    mutationFn: ({ file, asset }: { file: File; asset: "share_template" | "banner" | "cover_photo" | "pandal_photo" }) =>
      competitionAdminService.uploadAsset(file, asset),
  });
}

export function useFormFields() {
  return useQuery({ queryKey: competitionKeys.formFields(), queryFn: () => competitionAdminService.formFields() });
}

export function useCreateFormField() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateFormFieldInput) => competitionAdminService.createFormField(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: competitionKeys.formFields() }),
  });
}

export function useUpdateFormField() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: number; patch: Partial<CreateFormFieldInput> }) =>
      competitionAdminService.updateFormField(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: competitionKeys.formFields() }),
  });
}

export function useDeleteFormField() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => competitionAdminService.deleteFormField(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: competitionKeys.formFields() }),
  });
}

export function useReorderFormFields() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: number[]) => competitionAdminService.reorderFormFields(ids),
    onSuccess: () => qc.invalidateQueries({ queryKey: competitionKeys.formFields() }),
  });
}

export function useLeaderboard(params?: LeaderboardParams) {
  return useQuery({ queryKey: competitionKeys.leaderboard(params), queryFn: () => competitionAdminService.leaderboard(params) });
}

export function useCompetitionEntries(params?: EntryListParams) {
  return useQuery({ queryKey: competitionKeys.entries(params), queryFn: () => competitionAdminService.entries(params) });
}

export function useCompetitionEntry(id: string) {
  return useQuery({
    queryKey: competitionKeys.entry(id),
    queryFn: () => competitionAdminService.entry(id),
    enabled: Boolean(id),
  });
}

export function useReviewEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, reason }: { id: number; status: "approved" | "rejected"; reason?: string }) =>
      competitionAdminService.reviewEntry(id, status, reason),
    onSuccess: () => qc.invalidateQueries({ queryKey: competitionKeys.all }),
  });
}

export function useUpdateEntry(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: UpdateEntryInput) => competitionAdminService.updateEntry(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: competitionKeys.all }),
  });
}

export function useDeleteEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => competitionAdminService.deleteEntry(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: competitionKeys.all }),
  });
}

/**
 * Clears the "participant edited this" highlight. Fired when an admin opens a
 * participant's detail page, so the red/blue row styling on the list goes away
 * once someone has actually looked at the change.
 */
export function useMarkEntryViewed() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => competitionAdminService.markEntryViewed(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: competitionKeys.all }),
  });
}

/** Accepts a photo change on an approved entry, dropping its "Needs Review" badge. */
export function useClearNeedsReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => competitionAdminService.clearNeedsReview(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: competitionKeys.all }),
  });
}

export function useSaveEntryNote(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (note: string) => competitionAdminService.saveEntryNote(id, note),
    onSuccess: () => qc.invalidateQueries({ queryKey: competitionKeys.entry(id) }),
  });
}

export function useCompetitionBanners(params?: BannerListParams) {
  return useQuery({ queryKey: competitionKeys.banners(params), queryFn: () => competitionAdminService.banners(params) });
}

export function useReviewBanner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, reason }: { id: number; status: "approved" | "rejected" | "in_review"; reason?: string }) =>
      competitionAdminService.reviewBanner(id, status, reason),
    onSuccess: () => qc.invalidateQueries({ queryKey: competitionKeys.all }),
  });
}

// ---- User reports ----

export function useCompetitionReports(params?: ReportListParams) {
  return useQuery({ queryKey: competitionKeys.reports(params), queryFn: () => competitionAdminService.reports(params) });
}

export function useUpdateReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: "wrong" | "resolved" }) =>
      competitionAdminService.updateReport(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: [...competitionKeys.all, "reports"] }),
  });
}

export function useDeleteReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => competitionAdminService.deleteReport(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [...competitionKeys.all, "reports"] }),
  });
}

// ---- Competition rules ----

export function useCompetitionRules() {
  return useQuery({ queryKey: competitionKeys.rules(), queryFn: () => competitionAdminService.rules() });
}

export function useCreateRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CompetitionRuleInput) => competitionAdminService.createRule(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: competitionKeys.rules() }),
  });
}

export function useUpdateRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: number; patch: Partial<CompetitionRuleInput> }) =>
      competitionAdminService.updateRule(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: competitionKeys.rules() }),
  });
}

export function useDeleteRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => competitionAdminService.deleteRule(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: competitionKeys.rules() }),
  });
}

export function useAiReviewBanner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => competitionAdminService.aiReviewBanner(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: competitionKeys.all }),
  });
}

export function useAiReviewPending() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => competitionAdminService.aiReviewPending(),
    onSuccess: () => qc.invalidateQueries({ queryKey: competitionKeys.all }),
  });
}
