import type { AdminStatus } from "@/types/system";
import type { ImageValue, StoredImage } from "@/lib/mediaUpload";

/** A stat card value with its change against the previous period (null when there is no comparison). */
export interface TrendStat {
  value: number;
  changePct: number | null;
}

/** Who a report row is about: shared by every reward report. */
export interface RewardUserBase {
  userId: string;
  name: string;
  phone: string;
  state: string;
  district: string;
  area: string;
  /** Display name of the user's language, e.g. "Hindi". */
  language: string;
}

export interface ReferralUser extends RewardUserBase {
  id: string;
  rank: number;
  referralCode: string;
  totalReferredUsers: number;
  successfulReferrals: number;
  pendingReferrals: number;
  activeUsers: number;
  /** Referred users who haven't opened the app in 14 days (or deleted their account). */
  uninstalledUsers: number;
  totalReferredPoints: number;
}

export interface ReferralStats {
  referrers: TrendStat;
  referredUsers: TrendStat;
  successfulReferrals: TrendStat;
  pendingReferrals: TrendStat;
  activeReferredUsers: TrendStat;
  inactiveReferredUsers: TrendStat;
  referralPoints: TrendStat;
}

export interface StreakUser extends RewardUserBase {
  id: string;
  rank: number;
  currentStreak: number;
  longestStreak: number;
  totalActiveDays: number;
  lastActiveAt: string;
  streakPoints: number;
}

export interface StreakStats {
  streakUsers: number;
  activeToday: number;
  longestStreak: number;
  averageStreak: number;
  streakPoints: number;
}

export type GiftRequestLinkStatus = "Requested" | "Not Requested";
export type RewardsSubmitStatus = "Submitted" | "Pending" | "-";

/** A monthly winner, a quiz player or a leader board row (quiz fields only on the quiz tab). */
export interface Winner extends RewardUserBase {
  id: string;
  rank: number;
  locationRank: number | null;
  locationTitle: string | null;
  totalPoints: number;
  readingPoints: number;
  quizPoints: number;
  /** Streak, task, welcome and manual bonus points together. */
  bonusPoints: number;
  referralPoints: number;
  streakDays: number;
  /** The gift this rank wins in the user's location, when one is set. */
  wonGift: string | null;
  giftRequestId: string | null;
  giftRequestStatus: GiftRequestLinkStatus;
  giftRequestedAt?: string;
  rewardsStatus: RewardsSubmitStatus;
  quiz1Results?: boolean[];
  quiz1AttemptTime?: string;
  quiz2Results?: boolean[];
  quiz2AttemptTime?: string;
  /** Finish-order position among players who got every quiz right that day. */
  giftPosition?: number | null;
  isWinner?: boolean;
}

export interface UserAnalyticsActivity {
  id: string;
  dateTime: string;
  activity: string;
  points: number;
  type: "Reading" | "Quiz" | "Referral" | "Bonus" | "Streak";
}

export interface UserAnalyticsDayPoint {
  date: string;
  reading: number;
  quiz: number;
  bonus: number;
  referral: number;
}

export interface UserAnalytics {
  userId: string;
  name: string;
  phone: string;
  status: AdminStatus;
  language: string;
  location: string;
  competitionLocation: string | null;
  memberSince: string;
  lastActiveAt: string;
  totalPoints: number;
  readingPoints: number;
  quizPoints: number;
  bonusPoints: number;
  referralPoints: number;
  currentStreak: number;
  longestStreak: number;
  giftRequestsCount: number;
  giftRequestsSubmitted: number;
  giftRequestsPending: number;
  dayWisePoints: UserAnalyticsDayPoint[];
  recentActivity: UserAnalyticsActivity[];
}

export type GiftRequestStatus = "Pending" | "Approved" | "Rejected";

