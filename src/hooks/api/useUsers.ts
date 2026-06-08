import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  userService,
  type CreateUserPayload,
  type UpdateUserPayload,
  type UserListParams,
} from "@/services/user.service";

export const userKeys = {
  all: ["admin-users"] as const,
  list: (params?: UserListParams) => [...userKeys.all, "list", params] as const,
  stats: () => [...userKeys.all, "stats"] as const,
  detail: (id: string) => [...userKeys.all, "detail", id] as const,
};

export function useUsers(params?: UserListParams) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => userService.list(params),
  });
}

export function useUserStats() {
  return useQuery({
    queryKey: userKeys.stats(),
    queryFn: () => userService.stats(),
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => userService.get(id),
    enabled: Boolean(id),
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateUserPayload) => userService.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: userKeys.all }),
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUserPayload }) => userService.update(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(variables.id) });
    },
  });
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => userService.updateStatus(id, isActive),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: userKeys.all }),
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => userService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: userKeys.all }),
  });
}
