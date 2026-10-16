import { API } from "@/lib/apiEndpoints";
import { httpClient } from "@/lib/httpClient";
import { toAdminStatus, toApiStatus } from "@/lib/format";
import type { CompetitionLocation, CompetitionLocationInput, ImportantLink, RewardsSettings } from "@/types/referrals";

interface ApiSettings {
  streak_points_per_day: number;
  referral_points_per_install: number;
  referral_approval_days: number;
  referral_apply_window_days: number;
  reading_points_per_article: number;
  reading_min_seconds: number;
  reading_reward_gap: number;
  reading_daily_article_limit: number;
  like_points_per_article: number;
  quiz_daily_winner_count: number;
  quiz_gift_claim_hours: number;
  monthly_gift_claim_days: number;
  pan_required_min_gift_value: number;
  task_read_target: number;
  task_read_bonus: number;
  task_refer_target: number;
  task_refer_bonus: number;
  task_quiz_target: number;
  task_quiz_bonus: number;
  welcome_bonus_points: number;
}

/** camelCase ↔ snake_case for every settings field. */
const SETTINGS_FIELDS: Record<keyof RewardsSettings, keyof ApiSettings> = {
  streakPointsPerDay: "streak_points_per_day",
  referralPointsPerInstall: "referral_points_per_install",
  referralApprovalDays: "referral_approval_days",
  referralApplyWindowDays: "referral_apply_window_days",
  readingPointsPerArticle: "reading_points_per_article",
  readingMinSeconds: "reading_min_seconds",
  readingRewardGap: "reading_reward_gap",
  readingDailyArticleLimit: "reading_daily_article_limit",
  likePointsPerArticle: "like_points_per_article",
  quizDailyWinnerCount: "quiz_daily_winner_count",
  quizGiftClaimHours: "quiz_gift_claim_hours",
  monthlyGiftClaimDays: "monthly_gift_claim_days",
  panRequiredMinGiftValue: "pan_required_min_gift_value",
  taskReadTarget: "task_read_target",
  taskReadBonus: "task_read_bonus",
  taskReferTarget: "task_refer_target",
  taskReferBonus: "task_refer_bonus",
  taskQuizTarget: "task_quiz_target",
  taskQuizBonus: "task_quiz_bonus",
  welcomeBonusPoints: "welcome_bonus_points",
};

function toSettings(s: ApiSettings): RewardsSettings {
  const out = {} as RewardsSettings;
  for (const [camel, snake] of Object.entries(SETTINGS_FIELDS) as [keyof RewardsSettings, keyof ApiSettings][]) {
    out[camel] = Number(s[snake] ?? 0);
  }
  return out;
}

interface NamedId {
  id: number;
  name: string;
}

interface ApiLocation {
  id: number;
  title: string;
  state_ids: number[];
  district_ids: number[];
  area_ids: number[];
  states: NamedId[];
  districts: NamedId[];
  areas: NamedId[];
  state_label: string;
  district_label: string;
  area_label: string;
  status: string;
}

function toLocation(r: ApiLocation): CompetitionLocation {
  return {
    id: String(r.id),
    title: r.title,
    stateIds: r.state_ids.map(String),
    districtIds: r.district_ids.map(String),
    areaIds: r.area_ids.map(String),
    state: r.state_label,
    district: r.district_label,
    area: r.area_label,
    status: toAdminStatus(r.status),
  };
}

function toLocationBody(input: CompetitionLocationInput) {
  return {
    title: input.title.trim(),
    state_ids: input.stateIds.map(Number),
    district_ids: input.districtIds.map(Number),
    area_ids: input.areaIds.map(Number),
    status: toApiStatus(input.status),
  };
}

interface ApiLink {
  id: number;
  title: string;
  description: string;
  status: string;
}

const toLink = (r: ApiLink): ImportantLink => ({ id: String(r.id), title: r.title, description: r.description, status: toAdminStatus(r.status) });
const toLinkBody = (input: Omit<ImportantLink, "id">) => ({ title: input.title.trim(), description: input.description, status: toApiStatus(input.status) });

export const rewardsSettingsService = {
  async get(): Promise<RewardsSettings> {
    return toSettings(await httpClient.get<ApiSettings>(API.rewards.settings));
  },

  async update(payload: Partial<RewardsSettings>): Promise<RewardsSettings> {
    const body: Partial<Record<keyof ApiSettings, number>> = {};
    for (const [camel, value] of Object.entries(payload) as [keyof RewardsSettings, number | undefined][]) {
      if (value !== undefined) body[SETTINGS_FIELDS[camel]] = value;
    }
    return toSettings(await httpClient.put<ApiSettings>(API.rewards.settings, body));
  },

  async listLocations(): Promise<{ items: CompetitionLocation[]; total: number }> {
    const data = await httpClient.get<{ items: ApiLocation[] }>(API.rewards.locations);
    const items = data.items.map(toLocation);
    return { items, total: items.length };
  },

  async getLocation(id: string): Promise<CompetitionLocation> {
    return toLocation(await httpClient.get<ApiLocation>(API.rewards.location(id)));
  },

  async createLocation(input: CompetitionLocationInput): Promise<CompetitionLocation> {
    return toLocation(await httpClient.post<ApiLocation>(API.rewards.locations, toLocationBody(input)));
  },

  async updateLocation(id: string, input: CompetitionLocationInput): Promise<CompetitionLocation> {
    return toLocation(await httpClient.put<ApiLocation>(API.rewards.location(id), toLocationBody(input)));
  },

  async removeLocation(id: string): Promise<void> {
    await httpClient.delete(API.rewards.location(id));
  },

  async listLinks(): Promise<{ items: ImportantLink[]; total: number }> {
    const data = await httpClient.get<{ items: ApiLink[] }>(API.rewards.links);
    const items = data.items.map(toLink);
    return { items, total: items.length };
  },

  async getLink(id: string): Promise<ImportantLink> {
    return toLink(await httpClient.get<ApiLink>(API.rewards.link(id)));
  },

  async createLink(payload: Omit<ImportantLink, "id">): Promise<ImportantLink> {
    return toLink(await httpClient.post<ApiLink>(API.rewards.links, toLinkBody(payload)));
  },

  async updateLink(id: string, payload: Omit<ImportantLink, "id">): Promise<ImportantLink> {
    return toLink(await httpClient.put<ApiLink>(API.rewards.link(id), toLinkBody(payload)));
  },

  async removeLink(id: string): Promise<void> {
    await httpClient.delete(API.rewards.link(id));
  },
};
