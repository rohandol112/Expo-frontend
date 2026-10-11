import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { rewardsSettingsService } from "@/services/rewardsSettings.service";
import type { CompetitionLocation, ImportantLink, RewardsSettings } from "@/types/referrals";

export const rewardsSettingsKeys = {
  all: ["rewards-settings"] as const,
  settings: () => [...rewardsSettingsKeys.all, "settings"] as const,
  locations: () => [...rewardsSettingsKeys.all, "locations"] as const,
  links: () => [...rewardsSettingsKeys.all, "links"] as const,
  link: (id: string) => [...rewardsSettingsKeys.all, "link", id] as const,
};

export function useRewardsSettings() {
  return useQuery({
    queryKey: rewardsSettingsKeys.settings(),
    queryFn: () => rewardsSettingsService.get(),
  });
}

export function useUpdateRewardsSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<RewardsSettings>) => rewardsSettingsService.update(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: rewardsSettingsKeys.settings() }),
  });
}

export function useCompetitionLocations() {
  return useQuery({
    queryKey: rewardsSettingsKeys.locations(),
    queryFn: () => rewardsSettingsService.listLocations(),
  });
}

export function useCompetitionLocation(id: string) {
  return useQuery({
    queryKey: [...rewardsSettingsKeys.locations(), id],
    queryFn: () => rewardsSettingsService.getLocation(id),
    enabled: Boolean(id),
  });
}

export function useCreateCompetitionLocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<CompetitionLocation, "id">) => rewardsSettingsService.createLocation(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: rewardsSettingsKeys.locations() }),
  });
}

export function useUpdateCompetitionLocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Omit<CompetitionLocation, "id">> }) => rewardsSettingsService.updateLocation(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: rewardsSettingsKeys.locations() }),
  });
}

export function useDeleteCompetitionLocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => rewardsSettingsService.removeLocation(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: rewardsSettingsKeys.locations() }),
  });
}

export function useImportantLinks() {
  return useQuery({
    queryKey: rewardsSettingsKeys.links(),
    queryFn: () => rewardsSettingsService.listLinks(),
  });
}

export function useImportantLink(id: string) {
  return useQuery({
    queryKey: rewardsSettingsKeys.link(id),
    queryFn: () => rewardsSettingsService.getLink(id),
    enabled: Boolean(id),
  });
}

export function useCreateImportantLink() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<ImportantLink, "id">) => rewardsSettingsService.createLink(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: rewardsSettingsKeys.links() }),
  });
}

export function useUpdateImportantLink() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Omit<ImportantLink, "id">> }) => rewardsSettingsService.updateLink(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: rewardsSettingsKeys.links() }),
  });
}

export function useDeleteImportantLink() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => rewardsSettingsService.removeLink(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: rewardsSettingsKeys.links() }),
  });
}
