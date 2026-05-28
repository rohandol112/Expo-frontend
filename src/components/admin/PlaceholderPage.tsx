import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { SectionCard } from "@/components/admin/SectionCard";
import { ROUTES } from "@/constants/routes.constants";

export function PlaceholderPage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <PageHeader
        title={title}
        breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: title }]}
      />
      <SectionCard>
        <EmptyState title={`${title} coming soon`} description={description} />
      </SectionCard>
    </div>
  );
}
