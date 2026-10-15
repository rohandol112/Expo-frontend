import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { giftRankService } from "@/services/giftRank.service";
import type { GiftRank } from "@/types/referrals";

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
    mutationFn: ({ locationId, ranks }: { locationId: string; ranks: GiftRank[] }) => giftRankService.saveAll(locationId, ranks),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: giftRankKeys.all }),
  });
}
