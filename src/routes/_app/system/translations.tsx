import { createFileRoute, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { Download, FileUp, Languages, Plus, Search, AlertTriangle, Clock } from "lucide-react";
import { ActionMenu } from "@/components/common/ActionMenu";
import { PageHeader } from "@/components/common/PageHeader";
import { StatsCard } from "@/components/common/StatsCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable, type Column } from "@/components/tables/DataTable";
import { ROUTES } from "@/constants/routes.constants";
import { translationRows, type TranslationRow } from "@/mock/admin-extra.mock";

export const Route = createFileRoute("/_app/system/translations")({ component: TranslationsPage });

function TranslationsPage() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  if (pathname !== ROUTES.SYS_TRANSLATIONS) return <Outlet />;

  const columns: Column<TranslationRow>[] = [
    { key: "key", header: "Translation Key", cell: (row) => <span className="font-mono text-sm font-medium">{row.key}</span> },
    { key: "group", header: "Group", cell: (row) => row.group },
    { key: "english", header: "English(en)", cell: (row) => row.english },
    { key: "status", header: "Status", cell: (row) => <StatusBadge status={row.status} /> },
    { key: "lastUpdated", header: "Last Updated", cell: (row) => row.lastUpdated },
    {
      key: "actions",
      header: "Action",
      cell: (row) => (
        <ActionMenu
          onView={() => navigate({ to: "/system/translations/$translationId", params: { translationId: row.id } })}
          onEdit={() => navigate({ to: "/system/translations/$translationId/edit", params: { translationId: row.id } })}
          extraItems={[{ label: "Translate" }, { label: "History" }]}
        />
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Translation Management"
        breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "System Management" }, { label: "Translations" }]}
        actions={<><Button><Plus className="mr-2 h-4 w-4" />Add Translation</Button><Button variant="outline"><FileUp className="mr-2 h-4 w-4" />Import</Button><Button variant="outline"><Download className="mr-2 h-4 w-4" />Export</Button></>}
      />
      <p className="mb-5 text-sm text-muted-foreground">Manage all application text, labels, notifications and messages in multiple languages.</p>
      <div className="mb-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard title="Total Languages" value="8" icon={Languages} variant="blue" />
        <StatsCard title="Translation Keys" value="1,264" icon={Search} variant="green" />
        <StatsCard title="Missing Translations" value="86" icon={AlertTriangle} variant="rose" />
        <StatsCard title="Last Updated" value="Today" icon={Clock} variant="amber" />
      </div>
      <div className="mb-4 grid gap-3 rounded-lg border bg-card p-4 md:grid-cols-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search Key" />
        </div>
        {["Translation Group", "Language", "Status"].map((filter) => <FilterSelect key={filter} label={filter} />)}
      </div>
      <div className="mb-4 flex gap-2 border-b">
        {["All Translation Keys", "API Translation", "Message Translation"].map((tab, index) => <button key={tab} className={`px-3 py-2 text-sm font-medium ${index === 0 ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}>{tab}</button>)}
      </div>
      <DataTable columns={columns} data={translationRows} rowKey={(row) => row.id} pageSize={10} total={translationRows.length} />
    </div>
  );
}

function FilterSelect({ label }: { label: string }) {
  return <Select><SelectTrigger><SelectValue placeholder={label} /></SelectTrigger><SelectContent><SelectItem value="all">All</SelectItem><SelectItem value="complete">Complete</SelectItem></SelectContent></Select>;
}
