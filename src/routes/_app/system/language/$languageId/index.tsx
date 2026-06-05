import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Edit, FileText, Languages, Type } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatsCard } from "@/components/common/StatsCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes.constants";
import { useLanguage } from "@/hooks/api/useLanguages";

export const Route = createFileRoute("/_app/system/language/$languageId/")({ component: LanguageDetailPage });

function LanguageDetailPage() {
  const { languageId } = Route.useParams();
  const navigate = useNavigate();
  const languageQuery = useLanguage(languageId);
  const language = languageQuery.data;

  return (
    <div>
      <PageHeader
        title={language?.name ?? "Language Details"}
        breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "Languages", to: ROUTES.SYS_LANGUAGE }, { label: "Details" }]}
        actions={<Button onClick={() => navigate({ to: "/system/language/$languageId/edit", params: { languageId } })}><Edit className="mr-2 h-4 w-4" />Edit Language</Button>}
      />
      {languageQuery.error && <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">Unable to load language from backend.</div>}
      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard title="Language Code" value={language?.code?.toUpperCase() ?? "—"} icon={Languages} variant="blue" />
        <StatsCard title="Direction" value={language?.direction ?? "—"} icon={Type} variant="amber" />
        <StatsCard title="Content Count" value={(language?.contentCount ?? 0).toLocaleString()} icon={FileText} variant="green" />
      </div>
      <div className="mt-6 rounded-lg border bg-card p-6">
        <dl className="grid gap-4 md:grid-cols-2">
          <Detail label="Language Name" value={language?.name} />
          <Detail label="Native Name" value={language?.nativeName} />
          <Detail label="Code" value={language?.code} />
          <div><dt className="text-xs font-medium uppercase text-muted-foreground">Status</dt><dd className="mt-1">{language && <StatusBadge status={language.status} />}</dd></div>
          <Detail label="Added On" value={language?.addedOn} />
        </dl>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value?: string | number }) {
  return <div><dt className="text-xs font-medium uppercase text-muted-foreground">{label}</dt><dd className="mt-1 text-sm font-medium">{value || "—"}</dd></div>;
}
