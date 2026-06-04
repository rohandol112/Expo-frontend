import type { LoginPayload, LoginResponse, AdminUser } from "@/types/auth";
import { API } from "@/lib/apiEndpoints";
import { httpClient } from "@/lib/httpClient";

interface AdminLoginApiResponse {
  token: string;
  expires_in: number;
  user: AdminUser;
}

export interface UpdateProfilePayload {
  name?: string;
  email?: string;
  language_code?: string | null;
  state_id?: number | null;
  district_id?: number | null;
  area_id?: number | null;
}

export interface ProfilePhotoUploadUrlPayload {
  file_name: string;
  content_type: string;
}

export interface ProfilePhotoUploadUrlResponse {
  upload_url: string;
  file_key: string;
  expires_in: number;
}

export const authService = {
  async login(payload: LoginPayload): Promise<LoginResponse> {
    const data = await httpClient.post<AdminLoginApiResponse>(API.auth.adminLogin, payload);
    return { user: data.user, token: data.token };
  },
  async logout() {
    return httpClient.post<void>(API.auth.logout);
  },
  sendOtp(payload: { phone: string }) {
    return httpClient.post<{ expires_in: number }>(API.auth.sendOtp, payload);
  },
  verifyOtp(payload: { phone: string; otp: string; refer_by?: string }) {
    return httpClient.post<{ token: string; expires_in: number; user: unknown }>(API.auth.verifyOtp, payload);
  },
  profile() {
    return httpClient.get<unknown>(API.auth.profile);
  },
  updateProfile(payload: UpdateProfilePayload) {
    return httpClient.put<unknown>(API.auth.profile, payload);
  },
  requestProfilePhotoUploadUrl(payload: ProfilePhotoUploadUrlPayload) {
    return httpClient.post<ProfilePhotoUploadUrlResponse>(API.auth.profilePhotoUploadUrl, payload);
  },
  confirmProfilePhotoUpload(payload: { file_key: string }) {
    return httpClient.post<unknown>(API.auth.profilePhotoConfirm, payload);
  },
  deleteAccount() {
    return httpClient.delete<void>(API.auth.account);
  },
};
