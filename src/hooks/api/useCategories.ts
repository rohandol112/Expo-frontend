import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  categoryService,
  type CategoryChildListParams,
  type CategoryListParams,
  type CreateCategoryPayload,
  type SortCategoriesPayload,
  type UpdateCategoryPayload,
} from "@/services/category.service";

export const categoryKeys = {
  all: ["categories"] as const,
  list: (params?: CategoryListParams) => [...categoryKeys.all, "list", params] as const,
  publicList: (params?: CategoryListParams) => [...categoryKeys.all, "public-list", params] as const,
  detail: (id: string) => [...categoryKeys.all, "detail", id] as const,
  publicDetail: (id: string) => [...categoryKeys.all, "public-detail", id] as const,
  subcategories: (id: string, params?: CategoryChildListParams) => [...categoryKeys.all, "subcategories", id, params] as const,
  news: (id: string, params?: CategoryChildListParams) => [...categoryKeys.all, "news", id, params] as const,
};

export function useCategories(params?: CategoryListParams) {
  return useQuery({
    queryKey: categoryKeys.list(params),
    queryFn: () => categoryService.list(params),
  });
}

export function usePublicCategories(params?: CategoryListParams) {
  return useQuery({
    queryKey: categoryKeys.publicList(params),
    queryFn: () => categoryService.publicList(params),
  });
}

export function useCategory(id: string) {
  return useQuery({
    queryKey: categoryKeys.detail(id),
    queryFn: () => categoryService.get(id),
    enabled: Boolean(id),
  });
}

export function usePublicCategory(id: string) {
  return useQuery({
    queryKey: categoryKeys.publicDetail(id),
    queryFn: () => categoryService.publicGet(id),
    enabled: Boolean(id),
  });
}

export function useCategorySubcategories(id: string, params?: CategoryChildListParams) {
  return useQuery({
    queryKey: categoryKeys.subcategories(id, params),
    queryFn: () => categoryService.listSubcategories(id, params),
    enabled: Boolean(id),
  });
}

export function useCategoryNews(id: string, params?: CategoryChildListParams) {
  return useQuery({
    queryKey: categoryKeys.news(id, params),
    queryFn: () => categoryService.listCategoryNews(id, params),
    enabled: Boolean(id),
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCategoryPayload) => categoryService.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: categoryKeys.all }),
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCategoryPayload }) => categoryService.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: categoryKeys.all }),
  });
}

export function useUpdateCategoryStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => categoryService.updateStatus(id, isActive),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: categoryKeys.all }),
  });
}

export function useSortCategories() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SortCategoriesPayload) => categoryService.sort(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: categoryKeys.all }),
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => categoryService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: categoryKeys.all }),
  });
}
