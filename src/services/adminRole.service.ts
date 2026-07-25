import { API } from "@/lib/apiEndpoints";
import { httpClient } from "@/lib/httpClient";
import type { AdminRole, AdminRoleInput } from "@/types/adminRole";

export const adminRoleService = {
  list() {
    return httpClient.get<AdminRole[]>(API.roles.list);
  },
  get(id: string | number) {
    return httpClient.get<AdminRole>(API.roles.detail(id));
  },
  create(input: AdminRoleInput) {
    return httpClient.post<AdminRole>(API.roles.list, input);
  },
  update(id: string | number, patch: Partial<AdminRoleInput>) {
    return httpClient.put<AdminRole>(API.roles.detail(id), patch);
  },
  remove(id: string | number) {
    return httpClient.delete<{ id: number }>(API.roles.detail(id));
  },
  assign(userId: string | number, roleId: number | null) {
    return httpClient.put<{ user_id: number; role_id: number | null }>(API.roles.assign(userId), { role_id: roleId });
  },
};
