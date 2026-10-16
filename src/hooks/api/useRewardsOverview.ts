import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { rewardsOverviewService } from "@/services/rewardsOverview.service";
import type { AudienceParams } from "@/hooks/useAudienceFilters";

export function useRewardsOverview(query: AudienceParams & { from?: string; to?: string; source?: string }) {
  return useQuery({
    queryKey: ["rewards-overview", query],
    queryFn: () => rewardsOverviewService.get(query),
    placeholderData: keepPreviousData,
  });
}
