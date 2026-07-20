import { API } from "@/lib/apiEndpoints";
import { httpClient } from "@/lib/httpClient";
import type {
  CampaignContact,
  CampaignContactInput,
  CampaignSettings,
  CampaignStats,
  CampaignUpload,
  Paged,
} from "@/types/competitionAdmin";

export type ContactListParams = {
  page?: number;
  per_page?: number;
  search?: string;
  call_status?: string;
  whatsapp_status?: string;
  participation_status?: string;
  upload_id?: number;
};

export const campaignService = {
  settings() {
    return httpClient.get<CampaignSettings>(API.campaign.settings);
  },

  updateSettings(patch: Partial<CampaignSettings>) {
    return httpClient.put<CampaignSettings>(API.campaign.settings, patch);
  },

  stats() {
    return httpClient.get<CampaignStats>(API.campaign.stats);
  },

  uploads() {
    return httpClient.get<CampaignUpload[]>(API.campaign.uploads);
  },

  uploadContacts(fileName: string, contacts: CampaignContactInput[]) {
    return httpClient.post<{ upload: CampaignUpload; inserted: number }>(API.campaign.uploadContacts, {
      file_name: fileName,
      contacts,
    });
  },

  contacts(params?: ContactListParams) {
    return httpClient.get<Paged<CampaignContact>>(API.campaign.contacts, { params });
  },

  updateContact(id: number, patch: Partial<Pick<CampaignContact, "whatsapp_status" | "participation_status" | "call_outcome" | "call_summary">>) {
    return httpClient.put<CampaignContact>(API.campaign.contact(id), patch);
  },

  callContact(id: number) {
    return httpClient.post<CampaignContact>(API.campaign.callContact(id));
  },

  start(limit = 50) {
    return httpClient.post<{ queued: number }>(API.campaign.start, { limit });
  },
};
