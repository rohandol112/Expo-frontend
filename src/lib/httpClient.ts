import axios, {
  type AxiosInstance,
  type AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios';
import { useAuthStore } from '@/store/useAuthStore';
import type { RequestOptions } from '@/types/api.types';

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '';
const baseURL = rawBaseUrl && !rawBaseUrl.startsWith('http') ? `https://${rawBaseUrl}` : rawBaseUrl;

const httpClient: AxiosInstance = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false,
});

httpClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;

    if (status === 401) {
      useAuthStore.getState().clearAuth();
    }

    return Promise.reject(error);
  }
);

export function setAuthHeader(token: string) {
  httpClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

export function clearAuthHeader() {
  delete httpClient.defaults.headers.common['Authorization'];
}

export async function request<
  TResponse = unknown,
  TBody = unknown,
  TQuery = Record<string, unknown>,
  TParams = Record<string, string>,
>(options: RequestOptions<TBody, TQuery, TParams>): Promise<TResponse> {
  const response = await httpClient.request<TResponse>({
    url: options.url,
    method: options.method,
    data: options.body,
    params: options.query,
    ...options.config,
  });

  return response.data;
}

export default httpClient;
