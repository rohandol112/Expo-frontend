export class ApiError extends Error {
  status: number;
  code?: string | null;
  data?: unknown;

  constructor(message: string, options: { status?: number; code?: string | null; data?: unknown } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = options.status ?? 0;
    this.code = options.code;
    this.data = options.data;
  }
}

export function isAuthApiError(error: unknown) {
  return (
    error instanceof ApiError &&
    (error.status === 401 ||
      error.status === 403 ||
      error.code === "tokenMissing" ||
      error.code === "tokenInvalid" ||
      error.code === "forbidden")
  );
}
