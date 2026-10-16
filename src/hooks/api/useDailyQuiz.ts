import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { handleError } from "@/lib/errorHandler";
import { dailyQuizService, type QuizQuestionInput } from "@/services/dailyQuiz.service";
import type { ImageValue } from "@/lib/mediaUpload";
import type { QuizConfig } from "@/types/referrals";

export const dailyQuizKeys = {
  all: ["daily-quiz"] as const,
  locations: (date: string) => [...dailyQuizKeys.all, "locations", date] as const,
  location: (id: string, date: string) => [...dailyQuizKeys.all, "location", id, date] as const,
};

export function useDailyQuizLocations(date: string) {
  return useQuery({
    queryKey: dailyQuizKeys.locations(date),
    queryFn: () => dailyQuizService.listLocations(date),
  });
}

export function useDailyQuizLocation(locationId: string, date: string) {
  return useQuery({
    queryKey: dailyQuizKeys.location(locationId, date),
    queryFn: () => dailyQuizService.getLocation(locationId, date),
    enabled: Boolean(locationId) && locationId !== "all",
  });
}

function useQuizMutation<V>(fn: (vars: V) => Promise<void>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onError: (error) => handleError(error),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: dailyQuizKeys.all }),
  });
}

export function useSaveQuizSettings() {
  return useQuizMutation(
    ({ locationId, quizNumber, payload }: {
      locationId: string;
      quizNumber: 1 | 2;
      payload: Pick<QuizConfig, "isActive" | "scheduleDate" | "startTime" | "endTime" | "totalQuestions" | "pointsPerCorrect">;
    }) => dailyQuizService.saveQuizSettings(locationId, quizNumber, payload),
  );
}

export function useAddQuizQuestion() {
  return useQuizMutation(({ quizId, payload }: { quizId: string; payload: QuizQuestionInput }) => dailyQuizService.addQuestion(quizId, payload));
}

export function useUpdateQuizQuestion() {
  return useQuizMutation(({ questionId, payload }: { questionId: string; payload: QuizQuestionInput }) =>
    dailyQuizService.updateQuestion(questionId, payload),
  );
}

export function useDeleteQuizQuestion() {
  return useQuizMutation((questionId: string) => dailyQuizService.deleteQuestion(questionId));
}

export function useSaveTodaysGift() {
  return useQuizMutation(
    ({ locationId, payload }: {
      locationId: string;
      payload: { date: string; giftName: string; description?: string; giftValue?: number | null; photo: ImageValue[] };
    }) => dailyQuizService.saveTodaysGift(locationId, payload),
  );
}
