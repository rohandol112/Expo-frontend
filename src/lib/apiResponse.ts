export interface ApiEnvelope<T = unknown> {
  success: boolean;
  message?: string;
  code?: string | null;
  data?: T;
}

export function isApiEnvelope(value: unknown): value is ApiEnvelope {
  return Boolean(value && typeof value === "object" && "success" in value);
}
