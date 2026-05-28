import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { AdminListPage } from "@/components/admin/AdminListPage";
import { ActionMenu } from "@/components/common/ActionMenu";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { languages } from "@/mock/system.mock";
import type { Language } from "@/types/system";
import { ROUTES } from "@/constants/routes.constants";
import type { Column } from "@/components/tables/DataTable";

export const Route = createFileRoute("/_app/system/language")({ component: LanguagesPage });

function LanguagesPage() {
  const navigate = useNavigate();
  const columns: Column<Language>[] = [
    { key: "language", header: "Language", cell: (r) => <div><p className="font-medium">{r.name}</p><p className="text-xs text-muted-foreground">{r.nativeName}</p></div> },
    { key: "code", header: "Code", cell: (r) => r.code.toUpperCase() },
    { key: "status", header: "Status", cell: (r) => <StatusBadge status={r.status} /> },
    { key: "count", header: "Content Count", cell: (r) => r.contentCount.toLocaleString() },
    { key: "added", header: "Added On", cell: (r) => r.addedOn },
    { key: "actions", header: "Actions", cell: () => <ActionMenu /> },
  ];
  return (
    <AdminListPage
      title="All Languages"
      breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "System" }, { label: "All Languages" }]}
      actions={<Button onClick={() => navigate({ to: ROUTES.SYS_LANGUAGE_ADD })}><Plus className="mr-2 h-4 w-4" />Add Language</Button>}
      data={languages}
      columns={columns}
      rowKey={(r) => r.id}
      searchPlaceholder="Search language..."
      dropdowns={[{ key: "status", placeholder: "Status", options: ["Active", "Inactive"].map((s) => ({ label: s, value: s })) }]}
      filter={(row, search) => row.name.toLowerCase().includes(search.toLowerCase()) || row.code.includes(search.toLowerCase())}
    />
  );
}
