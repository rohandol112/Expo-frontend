import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { referralUserService, type ReportQuery } from "@/services/referralUser.service";

export const referralUserKeys = {
  all: ["referral-users"] as const,
  list: (query: ReportQuery) => [...referralUserKeys.all, "list", query] as const,
};

export function useReferralUsers(query: ReportQuery) {
  return useQuery({
    queryKey: referralUserKeys.list(query),
    queryFn: () => referralUserService.list(query),
    placeholderData: keepPreviousData,
  });
}
