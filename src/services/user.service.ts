import { API } from "@/lib/apiEndpoints";
import { httpClient } from "@/lib/httpClient";
import { toAdminUser, type BackendAdminUser } from "@/services/adapters/user.adapter";
import type { AdminUser } from "@/types/user";

interface ListResponse<T> {
  items: T[];
  page?: number;
  per_page?: number;
  total?: number;
  has_more?: boolean;
}

export interface UserListParams {
  page?: number;
  per_page?: number;
  search?: string;
  status?: "active" | "inactive";
  is_guest?: boolean;
  language_code?: string;
  state_id?: number;
  district_id?: number;
  area_id?: number;
  joined_from?: string;
  joined_to?: string;
}

export interface UserStats {
  total: number;
  registered: number;
  guests: number;
  active: number;
  inactive: number;
  new_this_month: number;
  total_posts: number;
}

export interface CreateUserPayload {
  phone: string;
  name?: string | null;
  email?: string | null;
  gender?: string | null;
  dob?: string | null;
  role?: "user" | "admin" | "subadmin";
  is_active?: boolean;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  gender?: "male" | "female" | "other";
  dob?: string;
  role?: "user" | "admin" | "subadmin";
  is_active?: boolean;
}

export const userService = {
  async list(params?: UserListParams): Promise<{ items: AdminUser[]; total: number; page: number; perPage: number }> {
    const data = await httpClient.get<ListResponse<BackendAdminUser>>(API.users.adminList, { params });
    return {
      items: (data.items || []).map(toAdminUser),
      total: data.total ?? data.items?.length ?? 0,
      page: data.page ?? params?.page ?? 1,
      perPage: data.per_page ?? params?.per_page ?? 10,
    };
  },

  async stats() {
    return httpClient.get<UserStats>(API.users.adminStats);
  },

  async get(id: string) {
    return toAdminUser(await httpClient.get<BackendAdminUser>(API.users.detail(id)));
  },

  async create(payload: CreateUserPayload) {
    return toAdminUser(await httpClient.post<BackendAdminUser>(API.users.adminList, payload));
  },

  async update(id: string, payload: UpdateUserPayload) {
    return toAdminUser(await httpClient.put<BackendAdminUser>(API.users.detail(id), payload));
  },

  async updateStatus(id: string, isActive: boolean) {
    return toAdminUser(await httpClient.put<BackendAdminUser>(API.users.status(id), { is_active: isActive }));
  },

  async delete(id: string) {
    return httpClient.delete<void>(API.users.detail(id));
  },
};
