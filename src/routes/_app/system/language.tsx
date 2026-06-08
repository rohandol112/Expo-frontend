import { Outlet, createFileRoute, useLocation, useNavigate } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useState } from "react";
import { AdminListPage } from "@/components/admin/AdminListPage";
import { ActionMenu } from "@/components/common/ActionMenu";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import type { Language } from "@/types/system";
import { ROUTES } from "@/constants/routes.constants";
import type { Column } from "@/components/tables/DataTable";
import { useDeleteLanguage, useLanguages, useUpdateLanguageStatus } from "@/hooks/api/useLanguages";
import { isAuthApiError } from "@/lib/apiError";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/system/language")({ component: LanguagesPage });

function LanguagesPage() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  if (pathname !== ROUTES.SYS_LANGUAGE) return <Outlet />;
  const [deleteTarget, setDeleteTarget] = useState<Language | null>(null);
  const languagesQuery = useLanguages();
  const deleteLanguage = useDeleteLanguage();
  const updateStatus = useUpdateLanguageStatus();
  const rows = languagesQuery.data?.items ?? [];
  const error = languagesQuery.error ? "Unable to load languages from backend." : undefined;
  const columns: Column<Language>[] = [
    { key: "language", header: "Language", cell: (r) => <div><p className="font-medium">{r.name}</p><p className="text-xs text-muted-foreground">{r.nativeName}</p></div> },
    { key: "code", header: "Code", cell: (r) => r.code.toUpperCase() },
    {
      key: "status",
      header: "Status",
      cell: (r) => (
        <div className="flex items-center gap-2">
          <StatusBadge status={r.status} />
          <Switch
            checked={r.status === "Active"}
            disabled={updateStatus.isPending}
            onCheckedChange={async (checked) => {
              try {
                await updateStatus.mutateAsync({ id: r.id, isActive: checked });
                toast.success("Language status updated");
              } catch (err) {
                toast.error(isAuthApiError(err) ? "Backend admin auth is required to update language status." : "Unable to update language status");
              }
            }}
          />
        </div>
      ),
    },
    { key: "count", header: "Content Count", cell: (r) => r.contentCount.toLocaleString() },
    { key: "added", header: "Added On", cell: (r) => r.addedOn },
    {
      key: "actions",
      header: "Actions",
      cell: (r) => (
        <ActionMenu
          onView={() => navigate({ to: "/system/language/$languageId", params: { languageId: r.id } })}
          onEdit={() => navigate({ to: "/system/language/$languageId/edit", params: { languageId: r.id } })}
          onDelete={() => setDeleteTarget(r)}
        />
      ),
    },
  ];
  return (
    <>
    <AdminListPage
      title="All Languages"
      breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "System" }, { label: "All Languages" }]}
      actions={<Button onClick={() => navigate({ to: ROUTES.SYS_LANGUAGE_ADD })}><Plus className="mr-2 h-4 w-4" />Add Language</Button>}
      data={rows}
      columns={columns}
      rowKey={(r) => r.id}
      loading={languagesQuery.isLoading}
      error={error}
      searchPlaceholder="Search language..."
      dropdowns={[{ key: "status", placeholder: "Status", options: ["Active", "Inactive"].map((s) => ({ label: s, value: s })) }]}
      filter={(row, search, df) => {
        const term = search.toLowerCase();
        if (term && !(row.name.toLowerCase().includes(term) || row.code.includes(term))) return false;
        if (df.status && row.status !== df.status) return false;
        return true;
      }}
    />
    <ConfirmDialog
      open={Boolean(deleteTarget)}
      onOpenChange={(open) => !open && setDeleteTarget(null)}
      title="Delete language?"
      description={`This will delete ${deleteTarget?.name ?? "this language"} if the backend allows it.`}
      confirmLabel={deleteLanguage.isPending ? "Deleting..." : "Delete"}
      destructive
      onConfirm={async () => {
        if (!deleteTarget) return;
        try {
          await deleteLanguage.mutateAsync(deleteTarget.id);
          toast.success("Language deleted");
          setDeleteTarget(null);
        } catch (err) {
          toast.error(isAuthApiError(err) ? "Backend admin auth is required to delete language." : "Unable to delete language");
        }
      }}
    />
    </>
  );
}
