import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  complaintService,
  type ComplaintListParams,
  type CreateComplaintPayload,
  type UpdateComplaintPayload,
} from "@/services/complaint.service";
import { complaintCategoryService, type ComplaintCategoryListParams } from "@/services/complaintCategory.service";
import type { ComplaintStatus } from "@/types/complaint";

export const complaintKeys = {
  all: ["admin-complaints"] as const,
  list: (params?: ComplaintListParams) => [...complaintKeys.all, "list", params] as const,
  stats: () => [...complaintKeys.all, "stats"] as const,
  detail: (id: string) => [...complaintKeys.all, "detail", id] as const,
  messages: (id: string) => [...complaintKeys.all, "messages", id] as const,
  timeline: (id: string) => [...complaintKeys.all, "timeline", id] as const,
};

export const complaintCategoryKeys = {
  all: ["admin-complaint-categories"] as const,
  list: (params?: ComplaintCategoryListParams) => [...complaintCategoryKeys.all, "list", params] as const,
};

export function useComplaints(params?: ComplaintListParams) {
  return useQuery({
    queryKey: complaintKeys.list(params),
    queryFn: () => complaintService.list(params),
  });
}

export function useComplaintStats() {
  return useQuery({
    queryKey: complaintKeys.stats(),
    queryFn: () => complaintService.stats(),
  });
}

export function useComplaint(id: string) {
  return useQuery({
    queryKey: complaintKeys.detail(id),
    queryFn: () => complaintService.get(id),
    enabled: Boolean(id),
  });
}

export function useComplaintMessages(id: string) {
  return useQuery({
    queryKey: complaintKeys.messages(id),
    queryFn: () => complaintService.listMessages(id),
    enabled: Boolean(id),
  });
}

export function useComplaintTimeline(id: string) {
  return useQuery({
    queryKey: complaintKeys.timeline(id),
    queryFn: () => complaintService.timeline(id),
    enabled: Boolean(id),
  });
}

export function useComplaintCategories(params?: ComplaintCategoryListParams) {
  return useQuery({
    queryKey: complaintCategoryKeys.list(params),
    queryFn: () => complaintCategoryService.list(params),
  });
}

export function useCreateComplaint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateComplaintPayload) => complaintService.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: complaintKeys.all }),
  });
}

export function useUpdateComplaint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateComplaintPayload }) => complaintService.update(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: complaintKeys.all });
      queryClient.invalidateQueries({ queryKey: complaintKeys.detail(variables.id) });
    },
  });
}

export function useUpdateComplaintStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, adminResponse }: { id: string; status: ComplaintStatus; adminResponse?: string }) =>
      complaintService.setStatus(id, status, adminResponse),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: complaintKeys.all });
      queryClient.invalidateQueries({ queryKey: complaintKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: complaintKeys.timeline(variables.id) });
    },
  });
}

export function useDeleteComplaint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => complaintService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: complaintKeys.all }),
  });
}

export function useAddComplaintMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, message }: { id: string; message: string }) => complaintService.addMessage(id, message),
    onSuccess: (_, variables) => queryClient.invalidateQueries({ queryKey: complaintKeys.messages(variables.id) }),
  });
}
