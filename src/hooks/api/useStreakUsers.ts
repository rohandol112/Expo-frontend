import { useQuery } from "@tanstack/react-query";
import { streakUserService } from "@/services/streakUser.service";

export const streakUserKeys = {
  all: ["streak-users"] as const,
  list: () => [...streakUserKeys.all, "list"] as const,
};

export function useStreakUsers() {
  return useQuery({
    queryKey: streakUserKeys.list(),
    queryFn: () => streakUserService.list(),
  });
}
