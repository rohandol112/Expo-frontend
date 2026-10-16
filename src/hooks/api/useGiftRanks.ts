import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { handleError } from "@/lib/errorHandler";
import { giftRankService } from "@/services/giftRank.service";
import type { GiftRankInput } from "@/types/referrals";

export const giftRankKeys = {
  all: ["gift-ranks"] as const,
  list: (locationId: string) => [...giftRankKeys.all, locationId] as const,
};

export function useGiftRanks(locationId: string) {
  return useQuery({
    queryKey: giftRankKeys.list(locationId),
    queryFn: () => giftRankService.list(locationId),
    enabled: Boolean(locationId),
  });
}

export function useSaveGiftRanks() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ locationId, ranks }: { locationId: string; ranks: GiftRankInput[] }) => giftRankService.saveAll(locationId, ranks),
    onError: (error) => handleError(error),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: giftRankKeys.all }),
  });
}
