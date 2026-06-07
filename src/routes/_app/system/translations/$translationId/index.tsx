import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Edit, Languages } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes.constants";
import { translationRows } from "@/mock/admin-extra.mock";

export const Route = createFileRoute("/_app/system/translations/$translationId/")({ component: TranslationDetailPage });

function TranslationDetailPage() {
  const { translationId } = Route.useParams();
  const navigate = useNavigate();
  const translation = translationRows.find((item) => item.id === translationId) ?? translationRows[0];

  return (
    <div>
      <PageHeader
        title={translation.key}
        breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "Translations", to: ROUTES.SYS_TRANSLATIONS }, { label: "View Translation" }]}
        actions={<Button onClick={() => navigate({ to: "/system/translations/$translationId/edit", params: { translationId } })}><Edit className="mr-2 h-4 w-4" />Edit Translation</Button>}
      />
      <section className="rounded-lg border bg-card p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary"><Languages className="h-5 w-5" /></div>
          <div><p className="font-mono font-semibold">{translation.key}</p><p className="text-sm text-muted-foreground">{translation.group}</p></div>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <Detail label="Group" value={translation.group} />
          <Detail label="Status" value={<StatusBadge status={translation.status} />} />
          <Detail label="English(en)" value={translation.english} />
          <Detail label="Last Updated" value={translation.lastUpdated} />
          <Detail label="Hindi(hi)" value="स्थानीय अनुवाद ड्राफ्ट" />
          <Detail label="Gujarati(gu)" value="સ્થાનિક અનુવાદ ડ્રાફ્ટ" />
        </div>
      </section>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return <div><p className="text-xs font-semibold uppercase text-muted-foreground">{label}</p><div className="mt-1 text-sm font-medium">{value}</div></div>;
}
