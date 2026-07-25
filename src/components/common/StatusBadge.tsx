import { cn } from "@/lib/utils";
import type { NewsStatus } from "@/types/news";

const STYLES: Record<string, string> = {
  Published: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Pending: "bg-amber-50 text-amber-700 border-amber-200",
  Draft: "bg-blue-50 text-blue-700 border-blue-200",
  "In Review": "bg-blue-50 text-blue-700 border-blue-200",
  Scheduled: "bg-violet-50 text-violet-700 border-violet-200",
  Rejected: "bg-rose-50 text-rose-700 border-rose-200",
  Failed: "bg-rose-50 text-rose-700 border-rose-200",
  Inactive: "bg-slate-100 text-slate-700 border-slate-200",
  Paused: "bg-amber-50 text-amber-700 border-amber-200",
  Resolved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  "In Progress": "bg-amber-50 text-amber-700 border-amber-200",
  "Awaiting Action": "bg-orange-50 text-orange-700 border-orange-200",
  "AI Approved": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "AI Uncertain": "bg-amber-50 text-amber-700 border-amber-200",
  "AI Rejected": "bg-rose-50 text-rose-700 border-rose-200",
  "Pending Manual Review": "bg-orange-50 text-orange-700 border-orange-200",
  Wrong: "bg-rose-50 text-rose-700 border-rose-200",
};

const VARIANT_STYLES: Record<string, string> = {
  green: "bg-emerald-50 text-emerald-700 border-emerald-200",
  emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rose: "bg-rose-50 text-rose-700 border-rose-200",
  red: "bg-rose-50 text-rose-700 border-rose-200",
  amber: "bg-amber-50 text-amber-700 border-amber-200",
  blue: "bg-blue-50 text-blue-700 border-blue-200",
  purple: "bg-purple-50 text-purple-700 border-purple-200",
  slate: "bg-slate-100 text-slate-700 border-slate-200",
};

export function StatusBadge({ status, variant }: { status: NewsStatus | string; variant?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        (variant && VARIANT_STYLES[variant]) ?? STYLES[status] ?? "bg-slate-100 text-slate-700 border-slate-200",
      )}
    >
      {status}
    </span>
  );
}

const CATEGORY_STYLES: Record<string, string> = {
  Politics: "bg-rose-50 text-rose-600",
  Sports: "bg-emerald-50 text-emerald-600",
  Business: "bg-violet-50 text-violet-600",
  Technology: "bg-blue-50 text-blue-600",
  Weather: "bg-sky-50 text-sky-600",
  Entertainment: "bg-pink-50 text-pink-600",
  Health: "bg-teal-50 text-teal-600",
  International: "bg-indigo-50 text-indigo-600",
  Religion: "bg-amber-50 text-amber-600",
};

export function CategoryBadge({ category }: { category: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium",
        CATEGORY_STYLES[category] ?? "bg-slate-100 text-slate-700",
      )}
    >
      {category}
    </span>
  );
}
