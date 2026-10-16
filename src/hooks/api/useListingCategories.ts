import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { handleError } from "@/lib/errorHandler";
import { listingCategoryService } from "@/services/listingCategory.service";

export const listingCategoryKeys = {
  all: ["listing-categories"] as const,
  list: () => [...listingCategoryKeys.all, "list"] as const,
  detail: (id: string) => [...listingCategoryKeys.all, "detail", id] as const,
};

export function useListingCategories() {
  return useQuery({
    queryKey: listingCategoryKeys.list(),
    queryFn: () => listingCategoryService.list(),
  });
}

export function useListingCategory(id: string) {
  return useQuery({
    queryKey: listingCategoryKeys.detail(id),
    queryFn: () => listingCategoryService.get(id),
    enabled: Boolean(id),
  });
}

export function useCreateListingCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof listingCategoryService.create>[0]) => listingCategoryService.create(payload),
    onError: (error) => handleError(error),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: listingCategoryKeys.all }),
  });
}

export function useUpdateListingCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof listingCategoryService.update>[1] }) => listingCategoryService.update(id, payload),
    onError: (error) => handleError(error),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: listingCategoryKeys.all }),
  });
}

export function useDeleteListingCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => listingCategoryService.remove(id),
    onError: (error) => handleError(error),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: listingCategoryKeys.all }),
  });
}

export function useReorderListingCategories() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderedIds: string[]) => listingCategoryService.reorder(orderedIds),
    onError: (error) => handleError(error),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: listingCategoryKeys.all }),
  });
}
