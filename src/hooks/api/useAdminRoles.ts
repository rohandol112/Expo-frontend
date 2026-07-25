import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminRoleService } from "@/services/adminRole.service";
import type { AdminRoleInput } from "@/types/adminRole";

export const adminRoleKeys = {
  all: ["admin-roles"] as const,
  list: () => [...adminRoleKeys.all, "list"] as const,
  detail: (id: string) => [...adminRoleKeys.all, "detail", id] as const,
};

export function useAdminRoles() {
  return useQuery({ queryKey: adminRoleKeys.list(), queryFn: () => adminRoleService.list() });
}

export function useAdminRole(id: string) {
  return useQuery({
    queryKey: adminRoleKeys.detail(id),
    queryFn: () => adminRoleService.get(id),
    enabled: Boolean(id),
  });
}

export function useCreateAdminRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: AdminRoleInput) => adminRoleService.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminRoleKeys.all }),
  });
}

export function useUpdateAdminRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: number; patch: Partial<AdminRoleInput> }) => adminRoleService.update(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminRoleKeys.all }),
  });
}

export function useDeleteAdminRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminRoleService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminRoleKeys.all }),
  });
}

export function useAssignAdminRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, roleId }: { userId: string | number; roleId: number | null }) =>
      adminRoleService.assign(userId, roleId),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminRoleKeys.all }),
  });
}
