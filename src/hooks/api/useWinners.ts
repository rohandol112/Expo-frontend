import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { winnerService } from "@/services/winner.service";

export const winnerKeys = {
  all: ["winners"] as const,
  list: () => [...winnerKeys.all, "list"] as const,
  byUser: (userId: string) => [...winnerKeys.all, "user", userId] as const,
};

export function useWinners() {
  return useQuery({
    queryKey: winnerKeys.list(),
    queryFn: () => winnerService.list(),
  });
}

export function useWinnerByUserId(userId: string) {
  return useQuery({
    queryKey: winnerKeys.byUser(userId),
    queryFn: () => winnerService.getByUserId(userId),
    enabled: Boolean(userId),
  });
}

export function useSubmitWinnerPhoto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => winnerService.submitPhoto(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: winnerKeys.all }),
  });
}
