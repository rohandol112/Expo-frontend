import type { AdminStatus } from "@/types/system";

export type Language = "Hindi" | "English" | "Marathi" | "Gujarati" | "Tamil";

export interface ReferralUser {
  id: string;
  name: string;
  phone: string;
  rank: number;
  state: string;
  district: string;
  area: string;
  language: Language;
  referralCode: string;
  totalReferredUsers: number;
  successfulReferrals: number;
  activeUsers: number;
  uninstalledUsers: number;
  totalReferredPoints: number;
}

export interface StreakUser {
  id: string;
  name: string;
  phone: string;
  rank: number;
  state: string;
  district: string;
  area: string;
  language: Language;
  currentStreak: number;
  longestStreak: number;
  totalActiveDays: number;
  lastActiveAt: string;
  streakPoints: number;
}

export type GiftRequestLinkStatus = "Requested" | "Not Requested";
export type RewardsSubmitStatus = "Submitted" | "Pending" | "-";

export interface Winner {
  id: string;
  userId: string;
  name: string;
  phone: string;
  state: string;
  district: string;
  area: string;
  language: Language;
  totalPoints: number;
  readingPoints: number;
  quizPoints: number;
  bonusPoints: number;
  referralPoints: number;
  streakDays: number;
  giftRequestStatus: GiftRequestLinkStatus;
  giftRequestedAt?: string;
  rewardsStatus: RewardsSubmitStatus;
  quiz1Results?: boolean[];
  quiz1AttemptTime?: string;
  quiz2Results?: boolean[];
  quiz2AttemptTime?: string;
}

export interface UserAnalyticsActivity {
  id: string;
  dateTime: string;
  activity: string;
  points: number;
  type: "Reading" | "Quiz" | "Referral" | "Bonus";
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
  language: Language;
  location: string;
  memberSince: string;
  lastActiveAt: string;
  totalPoints: number;
  readingPoints: number;
  quizPoints: number;
  bonusPoints: number;
  referralPoints: number;
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
  rankOrGift: string;
  status: GiftRequestStatus;
  requestedAt: string;
  address?: string;
  dob?: string;
  panNumber?: string;
  panPhoto?: string;
  aadhaarNumber?: string;
  aadhaarPhoto?: string;
  message?: string;
  rejectionReason?: string;
}

export interface GiftRank {
  rank: number;
  locationId: string;
  giftName: string;
  shortDescription: string;
  photo?: string;
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
  quizNumber: 1 | 2;
  isActive: boolean;
  scheduleDate: string;
  startTime: string;
  endTime: string;
  totalQuestions: number;
  pointsPerCorrect: number;
  questions: QuizQuestion[];
}

export interface TodaysGift {
  giftName: string;
  photo?: string;
  description?: string;
}

export interface DailyQuizLocation {
  locationId: string;
  locationLabel: string;
  state: string;
  isActive: boolean;
  quiz1: QuizConfig;
  quiz2: QuizConfig;
  todaysGift: TodaysGift;
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
  state: string;
  district: string;
  area: string;
  status: AdminStatus;
}

export interface RewardsSettings {
  streakPointsPerDay: number;
  referralPointsPerInstall: number;
  referralApprovalDays: number;
}
