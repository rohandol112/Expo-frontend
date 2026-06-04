import { useQuery } from "@tanstack/react-query";
import { regionService } from "@/services/region.service";

export const regionKeys = {
  all: ["regions"] as const,
};

export function useRegions() {
  return useQuery({
    queryKey: regionKeys.all,
    queryFn: () => regionService.list(),
  });
}
