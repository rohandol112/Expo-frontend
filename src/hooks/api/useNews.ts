import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { newsService, type BulkNewsPayload, type CreateAdminNewsPayload, type NewsCommentListParams, type NewsListParams } from "@/services/news.service";

export const newsKeys = {
  all: ["news"] as const,
  list: (params?: NewsListParams) => [...newsKeys.all, "list", params] as const,
  stats: (params?: { is_admin_news?: boolean }) => [...newsKeys.all, "stats", params] as const,
  detail: (id: string) => [...newsKeys.all, "detail", id] as const,
  comments: (id: string, params?: NewsCommentListParams) => [...newsKeys.all, "comments", id, params] as const,
};

export function useNews(params?: NewsListParams) {
  return useQuery({
    queryKey: newsKeys.list(params),
    queryFn: () => newsService.list(params),
  });
}

export function useNewsStats(params?: { is_admin_news?: boolean }) {
  return useQuery({
    queryKey: newsKeys.stats(params),
    queryFn: () => newsService.stats(params),
  });
}

export function useNewsItem(id: string) {
  return useQuery({
    queryKey: newsKeys.detail(id),
    queryFn: () => newsService.get(id),
    enabled: Boolean(id),
  });
}

export function useCreateNews() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAdminNewsPayload) => newsService.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: newsKeys.all }),
  });
}

export function useUpdateNews() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: unknown }) => newsService.update(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: newsKeys.all });
      queryClient.invalidateQueries({ queryKey: newsKeys.detail(variables.id) });
    },
  });
}

export function useUpdateNewsCategories() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { category_ids?: number[]; subcategory_ids?: number[] } }) =>
      newsService.updateCategories(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: newsKeys.all }),
  });
}

export function useDeleteNews() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => newsService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: newsKeys.all }),
  });
}

export function useRecordNewsView() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => newsService.recordView(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: newsKeys.all }),
  });
}

export function useLikeNews() {
  return useMutation({
    mutationFn: (id: string) => newsService.like(id),
  });
}

export function useShareNews() {
  return useMutation({
    mutationFn: ({ id, channel }: { id: string; channel?: string }) => newsService.share(id, channel ? { channel } : {}),
  });
}

export function useNewsComments(id: string, params?: NewsCommentListParams) {
  return useQuery({
    queryKey: newsKeys.comments(id, params),
    queryFn: () => newsService.listComments(id, params),
    enabled: Boolean(id),
  });
}

export function useAddNewsComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: string }) => newsService.addComment(id, body),
    onSuccess: (_, variables) => queryClient.invalidateQueries({ queryKey: newsKeys.comments(variables.id) }),
  });
}

export function useApproveNews() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => newsService.approve(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: newsKeys.all }),
  });
}

export function useRejectNews() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => newsService.reject(id, reason),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: newsKeys.all }),
  });
}

export function useScheduleNews() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, scheduledFor }: { id: string; scheduledFor: string }) => newsService.schedule(id, scheduledFor),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: newsKeys.all }),
  });
}

export function useSetNewsFeatured() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isFeatured }: { id: string; isFeatured: boolean }) => newsService.setFeatured(id, isFeatured),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: newsKeys.all }),
  });
}

export function useBulkNewsAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: BulkNewsPayload) => newsService.bulk(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: newsKeys.all }),
  });
}
