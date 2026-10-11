import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: listingCategoryKeys.all }),
  });
}

export function useUpdateListingCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof listingCategoryService.update>[1] }) => listingCategoryService.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: listingCategoryKeys.all }),
  });
}

export function useDeleteListingCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => listingCategoryService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: listingCategoryKeys.all }),
  });
}

export function useReorderListingCategories() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderedIds: string[]) => listingCategoryService.reorder(orderedIds),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: listingCategoryKeys.all }),
  });
}
