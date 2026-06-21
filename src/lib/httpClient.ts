import { API_BASE_URL } from "./apiEndpoints";
import { ApiError } from "./apiError";
import { isApiEnvelope } from "./apiResponse";
import { ADMIN_TOKEN_STORAGE_KEY, AUTH_STORAGE_KEY, useAuthStore } from "@/store/useAuthStore";

export interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

function buildUrl(path: string, params?: RequestOptions["params"]) {
  const url = new URL(
    path.startsWith("http") ? path : `${API_BASE_URL}${path}`,
    typeof window !== "undefined" ? window.location.origin : "http://localhost",
  );
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    });
  }
  return url.toString();
}

function getStoredToken() {
  const storeToken = useAuthStore.getState().token;
  if (storeToken) return storeToken;
  if (typeof window === "undefined") return null;

  try {
    const manualToken = window.localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY);
    if (manualToken) return manualToken;

    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { state?: { token?: string | null } };
    return parsed.state?.token ?? null;
  } catch {
    return null;
  }
}

async function parseResponse(res: Response) {
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) return res.json();
  const text = await res.text();
  return text || null;
}

async function request<T>(method: string, path: string, opts: RequestOptions = {}): Promise<T> {
  const { params, headers, body, ...rest } = opts;
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  const token = getStoredToken();
  const requestHeaders = new Headers(headers);

  if (!isFormData && body !== undefined && !requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }
  if (token && !requestHeaders.has("Authorization")) {
    requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  let res: Response;
  try {
    res = await fetch(buildUrl(path, params), {
      method,
      headers: requestHeaders,
      body: body instanceof FormData || typeof body === "string" ? body : body !== undefined ? JSON.stringify(body) : undefined,
      ...rest,
    });
  } catch (error) {
    throw new ApiError("Unable to reach backend. Please check API URL, HTTPS/CORS, or network availability.", {
      status: 0,
      code: "networkError",
      data: error instanceof Error ? { message: error.message } : undefined,
    });
  }

  const payload = await parseResponse(res);
  if (isApiEnvelope(payload)) {
    if (!payload.success) {
      const error = new ApiError(payload.message || "Request failed", {
        status: res.status,
        code: payload.code,
        data: payload.data,
      });
      throw error;
    }
    return payload.data as T;
  }

  if (!res.ok) {
    const error = new ApiError(typeof payload === "string" ? payload : `Request failed: ${res.status}`, {
      status: res.status,
      data: payload,
    });
    throw error;
  }

  return payload as T;
}

export const httpClient = {
  get: <T,>(path: string, opts?: RequestOptions) => request<T>("GET", path, opts),
  post: <T,>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>("POST", path, { ...opts, body: body as BodyInit }),
  put: <T,>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>("PUT", path, { ...opts, body: body as BodyInit }),
  patch: <T,>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>("PATCH", path, { ...opts, body: body as BodyInit }),
  delete: <T,>(path: string, opts?: RequestOptions) => request<T>("DELETE", path, opts),
};
