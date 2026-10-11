import { useQuery } from "@tanstack/react-query";
import { referralUserService } from "@/services/referralUser.service";

export const referralUserKeys = {
  all: ["referral-users"] as const,
  list: () => [...referralUserKeys.all, "list"] as const,
};

export function useReferralUsers() {
  return useQuery({
    queryKey: referralUserKeys.list(),
    queryFn: () => referralUserService.list(),
  });
}
