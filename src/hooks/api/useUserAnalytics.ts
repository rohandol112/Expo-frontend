import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { userAnalyticsService } from "@/services/userAnalytics.service";

export const userAnalyticsKeys = {
  all: ["user-analytics"] as const,
  detail: (userId: string, month: string) => [...userAnalyticsKeys.all, userId, month] as const,
};

export function useUserAnalytics(userId: string, month: string) {
  return useQuery({
    queryKey: userAnalyticsKeys.detail(userId, month),
    queryFn: () => userAnalyticsService.get(userId, month),
    enabled: Boolean(userId),
    placeholderData: keepPreviousData,
  });
}
