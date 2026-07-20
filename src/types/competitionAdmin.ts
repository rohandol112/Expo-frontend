// Shapes returned by the competition + AI-calling-campaign admin APIs.

export type PandalStatus = "submitted" | "approved" | "rejected";
export type BannerStatus = "in_review" | "approved" | "rejected";
export type BannerAiStatus = "pending" | "approved" | "rejected" | "uncertain" | "failed";

export interface CompetitionAdminStats {
  total_participants: number;
  approved_participants: number;
  pending_participants: number;
  rejected_participants: number;
  total_votes: number;
  votes_today: number;
  banners_in_review: number;
  banners_ai_uncertain: number;
  voting_starts_at: string | null;
  voting_ends_at: string | null;
  is_active: boolean;
}

export interface CompetitionConfig {
  title: string;
  subtitle: string;
  voting_starts_at: string | null;
  voting_ends_at: string | null;
  is_active: boolean;
  banner_points: number;
  total_pandals: number;
}

export interface LeaderboardItem {
  rank: number;
  id: number;
  name: string;
  cover_photo_url: string | null;
  contact_name: string;
  contact_phone: string;
  state_name: string | null;
  district_name: string | null;
  area_name: string | null;
  total_votes: number;
  percentage: number;
}

export interface LeaderboardData {
  items: LeaderboardItem[];
  page: number;
  per_page: number;
  total: number;
  total_votes: number;
  has_more: boolean;
}

export interface AdminEntryListItem {
  id: number;
  name: string;
  district_name: string | null;
  area_name: string | null;
  cover_photo_url: string | null;
  total_votes: number;
  rank: number | null;
  status: PandalStatus;
  committee_name: string;
  contact_name: string;
  contact_phone: string;
  created_at: string;
}

export interface AdminEntryDetail {
  id: number;
  name: string;
  description: string;
  established_year: number | null;
  committee_name: string;
  address: string;
  state_name: string | null;
  district_name: string | null;
  area_name: string | null;
  cover_photo_url: string | null;
  photo_urls: string[];
  total_votes: number;
  rank: number | null;
  status: PandalStatus;
  contact: { name: string; phone: string; email: string | null; participant_type: string };
  banners: AdminBanner[];
}

export interface AdminBanner {
  id: number;
  slot: number;
  image_url: string | null;
  file_name: string | null;
  status: BannerStatus;
  points: number;
  uploaded_at: string;
}

export interface AdminBannerListItem {
  id: number;
  pandal_id: number;
  pandal_name: string;
  district_name: string | null;
  area_name: string | null;
  slot: number;
  image_url: string | null;
  file_name: string | null;
  status: BannerStatus;
  ai_status: BannerAiStatus;
  ai_confidence: number | null;
  ai_reasons: string[];
  ai_suggestions: string[];
  uploaded_at: string;
}

export interface AdminBannerListData {
  items: AdminBannerListItem[];
  page: number;
  per_page: number;
  total: number;
  has_more: boolean;
  counts: { total: number; ai_approved: number; ai_uncertain: number; ai_rejected: number; manually_reviewed: number };
}

export interface Paged<T> {
  items: T[];
  page: number;
  per_page: number;
  total: number;
  has_more: boolean;
}

// ---- AI calling campaign ----

export type CampaignCallStatus =
  | "not_started"
  | "queued"
  | "calling"
  | "in_conversation"
  | "completed"
  | "no_answer"
  | "call_failed";

export type CampaignWhatsappStatus =
  | "not_sent"
  | "sent"
  | "delivered"
  | "read"
  | "in_progress"
  | "manual_required"
  | "failed";

export type CampaignParticipationStatus =
  | "not_started"
  | "in_progress"
  | "form_started"
  | "form_filled"
  | "completed"
  | "registered";

export interface CampaignSettings {
  bolna_agent_id: string | null;
  voice_label: string;
  language: string;
  script_name: string;
  campaign_description: string;
  calling_start_time: string;
  calling_end_time: string;
  retry_attempts: number;
  retry_delay_seconds: number;
  whatsapp_number: string | null;
  registration_link: string | null;
  is_active: boolean;
  updated_at: string;
}

export interface CampaignStats {
  total_contacts: number;
  calls_initiated: number;
  calls_completed: number;
  in_conversation: number;
  whatsapp_sent: number;
  forms_completed: number;
  registered: number;
}

export interface CampaignContact {
  id: number;
  upload_id: number | null;
  mandal_name: string;
  contact_person: string;
  phone: string;
  position: string;
  address: string;
  area: string;
  district: string;
  state: string;
  call_status: CampaignCallStatus;
  call_outcome: string | null;
  call_attempts: number;
  last_called_at: string | null;
  bolna_call_id: string | null;
  call_summary: string | null;
  whatsapp_status: CampaignWhatsappStatus;
  participation_status: CampaignParticipationStatus;
  created_at: string;
}

export interface CampaignUpload {
  id: number;
  file_name: string;
  total_contacts: number;
  uploaded_by: number | null;
  created_at: string;
}

export interface CampaignContactInput {
  mandal_name: string;
  contact_person: string;
  phone: string;
  position: string;
  address: string;
  area: string;
  district: string;
  state: string;
}
