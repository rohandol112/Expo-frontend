import { ApiEndpoints } from '@/lib/apiEndpoints';
import { request } from '@/lib/httpClient';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export async function loginApi(payload: LoginPayload) {
  return request<AuthTokens, LoginPayload>({
    url: ApiEndpoints.AUTH.LOGIN,
    method: 'POST',
    body: payload,
  });
}

export async function refreshTokenApi(refreshToken: string) {
  return request<AuthTokens, { refreshToken: string }>({
    url: ApiEndpoints.AUTH.REFRESH_TOKEN,
    method: 'POST',
    body: { refreshToken },
  });
}

export async function logoutApi() {
  return request<void>({
    url: ApiEndpoints.AUTH.LOGOUT,
    method: 'POST',
  });
}
