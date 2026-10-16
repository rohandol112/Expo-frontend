import { API } from "@/lib/apiEndpoints";
import { httpClient } from "@/lib/httpClient";
import { imageKey, storedImage, type ImageValue } from "@/lib/mediaUpload";
import { uploadRewardImage } from "@/services/adapters/rewards.adapter";
import type { DailyQuizLocation, QuizConfig, QuizQuestion, TodaysGift } from "@/types/referrals";

interface ApiQuestion {
  id: number;
  question: string;
  options: string[];
  correct_index?: number;
  timer_seconds: number;
  points: number;
}

interface ApiQuiz {
  id: number;
  quiz_number: 1 | 2;
  quiz_date: string;
  start_time: string;
  end_time: string;
  is_active: boolean;
  points_per_correct: number;
  total_questions: number;
  attempt_count: number;
  questions?: ApiQuestion[];
}

interface ApiGift {
  gift_name: string;
  photo_key: string | null;
  photo_url: string | null;
  description: string | null;
  gift_value: number | null;
}

interface ApiOverviewRow {
  location_id: number;
  location_title: string;
  location_status: string;
  quiz1: ApiQuiz | null;
  quiz2: ApiQuiz | null;
  todays_gift: ApiGift | null;
}

interface ApiLocationDetail {
  date: string;
  location: { id: number; title: string; status: string };
  quiz1: ApiQuiz | null;
  quiz2: ApiQuiz | null;
  todays_gift: ApiGift | null;
}

/** "HH:MM:SS" → "HH:MM" for time inputs. */
const hhmm = (t: string) => t.slice(0, 5);

/** A quiz slot that hasn't been saved for the date yet ("Not Set"). */
function emptyQuiz(quizNumber: 1 | 2, date: string): QuizConfig {
  return { quizNumber, isActive: true, scheduleDate: date, startTime: "", endTime: "", totalQuestions: 5, pointsPerCorrect: 100, attemptCount: 0, questions: [] };
}

function toQuiz(q: ApiQuiz | null, quizNumber: 1 | 2, date: string): QuizConfig {
  if (!q) return emptyQuiz(quizNumber, date);
  return {
    quizId: String(q.id),
    quizNumber,
    isActive: q.is_active,
    scheduleDate: q.quiz_date.slice(0, 10),
    startTime: hhmm(q.start_time),
    endTime: hhmm(q.end_time),
    totalQuestions: q.total_questions,
    pointsPerCorrect: q.points_per_correct,
    attemptCount: q.attempt_count,
    questions: (q.questions ?? []).map(
      (x): QuizQuestion => ({
        id: String(x.id),
        text: x.question,
        options: x.options,
        correctIndex: x.correct_index ?? 0,
        timerSeconds: x.timer_seconds,
        points: x.points,
      }),
    ),
  };
}

function toGift(g: ApiGift | null): TodaysGift | null {
  if (!g) return null;
  return { giftName: g.gift_name, photo: storedImage(g.photo_key, g.photo_url), description: g.description ?? undefined, giftValue: g.gift_value };
}

function toLocation(
  id: number,
  title: string,
  status: string,
  date: string,
  quiz1: ApiQuiz | null,
  quiz2: ApiQuiz | null,
  gift: ApiGift | null,
): DailyQuizLocation {
  return {
    locationId: String(id),
    locationLabel: title,
    state: "",
    isActive: status === "active",
    date,
    quiz1: toQuiz(quiz1, 1, date),
    quiz2: toQuiz(quiz2, 2, date),
    todaysGift: toGift(gift),
  };
}

export interface QuizQuestionInput {
  text: string;
  options: string[];
  correctIndex: number;
  timerSeconds: number;
  points: number;
}

const toQuestionBody = (q: QuizQuestionInput) => ({
  question: q.text,
  options: q.options,
  correct_index: q.correctIndex,
  timer_seconds: q.timerSeconds,
  points: q.points,
});

export const dailyQuizService = {
  /** Every competition location with its two quizzes on a date (questions not included). */
  async listLocations(date: string): Promise<DailyQuizLocation[]> {
    const data = await httpClient.get<{ date: string; items: ApiOverviewRow[] }>(API.rewards.quizzes, { params: { date } });
    return data.items.map((r) => toLocation(r.location_id, r.location_title, r.location_status, data.date, r.quiz1, r.quiz2, r.todays_gift));
  },

  /** One location's quizzes for a date, with their questions and the day's gift. */
  async getLocation(locationId: string, date: string): Promise<DailyQuizLocation> {
    const d = await httpClient.get<ApiLocationDetail>(API.rewards.quizLocation(locationId), { params: { date } });
    return toLocation(d.location.id, d.location.title, d.location.status, d.date, d.quiz1, d.quiz2, d.todays_gift);
  },

  async saveQuizSettings(
    locationId: string,
    quizNumber: 1 | 2,
    payload: Pick<QuizConfig, "isActive" | "scheduleDate" | "startTime" | "endTime" | "totalQuestions" | "pointsPerCorrect">,
  ): Promise<void> {
    await httpClient.put(API.rewards.quizUpsert(locationId, quizNumber), {
      quiz_date: payload.scheduleDate,
      start_time: payload.startTime,
      end_time: payload.endTime,
      is_active: payload.isActive,
      points_per_correct: payload.pointsPerCorrect,
      total_questions: payload.totalQuestions,
    });
  },

  async addQuestion(quizId: string, payload: QuizQuestionInput): Promise<void> {
    await httpClient.post(API.rewards.quizQuestions(quizId), toQuestionBody(payload));
  },

  async updateQuestion(questionId: string, payload: QuizQuestionInput): Promise<void> {
    await httpClient.put(API.rewards.quizQuestion(questionId), toQuestionBody(payload));
  },

  async deleteQuestion(questionId: string): Promise<void> {
    await httpClient.delete(API.rewards.quizQuestion(questionId));
  },

  async saveTodaysGift(
    locationId: string,
    payload: { date: string; giftName: string; description?: string; giftValue?: number | null; photo: ImageValue[] },
  ): Promise<void> {
    await httpClient.put(API.rewards.quizGift(locationId), {
      gift_date: payload.date,
      gift_name: payload.giftName.trim(),
      description: payload.description?.trim() || null,
      gift_value: payload.giftValue ?? null,
      photo_key: await imageKey(payload.photo, uploadRewardImage("quiz-gift")),
    });
  },
};
