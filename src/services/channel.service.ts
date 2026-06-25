import { API } from "@/lib/apiEndpoints";
import { httpClient } from "@/lib/httpClient";
import { toChannel, type BackendChannel } from "@/services/adapters/channel.adapter";
import type { Channel } from "@/types/channel";

interface ListResponse<T> {
  items: T[];
  total?: number;
}

export interface ChannelListParams {
  page?: number;
  per_page?: number;
  search?: string;
  is_active?: boolean;
}

export interface CreateChannelPayload {
  title: string;
  company_name?: string;
  language_code: string;
  description?: string;
  website?: string;
  logo_key?: string;
  state_id?: number | null;
  district_id?: number | null;
  area_ids?: number[];
  allow_user_posts?: boolean;
  is_active?: boolean;
}

export type UpdateChannelPayload = Partial<CreateChannelPayload>;

export const channelService = {
  async list(params?: ChannelListParams): Promise<{ items: Channel[]; total: number }> {
    const data = await httpClient.get<ListResponse<BackendChannel>>(API.channels.adminList, { params });
    const items = (data.items || []).map(toChannel);
    return { items, total: data.total ?? items.length };
  },

  async create(payload: CreateChannelPayload) {
    return toChannel(await httpClient.post<BackendChannel>(API.channels.adminList, payload));
  },

  async get(id: string) {
    return toChannel(await httpClient.get<BackendChannel>(API.channels.detail(id)));
  },

  async update(id: string, payload: UpdateChannelPayload) {
    return toChannel(await httpClient.put<BackendChannel>(API.channels.detail(id), payload));
  },

  async delete(id: string) {
    return httpClient.delete<void>(API.channels.detail(id));
  },

  async getLogoUploadUrl(payload: { file_name: string; content_type: string }) {
    return httpClient.post<{ upload_url: string; file_key: string; expires_in: number }>(
      API.channels.logoUploadUrl,
      payload
    );
  },
};
