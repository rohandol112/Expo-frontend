import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { handleError } from "@/lib/errorHandler";
import { listingSubCategoryService } from "@/services/listingSubCategory.service";

export const listingSubCategoryKeys = {
  all: ["listing-sub-categories"] as const,
  list: (params?: { categoryId?: string }) => [...listingSubCategoryKeys.all, "list", params] as const,
  detail: (id: string) => [...listingSubCategoryKeys.all, "detail", id] as const,
};

export function useListingSubCategories(params?: { categoryId?: string }) {
  return useQuery({
    queryKey: listingSubCategoryKeys.list(params),
    queryFn: () => listingSubCategoryService.list(params),
  });
}

export function useListingSubCategory(id: string) {
  return useQuery({
    queryKey: listingSubCategoryKeys.detail(id),
    queryFn: () => listingSubCategoryService.get(id),
    enabled: Boolean(id),
  });
}

export function useCreateListingSubCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof listingSubCategoryService.create>[0]) => listingSubCategoryService.create(payload),
    onError: (error) => handleError(error),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: listingSubCategoryKeys.all }),
  });
}

export function useUpdateListingSubCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof listingSubCategoryService.update>[1] }) => listingSubCategoryService.update(id, payload),
    onError: (error) => handleError(error),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: listingSubCategoryKeys.all }),
  });
}

export function useDeleteListingSubCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => listingSubCategoryService.remove(id),
    onError: (error) => handleError(error),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: listingSubCategoryKeys.all }),
  });
}

export function useReorderListingSubCategories() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderedIds: string[]) => listingSubCategoryService.reorder(orderedIds),
    onError: (error) => handleError(error),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: listingSubCategoryKeys.all }),
  });
}
