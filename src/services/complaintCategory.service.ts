import { API } from "@/lib/apiEndpoints";
import { httpClient } from "@/lib/httpClient";

interface ListResponse<T> {
  items: T[];
  page?: number;
  per_page?: number;
  total?: number;
  has_more?: boolean;
}

export interface ComplaintCategory {
  id: number;
  name: string;
  description: string | null;
  icon_url: string | null;
  display_order: number;
  instructions: string | null;
  is_active: boolean;
  complaints: number;
  created_at: string;
  updated_at: string;
}

export interface ComplaintCategoryStats {
  total: number;
  active: number;
  inactive: number;
  used_in_complaints: number;
}

export interface ComplaintSubCategory {
  id: number;
  category_id: number;
  category_name: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ComplaintAssignRule {
  id: number;
  name: string;
  description: string | null;
  category: { id: number; name: string; icon_url: string | null };
  all_sub_categories: boolean;
  sub_category_ids: number[];
  assign_to: { id: number; name: string | null };
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ComplaintAssignRuleStats {
  total: number;
  active: number;
  inactive: number;
  auto_assigned_this_month: number;
}

export interface ComplaintCategoryListParams {
  page?: number;
  per_page?: number;
  search?: string;
  is_active?: boolean;
}

export interface ComplaintSubCategoryListParams extends ComplaintCategoryListParams {
  category_id?: number;
}

export interface ComplaintAssignRuleListParams extends ComplaintCategoryListParams {
  category_id?: number;
  assign_to?: number;
}

export interface CreateComplaintCategoryPayload {
  name: string;
  description?: string;
  icon_key?: string;
  display_order?: number;
  instructions?: string;
  is_active?: boolean;
}

export type UpdateComplaintCategoryPayload = Partial<CreateComplaintCategoryPayload>;

export interface CreateComplaintSubCategoryPayload {
  category_id: number;
  name: string;
  description?: string;
  is_active?: boolean;
}

export type UpdateComplaintSubCategoryPayload = Partial<Omit<CreateComplaintSubCategoryPayload, "category_id">>;

export interface CreateComplaintAssignRulePayload {
  name: string;
  description?: string;
  category_id: number;
  all_sub_categories?: boolean;
  sub_category_ids?: number[];
  assign_to: number;
  is_active?: boolean;
}

export type UpdateComplaintAssignRulePayload = Partial<CreateComplaintAssignRulePayload>;

export const complaintCategoryService = {
  // ---- Categories ----
  async list(params?: ComplaintCategoryListParams) {
    const data = await httpClient.get<ListResponse<ComplaintCategory>>(API.complaintCategories.list, { params });
    return { items: data.items || [], total: data.total ?? data.items?.length ?? 0 };
  },

  async stats() {
    return httpClient.get<ComplaintCategoryStats>(API.complaintCategories.stats);
  },

  async get(id: string | number) {
    return httpClient.get<ComplaintCategory>(API.complaintCategories.detail(id));
  },

  async create(payload: CreateComplaintCategoryPayload) {
    return httpClient.post<ComplaintCategory>(API.complaintCategories.list, payload);
  },

  async update(id: string | number, payload: UpdateComplaintCategoryPayload) {
    return httpClient.put<ComplaintCategory>(API.complaintCategories.detail(id), payload);
  },

  async updateStatus(id: string | number, isActive: boolean) {
    return httpClient.patch<ComplaintCategory>(API.complaintCategories.status(id), { is_active: isActive });
  },

  async delete(id: string | number) {
    return httpClient.delete<void>(API.complaintCategories.detail(id));
  },

  async requestIconUploadUrl(payload: { file_name: string; content_type: string }) {
    return httpClient.post<{ upload_url: string; file_key: string; expires_in: number }>(API.complaintCategories.uploadUrl, payload);
  },

  // ---- Sub Categories ----
  async listSubCategories(params?: ComplaintSubCategoryListParams) {
    const data = await httpClient.get<ListResponse<ComplaintSubCategory>>(API.complaintCategories.subCategories, { params });
    return { items: data.items || [], total: data.total ?? data.items?.length ?? 0 };
  },

  async getSubCategory(id: string | number) {
    return httpClient.get<ComplaintSubCategory>(API.complaintCategories.subCategoryDetail(id));
  },

  async createSubCategory(payload: CreateComplaintSubCategoryPayload) {
    return httpClient.post<ComplaintSubCategory>(API.complaintCategories.subCategories, payload);
  },

  async updateSubCategory(id: string | number, payload: UpdateComplaintSubCategoryPayload) {
    return httpClient.put<ComplaintSubCategory>(API.complaintCategories.subCategoryDetail(id), payload);
  },

  async updateSubCategoryStatus(id: string | number, isActive: boolean) {
    return httpClient.patch<ComplaintSubCategory>(API.complaintCategories.subCategoryStatus(id), { is_active: isActive });
  },

  async deleteSubCategory(id: string | number) {
    return httpClient.delete<void>(API.complaintCategories.subCategoryDetail(id));
  },

  // ---- Assign Rules ----
  async listAssignRules(params?: ComplaintAssignRuleListParams) {
    const data = await httpClient.get<ListResponse<ComplaintAssignRule>>(API.complaintCategories.assignRules, { params });
    return { items: data.items || [], total: data.total ?? data.items?.length ?? 0 };
  },

  async assignRuleStats() {
    return httpClient.get<ComplaintAssignRuleStats>(API.complaintCategories.assignRuleStats);
  },

  async getAssignRule(id: string | number) {
    return httpClient.get<ComplaintAssignRule>(API.complaintCategories.assignRuleDetail(id));
  },

  async createAssignRule(payload: CreateComplaintAssignRulePayload) {
    return httpClient.post<ComplaintAssignRule>(API.complaintCategories.assignRules, payload);
  },

  async updateAssignRule(id: string | number, payload: UpdateComplaintAssignRulePayload) {
    return httpClient.put<ComplaintAssignRule>(API.complaintCategories.assignRuleDetail(id), payload);
  },

  async updateAssignRuleStatus(id: string | number, isActive: boolean) {
    return httpClient.patch<ComplaintAssignRule>(API.complaintCategories.assignRuleStatus(id), { is_active: isActive });
  },

  async deleteAssignRule(id: string | number) {
    return httpClient.delete<void>(API.complaintCategories.assignRuleDetail(id));
  },
};
