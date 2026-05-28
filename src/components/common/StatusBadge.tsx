import { cn } from "@/lib/utils";
import type { NewsStatus } from "@/types/news";

const STYLES: Record<string, string> = {
  Published: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Pending: "bg-amber-50 text-amber-700 border-amber-200",
  Draft: "bg-slate-100 text-slate-700 border-slate-200",
  Scheduled: "bg-violet-50 text-violet-700 border-violet-200",
  Rejected: "bg-rose-50 text-rose-700 border-rose-200",
};

export function StatusBadge({ status }: { status: NewsStatus | string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        STYLES[status] ?? "bg-slate-100 text-slate-700 border-slate-200",
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