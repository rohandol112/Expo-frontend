import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  authService,
  type ProfilePhotoUploadUrlPayload,
  type UpdateProfilePayload,
} from "@/services/auth.service";

export const authApiKeys = {
  all: ["auth-api"] as const,
  profile: () => [...authApiKeys.all, "profile"] as const,
};

export function useAuthProfile(enabled = true) {
  return useQuery({
    queryKey: authApiKeys.profile(),
    queryFn: () => authService.profile(),
    enabled,
  });
}

export function useUpdateAuthProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => authService.updateProfile(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: authApiKeys.profile() }),
  });
}

export function useRequestProfilePhotoUploadUrl() {
  return useMutation({
    mutationFn: (payload: ProfilePhotoUploadUrlPayload) => authService.requestProfilePhotoUploadUrl(payload),
  });
}

export function useConfirmProfilePhotoUpload() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { file_key: string }) => authService.confirmProfilePhotoUpload(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: authApiKeys.profile() }),
  });
}

export function useLogoutApi() {
  return useMutation({
    mutationFn: () => authService.logout(),
  });
}

export function useDeleteAuthAccount() {
  return useMutation({
    mutationFn: () => authService.deleteAccount(),
  });
}
