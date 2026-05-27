import type { AxiosRequestConfig } from 'axios';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface RequestOptions<
  TBody = unknown,
  TQuery = Record<string, unknown>,
  TParams = Record<string, string>,
> {
  url: string;
  method: HttpMethod;
  body?: TBody;
  query?: TQuery;
  params?: TParams;
  config?: AxiosRequestConfig;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
