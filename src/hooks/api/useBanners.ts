import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { bannerService } from "@/services/banner.service";

export const bannerKeys = {
  all: ["banners"] as const,
  list: () => [...bannerKeys.all, "list"] as const,
  detail: (id: string) => [...bannerKeys.all, "detail", id] as const,
};

export function useBanners() {
  return useQuery({
    queryKey: bannerKeys.list(),
    queryFn: () => bannerService.list(),
  });
}

export function useBanner(id: string) {
  return useQuery({
    queryKey: bannerKeys.detail(id),
    queryFn: () => bannerService.get(id),
    enabled: Boolean(id),
  });
}

export function useCreateBanner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof bannerService.create>[0]) => bannerService.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: bannerKeys.all }),
  });
}

export function useUpdateBanner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof bannerService.update>[1] }) => bannerService.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: bannerKeys.all }),
  });
}

export function useDeleteBanner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => bannerService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: bannerKeys.all }),
  });
}

export function useReorderBanners() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderedIds: string[]) => bannerService.reorder(orderedIds),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: bannerKeys.all }),
  });
}
