import { useQuery } from "@tanstack/react-query";
import { userAnalyticsService } from "@/services/userAnalytics.service";

export const userAnalyticsKeys = {
  all: ["user-analytics"] as const,
  detail: (userId: string) => [...userAnalyticsKeys.all, userId] as const,
};

export function useUserAnalytics(userId: string) {
  return useQuery({
    queryKey: userAnalyticsKeys.detail(userId),
    queryFn: () => userAnalyticsService.get(userId),
    enabled: Boolean(userId),
  });
}
