import type { DailyQuizLocation, QuizConfig, QuizQuestion, TodaysGift } from "@/types/referrals";
import { dailyQuizLocations as seedLocations } from "@/mock/dailyQuiz.mock";

let locations: DailyQuizLocation[] = [...seedLocations];
let nextQuestionId = 1000;

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function quizKey(quizNumber: 1 | 2): "quiz1" | "quiz2" {
  return quizNumber === 1 ? "quiz1" : "quiz2";
}

export const dailyQuizService = {
  async listLocations(): Promise<DailyQuizLocation[]> {
    return clone(locations);
  },

  async getLocation(locationId: string): Promise<DailyQuizLocation | undefined> {
    return clone(locations.find((l) => l.locationId === locationId));
  },

  async saveQuizSettings(locationId: string, quizNumber: 1 | 2, payload: Partial<Omit<QuizConfig, "questions" | "quizNumber">>): Promise<DailyQuizLocation | undefined> {
    const key = quizKey(quizNumber);
    locations = locations.map((l) => (l.locationId === locationId ? { ...l, [key]: { ...l[key], ...payload } } : l));
    return clone(locations.find((l) => l.locationId === locationId));
  },

  async addQuestion(locationId: string, quizNumber: 1 | 2, payload: Omit<QuizQuestion, "id">): Promise<DailyQuizLocation | undefined> {
    const key = quizKey(quizNumber);
    const question: QuizQuestion = { ...payload, id: `q-${nextQuestionId++}` };
    locations = locations.map((l) =>
      l.locationId === locationId
        ? { ...l, [key]: { ...l[key], questions: [...l[key].questions, question], totalQuestions: l[key].questions.length + 1 } }
        : l,
    );
    return clone(locations.find((l) => l.locationId === locationId));
  },

  async updateQuestion(locationId: string, quizNumber: 1 | 2, questionId: string, payload: Omit<QuizQuestion, "id">): Promise<DailyQuizLocation | undefined> {
    const key = quizKey(quizNumber);
    locations = locations.map((l) =>
      l.locationId === locationId
        ? { ...l, [key]: { ...l[key], questions: l[key].questions.map((q) => (q.id === questionId ? { ...payload, id: questionId } : q)) } }
        : l,
    );
    return clone(locations.find((l) => l.locationId === locationId));
  },

  async deleteQuestion(locationId: string, quizNumber: 1 | 2, questionId: string): Promise<DailyQuizLocation | undefined> {
    const key = quizKey(quizNumber);
    locations = locations.map((l) =>
      l.locationId === locationId
        ? { ...l, [key]: { ...l[key], questions: l[key].questions.filter((q) => q.id !== questionId), totalQuestions: Math.max(0, l[key].questions.length - 1) } }
        : l,
    );
    return clone(locations.find((l) => l.locationId === locationId));
  },

  async saveTodaysGift(locationId: string, payload: TodaysGift): Promise<DailyQuizLocation | undefined> {
    locations = locations.map((l) => (l.locationId === locationId ? { ...l, todaysGift: payload } : l));
    return clone(locations.find((l) => l.locationId === locationId));
  },
};
