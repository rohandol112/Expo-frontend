import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

const VARIANTS = {
  red: "bg-red-50 text-red-600",
  green: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-600",
  rose: "bg-rose-50 text-rose-600",
  blue: "bg-blue-50 text-blue-600",
  violet: "bg-violet-50 text-violet-600",
  pink: "bg-pink-50 text-pink-600",
} as const;

export type StatsVariant = keyof typeof VARIANTS;

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = "red",
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: StatsVariant;
}) {
  return (
    <Card className="p-5 flex items-center gap-4">
      <div className={cn("flex h-12 w-12 items-center justify-center rounded-lg", VARIANTS[variant])}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-2xl font-semibold leading-tight">{value}</p>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
    </Card>
  );
}