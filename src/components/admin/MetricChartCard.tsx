import { SectionCard } from "@/components/admin/SectionCard";

export function MetricChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <SectionCard title={title} className="min-h-[320px]">
      <div className="h-[250px]">{children}</div>
    </SectionCard>
  );
}
