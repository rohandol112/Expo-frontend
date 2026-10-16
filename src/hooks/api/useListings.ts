import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { handleError } from "@/lib/errorHandler";
import { listingService } from "@/services/listing.service";
import type { Listing } from "@/types/listing";

export const listingKeys = {
  all: ["listings"] as const,
  list: (params?: { type?: Listing["type"]; hasOffer?: boolean }) => [...listingKeys.all, "list", params] as const,
  stats: () => [...listingKeys.all, "stats"] as const,
  detail: (id: string) => [...listingKeys.all, "detail", id] as const,
};

export function useListings(params?: { type?: Listing["type"]; hasOffer?: boolean }) {
  return useQuery({
    queryKey: listingKeys.list(params),
    queryFn: () => listingService.list(params),
  });
}

export function useListingStats() {
  return useQuery({
    queryKey: listingKeys.stats(),
    queryFn: () => listingService.stats(),
  });
}

export function useListing(id: string) {
  return useQuery({
    queryKey: listingKeys.detail(id),
    queryFn: () => listingService.get(id),
    enabled: Boolean(id),
  });
}

export function useCreateListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof listingService.create>[0]) => listingService.create(payload),
    onError: (error) => handleError(error),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: listingKeys.all }),
  });
}

export function useUpdateListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof listingService.update>[1] }) => listingService.update(id, payload),
    onError: (error) => handleError(error),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: listingKeys.all }),
  });
}

export function useDeleteListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => listingService.remove(id),
    onError: (error) => handleError(error),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: listingKeys.all }),
  });
}
