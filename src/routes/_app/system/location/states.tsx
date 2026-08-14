import { Outlet, createFileRoute, useLocation, useNavigate } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { AdminListPage } from "@/components/admin/AdminListPage";
import { ActionMenu } from "@/components/common/ActionMenu";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import type { StateItem } from "@/types/location";
import type { Column } from "@/components/tables/DataTable";
import { ROUTES } from "@/constants/routes.constants";
import { useDeleteState, useStates, useUpdateStateStatus, locationKeys } from "@/hooks/api/useLocations";
import { useLanguages } from "@/hooks/api/useLanguages";
import { toast } from "sonner";
import { useQueries } from "@tanstack/react-query";
import { locationService } from "@/services/location.service";

export const Route = createFileRoute("/_app/system/location/states")({
  validateSearch: (search: Record<string, unknown>) => ({
    language_code: typeof search.language_code === "string" && search.language_code ? search.language_code : undefined,
  }),
  component: StatesPage,
});

function formatDateTime(value?: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function StatesPage() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { language_code } = Route.useSearch();
  if (pathname !== ROUTES.SYS_STATES) return <Outlet />;
  const [deleteTarget, setDeleteTarget] = useState<StateItem | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState(language_code);
  useEffect(() => {
    setSelectedLanguage(language_code);
  }, [language_code]);
  const languagesQuery = useLanguages();
  const activeLanguages = (languagesQuery.data?.items ?? [])
    .filter((l) => l.status === "Active")
    .map((l) => l.code);
  const languagesToQuery = selectedLanguage ? [selectedLanguage] : activeLanguages;

  const statesQueries = useQueries({
    queries: languagesToQuery.map((lang) => ({
      queryKey: locationKeys.states({ language_code: lang, per_page: 2000 }),
      queryFn: () => locationService.listStates({ language_code: lang, per_page: 2000 }),
      retry: false,
      enabled: languagesQuery.isSuccess,
    })),
  });

  const updateStatus = useUpdateStateStatus();
  const deleteState = useDeleteState();
  const rows: StateItem[] = statesQueries.flatMap((q) => (q.data?.items ?? [])).map((state) => ({
    id: String(state.id),
    language: state.language_code,
    name: state.name,
    code: state.code,
    status: state.is_active ? "Active" : "Inactive",
    addedOn: formatDateTime(state.created_at),
    imageUrl: state.image_url ?? null,
  }));
  const isLoading = statesQueries.some((q) => q.isLoading) || languagesQuery.isLoading;
  const isError = statesQueries.some((q) => q.isError);
  const handleStatusToggle = (row: StateItem) => {
    updateStatus.mutate(
      { id: row.id, isActive: row.status !== "Active" },
      {
        onSuccess: () => toast.success("State status updated."),
        onError: (error) => toast.error(error instanceof Error ? error.message : "Unable to update state status."),
      },
    );
  };
  const columns: Column<StateItem>[] = [
    {
      key: "language",
      header: "Language",
      cell: (r) => {
        const langObj = languagesQuery.data?.items?.find((l) => l.code === r.language);
        return <span className="text-sm font-medium">{langObj?.name ?? r.language.toUpperCase()}</span>;
      },
    },
    {
      key: "image",
      header: "Flag",
      cell: (r) =>
        r.imageUrl ? (
          <img src={r.imageUrl} alt="" className="h-8 w-8 rounded object-cover" />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded bg-muted text-[10px] text-muted-foreground">—</div>
        ),
    },
    { key: "name", header: "State Name", cell: (r) => <span className="font-medium">{r.name}</span> },
    { key: "code", header: "State Code", cell: (r) => r.code },
    { key: "status", header: "Status", cell: (r) => <StatusBadge status={r.status} /> },
    { key: "added", header: "Added On", cell: (r) => r.addedOn },
    {
      key: "actions",
      header: "Actions",
      cell: (row) => (
        <ActionMenu
          onEdit={() => navigate({ to: "/system/location/states/$stateId/edit", params: { stateId: row.id }, search: { language_code: selectedLanguage } })}
          onDelete={() => setDeleteTarget(row)}
          extraItems={[{ label: row.status === "Active" ? "Mark Inactive" : "Mark Active", onClick: () => handleStatusToggle(row) }]}
        />
      ),
    },
  ];
  return (
    <>
      <AdminListPage title="States" breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "Locations", to: ROUTES.SYS_LOCATION }, { label: "States" }]} actions={<Button onClick={() => navigate({ to: ROUTES.SYS_STATES_ADD, search: { language_code: selectedLanguage } })}><Plus className="mr-2 h-4 w-4" />Add State</Button>} data={rows} columns={columns} rowKey={(r) => r.id} loading={isLoading} error={isError ? "Unable to load states from backend." : undefined} searchPlaceholder="Search state..." initialDropdownValues={{ language: selectedLanguage }} dropdowns={[{ key: "language", placeholder: "Language", options: (languagesQuery.data?.items ?? []).map((l) => ({ label: l.name, value: l.code })) }, { key: "status", placeholder: "Status", options: ["Active", "Inactive"].map((s) => ({ label: s, value: s })) }]} filter={(row, search, df) => {
      const term = search.toLowerCase();
      if (term && !(row.name.toLowerCase().includes(term) || row.code.toLowerCase().includes(term))) return false;
      if (df.language && row.language !== df.language) return false;
      if (df.status && row.status !== df.status) return false;
      return true;
    }} onFiltersChange={({ dropdownValues }) => {
      const nextLanguage = dropdownValues.language;
      if (nextLanguage !== selectedLanguage) {
        setSelectedLanguage(nextLanguage);
        navigate({ to: ROUTES.SYS_STATES, search: { language_code: nextLanguage }, replace: true });
      }
    }} />
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete state?"
        description={`This will delete ${deleteTarget?.name ?? "this state"} from the backend.`}
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteState.mutate(deleteTarget.id, {
            onSuccess: () => {
              toast.success("State deleted.");
              setDeleteTarget(null);
            },
            onError: (error) => toast.error(error instanceof Error ? error.message : "Unable to delete state."),
          });
        }}
      />
    </>
  );
}
