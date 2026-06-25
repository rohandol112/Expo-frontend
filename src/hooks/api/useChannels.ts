import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { channelService, type ChannelListParams, type CreateChannelPayload, type UpdateChannelPayload } from "@/services/channel.service";

export const channelKeys = {
  all: ["channels"] as const,
  list: (params?: ChannelListParams) => [...channelKeys.all, "list", params] as const,
  detail: (id: string) => [...channelKeys.all, "detail", id] as const,
};

export function useChannels(params?: ChannelListParams) {
  return useQuery({
    queryKey: channelKeys.list(params),
    queryFn: () => channelService.list(params),
  });
}

export function useChannel(id: string) {
  return useQuery({
    queryKey: channelKeys.detail(id),
    queryFn: () => channelService.get(id),
    enabled: Boolean(id),
  });
}

export function useCreateChannel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateChannelPayload) => channelService.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: channelKeys.all }),
  });
}

export function useUpdateChannel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateChannelPayload }) => channelService.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: channelKeys.all }),
  });
}

export function useDeleteChannel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => channelService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: channelKeys.all }),
  });
}

export function useChannelLogoUploadUrl() {
  return useMutation({
    mutationFn: (payload: { file_name: string; content_type: string }) =>
      channelService.getLogoUploadUrl(payload),
  });
}
