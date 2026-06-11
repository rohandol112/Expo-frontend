import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  notificationService,
  type NotificationListParams,
  type NotificationPayload,
  type NotificationPublishPayload,
  type NotificationThumbnailUploadPayload,
  type UpdateNotificationPayload,
} from "@/services/notification.service";

export const notificationKeys = {
  all: ["notifications"] as const,
  list: (params?: NotificationListParams) => [...notificationKeys.all, "list", params] as const,
  stats: () => [...notificationKeys.all, "stats"] as const,
  detail: (id: string) => [...notificationKeys.all, "detail", id] as const,
};

export function useNotifications(params?: NotificationListParams) {
  return useQuery({
    queryKey: notificationKeys.list(params),
    queryFn: () => notificationService.list(params),
    retry: false,
  });
}

export function useNotificationStats() {
  return useQuery({
    queryKey: notificationKeys.stats(),
    queryFn: () => notificationService.stats(),
    retry: false,
  });
}

export function useNotification(id: string) {
  return useQuery({
    queryKey: notificationKeys.detail(id),
    queryFn: () => notificationService.get(id),
    enabled: Boolean(id),
    retry: false,
  });
}

export function useCreateNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: NotificationPayload) => notificationService.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: notificationKeys.all }),
  });
}

export function useUpdateNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateNotificationPayload }) =>
      notificationService.update(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      queryClient.invalidateQueries({ queryKey: notificationKeys.detail(variables.id) });
    },
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: notificationKeys.all }),
  });
}

export function usePublishNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload?: NotificationPublishPayload }) =>
      notificationService.publish(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      queryClient.invalidateQueries({ queryKey: notificationKeys.detail(variables.id) });
    },
  });
}

export function useSendNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationService.send(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: notificationKeys.all }),
  });
}

export function useNotificationThumbnailUploadUrl() {
  return useMutation({
    mutationFn: (payload: NotificationThumbnailUploadPayload) =>
      notificationService.createThumbnailUploadUrl(payload),
  });
}
