import { Outlet, createFileRoute, useLocation, useNavigate } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { AdminListPage } from "@/components/admin/AdminListPage";
import { ActionMenu } from "@/components/common/ActionMenu";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import type { DistrictItem } from "@/types/location";
import type { Column } from "@/components/tables/DataTable";
import { ROUTES } from "@/constants/routes.constants";
import { useDeleteDistrict, useDistricts, useStates, useUpdateDistrictStatus, locationKeys } from "@/hooks/api/useLocations";
import { useLanguages } from "@/hooks/api/useLanguages";
import { toast } from "sonner";
import { useQueries } from "@tanstack/react-query";
import { locationService } from "@/services/location.service";

export const Route = createFileRoute("/_app/system/location/districts")({
  validateSearch: (search: Record<string, unknown>) => ({
    language_code: typeof search.language_code === "string" && search.language_code ? search.language_code : undefined,
  }),
  component: DistrictsPage,
});

function formatDateTime(value?: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function DistrictsPage() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { language_code } = Route.useSearch();
  if (pathname !== ROUTES.SYS_DISTRICTS) return <Outlet />;
  const [deleteTarget, setDeleteTarget] = useState<DistrictItem | null>(null);
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
      queryKey: locationKeys.states({ language_code: lang, per_page: 100 }),
      queryFn: () => locationService.listStates({ language_code: lang, per_page: 100 }),
      retry: false,
      enabled: languagesQuery.isSuccess,
    })),
  });

  const districtsQueries = useQueries({
    queries: languagesToQuery.map((lang) => ({
      queryKey: locationKeys.districts({ language_code: lang, per_page: 100 }),
      queryFn: () => locationService.listDistricts({ language_code: lang, per_page: 100 }),
      retry: false,
      enabled: languagesQuery.isSuccess,
    })),
  });

  const updateStatus = useUpdateDistrictStatus();
  const deleteDistrict = useDeleteDistrict();
  const states = statesQueries.flatMap((q) => q.data?.items ?? []);
  const stateNameById = new Map(states.map((state) => [state.id, state.name]));
  const rows: DistrictItem[] = districtsQueries.flatMap((q) => q.data?.items ?? []).map((district) => ({
    id: String(district.id),
    language: district.language_code,
    name: district.name,
    state: stateNameById.get(district.state_id) ?? `State #${district.state_id}`,
    status: district.is_active ? "Active" : "Inactive",
    addedOn: formatDateTime(district.created_at),
  }));
  const isLoading = statesQueries.some((q) => q.isLoading) || districtsQueries.some((q) => q.isLoading) || languagesQuery.isLoading;
  const isError = statesQueries.some((q) => q.isError) || districtsQueries.some((q) => q.isError);
  const handleStatusToggle = (row: DistrictItem) => {
    updateStatus.mutate(
      { id: row.id, isActive: row.status !== "Active" },
      {
        onSuccess: () => toast.success("District status updated."),
        onError: (error) => toast.error(error instanceof Error ? error.message : "Unable to update district status."),
      },
    );
  };
  const columns: Column<DistrictItem>[] = [
    { key: "language", header: "Language", cell: (r) => r.language.toUpperCase() },
    { key: "name", header: "District Name", cell: (r) => <span className="font-medium">{r.name}</span> },
    { key: "state", header: "State", cell: (r) => r.state },
    { key: "status", header: "Status", cell: (r) => <StatusBadge status={r.status} /> },
    { key: "added", header: "Added On", cell: (r) => r.addedOn },
    {
      key: "actions",
      header: "Actions",
      cell: (row) => (
        <ActionMenu
          onEdit={() => navigate({ to: "/system/location/districts/$districtId/edit", params: { districtId: row.id } })}
          onDelete={() => setDeleteTarget(row)}
          extraItems={[{ label: row.status === "Active" ? "Mark Inactive" : "Mark Active", onClick: () => handleStatusToggle(row) }]}
        />
      ),
    },
  ];
  return (
    <>
      <AdminListPage title="Districts" breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "Locations", to: ROUTES.SYS_LOCATION }, { label: "Districts" }]} actions={<Button onClick={() => navigate({ to: ROUTES.SYS_DISTRICTS_ADD, search: { language_code: selectedLanguage } })}><Plus className="mr-2 h-4 w-4" />Add District</Button>} data={rows} columns={columns} rowKey={(r) => r.id} loading={isLoading} error={isError ? "Unable to load districts from backend." : undefined} searchPlaceholder="Search district..." initialDropdownValues={{ language: selectedLanguage }} dropdowns={[{ key: "language", placeholder: "Language", options: (languagesQuery.data?.items ?? []).map((l) => ({ label: l.name, value: l.code })) }, { key: "state", placeholder: "State", options: states.map((s) => ({ label: s.name, value: s.name })) }, { key: "status", placeholder: "Status", options: ["Active", "Inactive"].map((s) => ({ label: s, value: s })) }]} filter={(row, search, df) => {
      const term = search.toLowerCase();
      if (term && !(row.name.toLowerCase().includes(term) || row.state.toLowerCase().includes(term))) return false;
      if (df.language && row.language !== df.language) return false;
      if (df.state && row.state !== df.state) return false;
      if (df.status && row.status !== df.status) return false;
      return true;
    }} onFiltersChange={({ dropdownValues }) => {
      const nextLanguage = dropdownValues.language;
      if (nextLanguage !== selectedLanguage) {
        setSelectedLanguage(nextLanguage);
        navigate({ to: ROUTES.SYS_DISTRICTS, search: { language_code: nextLanguage }, replace: true });
      }
    }} />
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete district?"
        description={`This will delete ${deleteTarget?.name ?? "this district"} from the backend.`}
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteDistrict.mutate(deleteTarget.id, {
            onSuccess: () => {
              toast.success("District deleted.");
              setDeleteTarget(null);
            },
            onError: (error) => toast.error(error instanceof Error ? error.message : "Unable to delete district."),
          });
        }}
      />
    </>
  );
}
