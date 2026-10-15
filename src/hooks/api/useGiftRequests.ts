import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { giftRequestService } from "@/services/giftRequest.service";

export const giftRequestKeys = {
  all: ["gift-requests"] as const,
  list: () => [...giftRequestKeys.all, "list"] as const,
  detail: (id: string) => [...giftRequestKeys.all, "detail", id] as const,
};

export function useGiftRequests() {
  return useQuery({
    queryKey: giftRequestKeys.list(),
    queryFn: () => giftRequestService.list(),
  });
}

export function useGiftRequest(id: string) {
  return useQuery({
    queryKey: giftRequestKeys.detail(id),
    queryFn: () => giftRequestService.get(id),
    enabled: Boolean(id),
  });
}

export function useApproveGiftRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => giftRequestService.approve(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: giftRequestKeys.all }),
  });
}

export function useRejectGiftRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => giftRequestService.reject(id, reason),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: giftRequestKeys.all }),
  });
}
