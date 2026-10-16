import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { handleError } from "@/lib/errorHandler";
import { winnerService } from "@/services/winner.service";
import type { ReportQuery } from "@/services/referralUser.service";

export const winnerKeys = {
  all: ["winners"] as const,
  monthly: (query: object) => [...winnerKeys.all, "monthly", query] as const,
  quiz: (query: object) => [...winnerKeys.all, "quiz", query] as const,
  leaderboard: (query: object) => [...winnerKeys.all, "leaderboard", query] as const,
};

export function useMonthlyWinners(query: ReportQuery & { month: string; location_id?: number }, enabled = true) {
  return useQuery({
    queryKey: winnerKeys.monthly(query),
    queryFn: () => winnerService.monthly(query),
    placeholderData: keepPreviousData,
    enabled,
  });
}

export function useQuizWinners(query: ReportQuery & { date: string; location_id?: number }, enabled = true) {
  return useQuery({
    queryKey: winnerKeys.quiz(query),
    queryFn: () => winnerService.quiz(query),
    placeholderData: keepPreviousData,
    enabled,
  });
}

export function useRewardsLeaderboard(query: ReportQuery & { period: "all_time" | "month"; month?: string; location_id?: number }) {
  return useQuery({
    queryKey: winnerKeys.leaderboard(query),
    queryFn: () => winnerService.leaderboard(query),
    placeholderData: keepPreviousData,
  });
}

export function useSubmitDeliveryPhoto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ giftRequestId, file }: { giftRequestId: string; file: File }) => winnerService.submitDeliveryPhoto(giftRequestId, file),
    onError: (error) => handleError(error),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: winnerKeys.all });
      void queryClient.invalidateQueries({ queryKey: ["gift-requests"] });
    },
  });
}
