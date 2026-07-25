import type { LucideIcon } from "lucide-react";
import { ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react";
import * as XLSX from "xlsx";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/common/StatusBadge";
import type { AdminBannerListItem } from "@/types/competitionAdmin";

export const AI_LABELS: Record<string, string> = {
  pending: "Pending",
  approved: "AI Approved",
  rejected: "AI Rejected",
  uncertain: "AI Uncertain",
  failed: "AI Uncertain",
};

export const BANNER_STATUS_LABELS: Record<string, string> = {
  in_review: "Pending Manual Review",
  approved: "Approved",
  rejected: "Rejected",
};

export type PriorityLevel = "High" | "Medium" | "Low";

export function getPriority(confidence: number | null): {
  label: PriorityLevel;
  badge: string;
  bar: string;
} {
  if (confidence == null || confidence < 50) {
    return { label: "High", badge: "bg-rose-100 text-rose-700 border-rose-200", bar: "bg-rose-500" };
  }
  if (confidence <= 75) {
    return { label: "Medium", badge: "bg-amber-100 text-amber-700 border-amber-200", bar: "bg-amber-500" };
  }
  return { label: "Low", badge: "bg-emerald-100 text-emerald-700 border-emerald-200", bar: "bg-emerald-500" };
}

/** Human-facing banner code shown across the review screens, e.g. PMM1256. */
export const bannerCode = (id: number) => `PMM${String(1000 + id).padStart(4, "0")}`;

export function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "—";
  return (
    d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) +
    ", " +
    d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })
  );
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

/** Waiting time since upload, e.g. "2h 35m"; anything above 24h is overdue. */
export function getWaiting(uploadedAt: string): { label: string; overdue: boolean } {
  const ms = Date.now() - new Date(uploadedAt).getTime();
  if (isNaN(ms) || ms < 0) return { label: "—", overdue: false };
  const mins = Math.floor(ms / 60000);
  const days = Math.floor(mins / 1440);
  const hours = Math.floor((mins % 1440) / 60);
  const rem = mins % 60;
  const label = days > 0 ? `${days}d ${hours}h` : hours > 0 ? `${hours}h ${rem}m` : `${rem}m`;
  return { label, overdue: ms > 24 * 60 * 60 * 1000 };
}

export function PriorityBadge({ confidence }: { confidence: number | null }) {
  const p = getPriority(confidence);
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold", p.badge)}>
      {p.label}
    </span>
  );
}

export function ConfidenceBar({ value, className }: { value: number | null; className?: string }) {
  const p = getPriority(value);
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-slate-100", className)}>
      <div className={cn("h-full rounded-full transition-all", p.bar)} style={{ width: `${value ?? 0}%` }} />
    </div>
  );
}

export function AiResultBadge({ status }: { status: string }) {
  return <StatusBadge status={AI_LABELS[status] ?? status} />;
}

/** Stat card matching the Figma review dashboards: label, value, sub-line, colored icon tile. */
export function QueueStatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  tone,
  valueTone,
}: {
  title: string;
  value: number | string;
  subtitle: string;
  icon: LucideIcon;
  tone: "blue" | "emerald" | "amber" | "rose" | "purple";
  valueTone?: string;
}) {
  const tones: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    rose: "bg-rose-50 text-rose-600",
    purple: "bg-purple-50 text-purple-600",
  };
  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-semibold text-muted-foreground">{title}</p>
          <p className={cn("mt-1.5 text-2xl font-extrabold text-foreground", valueTone)}>{value}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">{subtitle}</p>
        </div>
        <div className={cn("rounded-lg p-2.5", tones[tone])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

export function BannerThumb({ src, className }: { src: string | null; className?: string }) {
  return src ? (
    <img src={src} alt="" className={cn("h-10 w-10 rounded-md border object-cover", className)} />
  ) : (
    <div className={cn("flex h-10 w-10 items-center justify-center rounded-md border bg-muted text-muted-foreground", className)}>
      <ImageIcon className="h-4 w-4" />
    </div>
  );
}

export function SlotBadge({ slot }: { slot: number }) {
  return (
    <span className="inline-flex rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">
      Banner {slot}
    </span>
  );
}

/** Figma-style table footer: "Showing X to Y of Z entries" + optional rows-per-page + pager. */
export function TableFooter({
  page,
  pageSize,
  total,
  onPageChange,
  pageSizeOptions,
  onPageSizeChange,
  noun = "entries",
}: {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (p: number) => void;
  pageSizeOptions?: number[];
  onPageSizeChange?: (n: number) => void;
  noun?: string;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  const pages: (number | "…")[] = [];
  if (totalPages <= 6) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    for (let i = 1; i <= Math.min(4, totalPages); i++) pages.push(i);
    pages.push("…", totalPages);
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3 text-sm text-muted-foreground">
      <span>
        Showing {from.toLocaleString("en-IN")} to {to.toLocaleString("en-IN")} of {total.toLocaleString("en-IN")} {noun}
      </span>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" className="h-8 w-8" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {pages.map((p, i) =>
            p === "…" ? (
              <span key={`gap-${i}`} className="px-1.5">
                …
              </span>
            ) : (
              <Button
                key={p}
                variant={p === page ? "default" : "outline"}
                size="icon"
                className="h-8 w-8"
                onClick={() => onPageChange(p)}
              >
                {p}
              </Button>
            ),
          )}
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        {onPageSizeChange && (
          <Select value={String(pageSize)} onValueChange={(v) => onPageSizeChange(Number(v))}>
            <SelectTrigger className="h-8 w-[130px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(pageSizeOptions ?? [10, 25, 50]).map((n) => (
                <SelectItem key={n} value={String(n)}>
                  Rows per page {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  );
}

/** Exports plain rows to an .xlsx download. */
export function exportRowsToExcel(fileName: string, rows: Record<string, unknown>[]) {
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Export");
  XLSX.writeFile(wb, fileName);
}

export function bannerExportRow(r: AdminBannerListItem) {
  return {
    ID: bannerCode(r.id),
    Mandal: r.pandal_name,
    Location: [r.area_name, r.district_name].filter(Boolean).join(", "),
    Banner: `Banner ${r.slot}`,
    "File Name": r.file_name ?? "",
    Status: BANNER_STATUS_LABELS[r.status] ?? r.status,
    "AI Result": AI_LABELS[r.ai_status] ?? r.ai_status,
    "AI Confidence": r.ai_confidence != null ? `${r.ai_confidence}%` : "",
    "AI Reasons": r.ai_reasons.join("; "),
    Priority: getPriority(r.ai_confidence).label,
    "Uploaded On": formatDateTime(r.uploaded_at),
  };
}
