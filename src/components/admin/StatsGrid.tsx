import { StatsCard, type StatsVariant } from "@/components/common/StatsCard";
import type { LucideIcon } from "lucide-react";

export interface StatItem {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: StatsVariant;
}

export function StatsGrid({ items }: { items: StatItem[] }) {
  return (
    <div className="mb-6 grid grid-cols-2 gap-4 xl:grid-cols-4 2xl:grid-cols-5">
      {items.map((item) => (
        <StatsCard key={item.title} {...item} />
      ))}
    </div>
  );
}
