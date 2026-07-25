import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { advertisementService, type AdBannerListParams } from "@/services/advertisement.service";
import type { AdBannerInput } from "@/types/advertisement";

export const adKeys = {
  all: ["advertisement"] as const,
  banners: (params?: AdBannerListParams) => [...adKeys.all, "banners", params] as const,
  banner: (id: string) => [...adKeys.all, "banner", id] as const,
};

export function useAdBanners(params?: AdBannerListParams) {
  return useQuery({ queryKey: adKeys.banners(params), queryFn: () => advertisementService.list(params) });
}

export function useAdBanner(id: string) {
  return useQuery({ queryKey: adKeys.banner(id), queryFn: () => advertisementService.get(id), enabled: Boolean(id) });
}

export function useCreateAdBanner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: AdBannerInput) => advertisementService.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: adKeys.all }),
  });
}

export function useUpdateAdBanner(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: Partial<AdBannerInput>) => advertisementService.update(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: adKeys.all }),
  });
}

export function useDeleteAdBanner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => advertisementService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: adKeys.all }),
  });
}
