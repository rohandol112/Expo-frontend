import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { languageService, type CreateLanguagePayload, type LanguageListParams, type UpdateLanguagePayload } from "@/services/language.service";

export const languageKeys = {
  all: ["languages"] as const,
  list: (params?: LanguageListParams) => [...languageKeys.all, "list", params] as const,
  detail: (id: string) => [...languageKeys.all, "detail", id] as const,
};

export function useLanguages(params?: LanguageListParams) {
  return useQuery({
    queryKey: languageKeys.list(params),
    queryFn: () => languageService.list(params),
  });
}

export function useLanguage(id: string) {
  return useQuery({
    queryKey: languageKeys.detail(id),
    queryFn: () => languageService.get(id),
    enabled: Boolean(id),
  });
}

export function useCreateLanguage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateLanguagePayload) => languageService.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: languageKeys.all }),
  });
}

export function useUpdateLanguage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateLanguagePayload }) => languageService.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: languageKeys.all }),
  });
}

export function useUpdateLanguageStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => languageService.updateStatus(id, isActive),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: languageKeys.all }),
  });
}

export function useDeleteLanguage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => languageService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: languageKeys.all }),
  });
}
