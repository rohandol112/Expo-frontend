import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { streakUserService } from "@/services/streakUser.service";
import type { ReportQuery } from "@/services/referralUser.service";

export const streakUserKeys = {
  all: ["streak-users"] as const,
  list: (query: object) => [...streakUserKeys.all, "list", query] as const,
};

export function useStreakUsers(query: ReportQuery & { streak_range?: string }) {
  return useQuery({
    queryKey: streakUserKeys.list(query),
    queryFn: () => streakUserService.list(query),
    placeholderData: keepPreviousData,
  });
}
