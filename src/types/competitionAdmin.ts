// Shapes returned by the competition + AI-calling-campaign admin APIs.

export type PandalStatus = "submitted" | "approved" | "rejected";
export type BannerStatus = "in_review" | "approved" | "rejected";
export type BannerAiStatus = "pending" | "approved" | "rejected" | "uncertain" | "failed";

export interface AreaStatItem {
  area_id: number | null;
  area_name: string | null;
  district_name: string | null;
  participants: number;
  votes: number;
}

export interface CompetitionAdminStats {
  total_participants: number;
  approved_participants: number;
  pending_participants: number;
  rejected_participants: number;
  total_votes: number;
  total_views: number;
  votes_today: number;
  banners_in_review: number;
  banners_ai_uncertain: number;
  voting_starts_at: string | null;
  voting_ends_at: string | null;
  is_active: boolean;
  area_stats: AreaStatItem[];
}

export interface CompetitionConfig {
  title: string;
  subtitle: string;
  voting_starts_at: string | null;
  voting_ends_at: string | null;
  is_active: boolean;
  banner_points: number;
  participation_starts_at: string | null;
  participation_ends_at: string | null;
  banner_upload_starts_at: string | null;
  banner_upload_ends_at: string | null;
  max_banners: number;
  max_banner_file_size_mb: number;
  allowed_banner_formats: string;
  share_template_key: string | null;
  share_template_url: string | null;
  banner_image_key: string | null;
  banner_image_url: string | null;
  interstitial_frequency: number;
  interstitial_unit_id_android: string | null;
  interstitial_unit_id_ios: string | null;
  share_vote_text: string;
  share_support_text: string;
  share_footer_text: string;
  participant_note: string;
  show_on_app: boolean;
  allow_multiple_entries: boolean;
  auto_publish_approved: boolean;
  leaderboard_display: "always" | "after_voting_starts" | "after_voting_ends";
  target_scope: "all" | "specific";
  target_state_ids: number[];
  target_district_ids: number[];
  target_area_ids: number[];
  button_scope: "all" | "specific";
  button_state_ids: number[];
  button_district_ids: number[];
  button_area_ids: number[];
  /** YYYY-MM-DD. Visarjan dates on the app are derived from this + visarjan days. */
  festival_start_date: string | null;
  max_reports_per_user: number;
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
  state_name?: string | null;
  district_name: string | null;
  area_name: string | null;
  cover_photo_url: string | null;
  total_votes: number;
  rank: number | null;
  status: PandalStatus;
  committee_name: string;
  contact_name: string;
  contact_phone: string;
  contact_email?: string | null;
  submitted_by?: string | null;
  submitted_by_phone?: string | null;
  created_at: string;
  updated_at?: string | null;
}

export interface EntryActivity {
  id: number;
  type: string;
  message: string;
  actor_name: string | null;
  created_at: string;
}

export interface AdminEntryDetail {
  id: number;
  name: string;
  description: string;
  established_year: number | null;
  committee_name: string;
  address: string;
  state_id: number | null;
  district_id: number | null;
  area_id: number | null;
  state_name: string | null;
  district_name: string | null;
  area_name: string | null;
  cover_photo_url: string | null;
  photo_urls: string[];
  total_votes: number;
  rank: number | null;
  status: PandalStatus;
  rejection_reason: string | null;
  entry_code: string;
  admin_notes: string | null;
  submitted_on: string | null;
  submitted_by: string | null;
  submitted_by_phone: string | null;
  visarjan_days?: string | null;
  contact: { name: string; phone: string; email: string | null; participant_type: string };
  custom_fields: Record<string, string>;
  banners: AdminBanner[];
  activity: EntryActivity[];
}

export interface UpdateEntryInput {
  name?: string;
  description?: string;
  established_year?: number;
  committee_name?: string;
  address?: string;
  state_id?: number;
  district_id?: number;
  area_id?: number;
  participant_type?: "individual" | "organization";
  contact_name?: string;
  contact_phone?: string;
  contact_email?: string | null;
  visarjan_days?: string | null;
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
  rejection_reason: string | null;
  ai_status: BannerAiStatus;
  ai_confidence: number | null;
  ai_reasons: string[];
  ai_suggestions: string[];
  uploaded_at: string;
}

export interface BannerReviewCounts {
  total: number;
  ai_approved: number;
  ai_uncertain: number;
  ai_rejected: number;
  manually_reviewed: number;
  in_review: number;
  priority_high: number;
  priority_medium: number;
  priority_low: number;
  overdue: number;
  reviewed_today: number;
}

export interface AdminBannerListData {
  items: AdminBannerListItem[];
  page: number;
  per_page: number;
  total: number;
  has_more: boolean;
  counts: BannerReviewCounts;
}

// ---- User reports (Report an Issue) ----

export type CompetitionReportStatus = "wrong" | "resolved";

export interface CompetitionReport {
  id: number;
  title: string;
  contact_number: string;
  email: string;
  description: string;
  status: CompetitionReportStatus;
  pandal_id: number | null;
  pandal_name: string | null;
  submitted_at: string;
  resolved_at: string | null;
}

export interface AdminReportListData {
  items: CompetitionReport[];
  page: number;
  per_page: number;
  total: number;
  has_more: boolean;
  counts: { total: number; wrong: number; resolved: number };
}

// ---- Competition rules ----

export interface CompetitionRule {
  id: number;
  title: string;
  icon: string | null;
  short_note: string;
  details: string[];
  is_important: boolean;
  is_active: boolean;
  sort_order: number;
}

export interface CompetitionRuleInput {
  title: string;
  icon?: string | null;
  short_note?: string;
  details?: string[];
  is_important?: boolean;
  is_active?: boolean;
  sort_order?: number;
}

export type FormFieldType = "text" | "textarea" | "select" | "multiselect" | "date" | "phone" | "email" | "image";

export interface FormField {
  id: number;
  field_key: string;
  label: string;
  field_type: FormFieldType;
  is_required: boolean;
  is_enabled: boolean;
  is_system: boolean;
  sort_order: number;
}

export interface CreateFormFieldInput {
  label: string;
  field_type: FormFieldType;
  is_required: boolean;
  is_enabled: boolean;
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
