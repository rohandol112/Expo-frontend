import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { monetizationService, type ManualAdListParams } from "@/services/monetization.service";
import type { ManualAdInput, MonetizationSettings } from "@/types/monetization";

export const monetizationKeys = {
  all: ["monetization"] as const,
  settings: () => [...monetizationKeys.all, "settings"] as const,
  ads: (params?: ManualAdListParams) => [...monetizationKeys.all, "ads", params] as const,
};

export function useMonetizationSettings() {
  return useQuery({ queryKey: monetizationKeys.settings(), queryFn: () => monetizationService.settings() });
}

export function useUpdateMonetizationSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: Partial<Pick<MonetizationSettings, "admob_enabled" | "manual_ads_enabled">>) =>
      monetizationService.updateSettings(patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: monetizationKeys.settings() }),
  });
}

export function useManualAds(params?: ManualAdListParams) {
  return useQuery({ queryKey: monetizationKeys.ads(params), queryFn: () => monetizationService.list(params) });
}

export function useCreateManualAd() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ManualAdInput) => monetizationService.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: monetizationKeys.all }),
  });
}

export function useUpdateManualAd() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: number; patch: Partial<ManualAdInput> }) => monetizationService.update(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: monetizationKeys.all }),
  });
}

export function useDeleteManualAd() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => monetizationService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: monetizationKeys.all }),
  });
}

export function useReorderManualAds() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: number[]) => monetizationService.reorder(ids),
    onSuccess: () => qc.invalidateQueries({ queryKey: monetizationKeys.all }),
  });
}
