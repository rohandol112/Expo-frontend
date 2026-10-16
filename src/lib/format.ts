import type { AdminStatus } from "@/types/system";

const dateFormat = new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });
const dateTimeFormat = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Kolkata",
});

/** "15 Oct 2026" for an ISO instant or a YYYY-MM-DD date; "" when missing. */
export function formatDate(value: string | null | undefined): string {
  if (!value) return "";
  const date = new Date(/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00+05:30` : value);
  return Number.isNaN(date.getTime()) ? value : dateFormat.format(date);
}

/** "15 Oct 2026, 02:30 pm" in IST; "" when missing. */
export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : dateTimeFormat.format(date);
}

/** Today in IST as YYYY-MM-DD (the reward module's calendar). */
export function istToday(): string {
  return new Date(Date.now() + 5.5 * 3600_000).toISOString().slice(0, 10);
}

/** The current IST month as YYYY-MM. */
export function istMonth(): string {
  return istToday().slice(0, 7);
}

export function toAdminStatus(status: string | null | undefined): AdminStatus {
  return status === "active" ? "Active" : "Inactive";
}

export function toApiStatus(status: AdminStatus | string): "active" | "inactive" {
  return status === "Active" ? "active" : "inactive";
}

/** Upper-cases the first letter: "pending" → "Pending". */
export function capitalize(value: string): string {
  return value ? value[0].toUpperCase() + value.slice(1) : value;
}
