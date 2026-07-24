import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  competitionAdminService,
  type BannerListParams,
  type EntryListParams,
  type LeaderboardParams,
} from "@/services/competitionAdmin.service";
import { campaignService, type ContactListParams } from "@/services/campaign.service";
import type { CampaignContactInput, CampaignSettings, CompetitionConfig, CreateFormFieldInput, UpdateEntryInput } from "@/types/competitionAdmin";

export const competitionKeys = {
  all: ["admin-competition"] as const,
  stats: () => [...competitionKeys.all, "stats"] as const,
  config: () => [...competitionKeys.all, "config"] as const,
  leaderboard: (params?: LeaderboardParams) => [...competitionKeys.all, "leaderboard", params] as const,
  entries: (params?: EntryListParams) => [...competitionKeys.all, "entries", params] as const,
  entry: (id: string) => [...competitionKeys.all, "entry", id] as const,
  banners: (params?: BannerListParams) => [...competitionKeys.all, "banners", params] as const,
  formFields: () => [...competitionKeys.all, "form-fields"] as const,
};

export const campaignKeys = {
  all: ["admin-campaign"] as const,
  settings: () => [...campaignKeys.all, "settings"] as const,
  stats: () => [...campaignKeys.all, "stats"] as const,
  uploads: () => [...campaignKeys.all, "uploads"] as const,
  contacts: (params?: ContactListParams) => [...campaignKeys.all, "contacts", params] as const,
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
    mutationFn: ({ id, status, reason }: { id: number; status: "approved" | "rejected"; reason?: string }) =>
      competitionAdminService.reviewBanner(id, status, reason),
    onSuccess: () => qc.invalidateQueries({ queryKey: competitionKeys.all }),
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

// ---- AI calling campaign ----

export function useCampaignSettings() {
  return useQuery({ queryKey: campaignKeys.settings(), queryFn: () => campaignService.settings() });
}

export function useUpdateCampaignSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: Partial<CampaignSettings>) => campaignService.updateSettings(patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: campaignKeys.all }),
  });
}

export function useCampaignStats() {
  return useQuery({ queryKey: campaignKeys.stats(), queryFn: () => campaignService.stats(), refetchInterval: 15000 });
}

export function useCampaignUploads() {
  return useQuery({ queryKey: campaignKeys.uploads(), queryFn: () => campaignService.uploads() });
}

export function useCampaignContacts(params?: ContactListParams) {
  return useQuery({
    queryKey: campaignKeys.contacts(params),
    queryFn: () => campaignService.contacts(params),
    refetchInterval: 15000,
  });
}

export function useUploadContacts() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ fileName, contacts }: { fileName: string; contacts: CampaignContactInput[] }) =>
      campaignService.uploadContacts(fileName, contacts),
    onSuccess: () => qc.invalidateQueries({ queryKey: campaignKeys.all }),
  });
}

export function useStartCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (limit?: number) => campaignService.start(limit),
    onSuccess: () => qc.invalidateQueries({ queryKey: campaignKeys.all }),
  });
}

export function useCallContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => campaignService.callContact(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: campaignKeys.all }),
  });
}