export interface GiftRequest {
  id: string;
  userId: string;
  name: string;
  phone: string;
  state: string;
  district: string;
  area: string;
  locationTitle: string | null;
  winType: "monthly" | "quiz";
  periodKey: string;
  rank: number;
  giftName: string;
  giftValue: number | null;
  rankOrGift: string;
  status: GiftRequestStatus;
  requestedAt: string;
  delivered: boolean;
  address?: string;
  dob?: string;
  panRequired?: boolean;
  panNumber?: string;
  panPhoto?: string;
  aadhaarNumber?: string;
  aadhaarPhoto?: string;
  giftPhoto?: string;
  deliveryPhoto?: string;
  message?: string;
  rejectionReason?: string;
}

export interface GiftRank {
  rank: number;
  locationId: string;
  giftName: string;
  shortDescription: string;
  photo?: StoredImage;
  giftValue: number | null;
  /** Filled from the All Locations default because this location has none of its own. */
  inherited: boolean;
}

/** A rank row being edited; the photo may be a new file. */
export interface GiftRankInput {
  rank: number;
  giftName: string;
  shortDescription: string;
  photo: ImageValue[];
  giftValue: number | null;
  /** Still showing the All Locations default (not edited for this location). */
  inherited: boolean;
}

export interface QuizQuestion {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  timerSeconds: number;
  points: number;
}

export interface QuizConfig {
  /** Absent until the quiz is saved for that date. */
  quizId?: string;
  quizNumber: 1 | 2;
  isActive: boolean;
  /** YYYY-MM-DD */
  scheduleDate: string;
  /** HH:MM, 24-hour */
  startTime: string;
  endTime: string;
  totalQuestions: number;
  pointsPerCorrect: number;
  attemptCount: number;
  questions: QuizQuestion[];
}

export interface TodaysGift {
  giftName: string;
  photo?: StoredImage;
  description?: string;
  giftValue?: number | null;
}

export interface DailyQuizLocation {
  locationId: string;
  locationLabel: string;
  state: string;
  isActive: boolean;
  date: string;
  quiz1: QuizConfig;
  quiz2: QuizConfig;
  todaysGift: TodaysGift | null;
}

export interface ImportantLink {
  id: string;
  title: string;
  description: string;
  status: AdminStatus;
}

export interface CompetitionLocation {
  id: string;
  title: string;
  stateIds: string[];
  districtIds: string[];
  areaIds: string[];
  /** Names joined with ", ", or "All Districts" / "All Areas" when the level is open. */
  state: string;
  district: string;
  area: string;
  status: AdminStatus;
}

export interface CompetitionLocationInput {
  title: string;
  stateIds: string[];
  districtIds: string[];
  areaIds: string[];
  status: "Active" | "Inactive";
}

export interface RewardsSettings {
  streakPointsPerDay: number;
  referralPointsPerInstall: number;
  referralApprovalDays: number;
  referralApplyWindowDays: number;
  readingPointsPerArticle: number;
  readingMinSeconds: number;
  readingRewardGap: number;
  readingDailyArticleLimit: number;
  likePointsPerArticle: number;
  quizDailyWinnerCount: number;
  quizGiftClaimHours: number;
  monthlyGiftClaimDays: number;
  panRequiredMinGiftValue: number;
  taskReadTarget: number;
  taskReadBonus: number;
  taskReferTarget: number;
  taskReferBonus: number;
  taskQuizTarget: number;
  taskQuizBonus: number;
  welcomeBonusPoints: number;
}

export interface RewardsOverview {
  from: string;
  to: string;
  stats: {
    usersEarningPoints: TrendStat;
    pointsEarned: TrendStat;
    pointsRedeemed: TrendStat;
    registeredUsers: TrendStat;
  };
  quizParticipants: { total: number; averageDaily: number; series: { date: string; participants: number }[] };
  referralUsers: { total: number; averageDaily: number; series: { date: string; referrals: number }[] };
  streakUsers: { series: { day: number; users: number }[]; moreThan30: number };
  totalPoints: { series: { date: string; points: number }[] };
}

/** A page of a server-paginated report. */
export interface ReportPage<T> {
  items: T[];
  total: number;
}
