import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { handleError } from "@/lib/errorHandler";
import { giftRequestService, type GiftRequestQuery } from "@/services/giftRequest.service";
import { winnerKeys } from "@/hooks/api/useWinners";

export const giftRequestKeys = {
  all: ["gift-requests"] as const,
  list: (query: GiftRequestQuery) => [...giftRequestKeys.all, "list", query] as const,
  counts: () => [...giftRequestKeys.all, "counts"] as const,
  detail: (id: string) => [...giftRequestKeys.all, "detail", id] as const,
};

export function useGiftRequests(query: GiftRequestQuery) {
  return useQuery({
    queryKey: giftRequestKeys.list(query),
    queryFn: () => giftRequestService.list(query),
    placeholderData: keepPreviousData,
  });
}

export function useGiftRequestCounts() {
  return useQuery({
    queryKey: giftRequestKeys.counts(),
    queryFn: () => giftRequestService.counts(),
  });
}

export function useGiftRequest(id: string) {
  return useQuery({
    queryKey: giftRequestKeys.detail(id),
    queryFn: () => giftRequestService.get(id),
    enabled: Boolean(id),
  });
}

function useReviewMutation<V>(fn: (vars: V) => Promise<void>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onError: (error) => handleError(error),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: giftRequestKeys.all });
      void queryClient.invalidateQueries({ queryKey: winnerKeys.all });
    },
  });
}

export function useApproveGiftRequest() {
  return useReviewMutation((id: string) => giftRequestService.approve(id));
}

export function useRejectGiftRequest() {
  return useReviewMutation(({ id, reason }: { id: string; reason?: string }) => giftRequestService.reject(id, reason));
}
