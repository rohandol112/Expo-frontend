import { API } from "@/lib/apiEndpoints";
import { httpClient } from "@/lib/httpClient";
import {
  toComplaint,
  toComplaintMessage,
  toComplaintTimelineEntry,
  STATUS_VALUES,
  type BackendComplaint,
  type BackendComplaintMessage,
  type BackendComplaintStatusHistory,
  type ComplaintMessage,
  type ComplaintTimelineEntry,
} from "@/services/adapters/complaint.adapter";
import type { Complaint, ComplaintStatus } from "@/types/complaint";

interface ListResponse<T> {
  items: T[];
  page?: number;
  per_page?: number;
  total?: number;
  has_more?: boolean;
}

export interface ComplaintListParams {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string;
  priority?: string;
  category_id?: number;
  language_code?: string;
  state_id?: number;
  district_id?: number;
  area_id?: number;
  user_id?: number;
  assigned_to?: number;
  date_from?: string;
  date_to?: string;
}

export interface ComplaintStats {
  total: number;
  pending: number;
  in_review: number;
  in_progress: number;
  awaiting_action: number;
  resolved: number;
  rejected: number;
}

export interface CreateComplaintPayload {
  user_id: number;
  subject: string;
  description: string;
  priority?: "low" | "medium" | "high" | "critical";
  category_id?: number;
  sub_category_id?: number;
  location_address?: string;
  language_code?: string;
  state_id?: number;
  district_id?: number;
  area_id?: number;
  assigned_to?: number;
  image_keys?: string[];
}

export type UpdateComplaintPayload = Partial<Omit<CreateComplaintPayload, "user_id">> & {
  status?: BackendComplaint["status"];
  admin_response?: string | null;
};

export interface ComplaintImageUploadPayload {
  file_name: string;
  content_type: "image/png" | "image/jpeg" | "image/webp";
}

export interface ComplaintImageUploadResponse {
  upload_url: string;
  file_key: string;
  expires_in: number;
}

const STATUS_LABEL_TO_VALUE = (status: ComplaintStatus): BackendComplaint["status"] => STATUS_VALUES[status];

export const complaintService = {
  async list(params?: ComplaintListParams): Promise<{ items: Complaint[]; total: number; page: number; perPage: number }> {
    const data = await httpClient.get<ListResponse<BackendComplaint>>(API.complaints.adminList, { params });
    return {
      items: (data.items || []).map(toComplaint),
      total: data.total ?? data.items?.length ?? 0,
      page: data.page ?? params?.page ?? 1,
      perPage: data.per_page ?? params?.per_page ?? 20,
    };
  },

  async stats() {
    return httpClient.get<ComplaintStats>(API.complaints.adminStats);
  },

  async get(id: string) {
    return toComplaint(await httpClient.get<BackendComplaint>(API.complaints.detail(id)));
  },

  async create(payload: CreateComplaintPayload) {
    return toComplaint(await httpClient.post<BackendComplaint>(API.complaints.adminList, payload));
  },

  async update(id: string, payload: UpdateComplaintPayload) {
    return toComplaint(await httpClient.put<BackendComplaint>(API.complaints.detail(id), payload));
  },

  async setStatus(id: string, status: ComplaintStatus, adminResponse?: string) {
    return toComplaint(
      await httpClient.put<BackendComplaint>(API.complaints.status(id), {
        status: STATUS_LABEL_TO_VALUE(status),
        admin_response: adminResponse,
      }),
    );
  },

  async delete(id: string) {
    return httpClient.delete<void>(API.complaints.detail(id));
  },

  async requestImageUploadUrl(payload: ComplaintImageUploadPayload) {
    return httpClient.post<ComplaintImageUploadResponse>(API.complaints.imageUploadUrl, payload);
  },

  async listMessages(id: string): Promise<ComplaintMessage[]> {
    const data = await httpClient.get<BackendComplaintMessage[]>(API.complaints.messages(id));
    return (data || []).map(toComplaintMessage);
  },

  async addMessage(id: string, message: string): Promise<ComplaintMessage> {
    return toComplaintMessage(await httpClient.post<BackendComplaintMessage>(API.complaints.messages(id), { message }));
  },

  async timeline(id: string): Promise<ComplaintTimelineEntry[]> {
    const data = await httpClient.get<BackendComplaintStatusHistory[]>(API.complaints.timeline(id));
    return (data || []).map(toComplaintTimelineEntry);
  },
};
