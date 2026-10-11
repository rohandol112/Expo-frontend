import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { dailyQuizService } from "@/services/dailyQuiz.service";
import type { QuizConfig, QuizQuestion, TodaysGift } from "@/types/referrals";

export const dailyQuizKeys = {
  all: ["daily-quiz"] as const,
  locations: () => [...dailyQuizKeys.all, "locations"] as const,
  location: (id: string) => [...dailyQuizKeys.all, "location", id] as const,
};

export function useDailyQuizLocations() {
  return useQuery({
    queryKey: dailyQuizKeys.locations(),
    queryFn: () => dailyQuizService.listLocations(),
  });
}

export function useDailyQuizLocation(locationId: string) {
  return useQuery({
    queryKey: dailyQuizKeys.location(locationId),
    queryFn: () => dailyQuizService.getLocation(locationId),
    enabled: Boolean(locationId),
  });
}

export function useSaveQuizSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ locationId, quizNumber, payload }: { locationId: string; quizNumber: 1 | 2; payload: Partial<Omit<QuizConfig, "questions" | "quizNumber">> }) =>
      dailyQuizService.saveQuizSettings(locationId, quizNumber, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: dailyQuizKeys.all }),
  });
}

export function useAddQuizQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ locationId, quizNumber, payload }: { locationId: string; quizNumber: 1 | 2; payload: Omit<QuizQuestion, "id"> }) =>
      dailyQuizService.addQuestion(locationId, quizNumber, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: dailyQuizKeys.all }),
  });
}

export function useUpdateQuizQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ locationId, quizNumber, questionId, payload }: { locationId: string; quizNumber: 1 | 2; questionId: string; payload: Omit<QuizQuestion, "id"> }) =>
      dailyQuizService.updateQuestion(locationId, quizNumber, questionId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: dailyQuizKeys.all }),
  });
}

export function useDeleteQuizQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ locationId, quizNumber, questionId }: { locationId: string; quizNumber: 1 | 2; questionId: string }) =>
      dailyQuizService.deleteQuestion(locationId, quizNumber, questionId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: dailyQuizKeys.all }),
  });
}

export function useSaveTodaysGift() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ locationId, payload }: { locationId: string; payload: TodaysGift }) => dailyQuizService.saveTodaysGift(locationId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: dailyQuizKeys.all }),
  });
}
