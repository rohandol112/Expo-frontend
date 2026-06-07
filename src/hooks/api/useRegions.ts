import { useQuery } from "@tanstack/react-query";
import { regionService, type RegionListParams } from "@/services/region.service";

export const regionKeys = {
  all: ["regions"] as const,
  list: (params?: RegionListParams) => [...regionKeys.all, params] as const,
};

export function useRegions(params?: RegionListParams) {
  return useQuery({
    queryKey: regionKeys.list(params),
    queryFn: () => regionService.list(params),
    retry: false,
  });
}
