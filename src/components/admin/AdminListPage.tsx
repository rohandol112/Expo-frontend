import { useEffect, useMemo, useState } from "react";
import { PageHeader, type Crumb } from "@/components/common/PageHeader";
import { FilterBar, type FilterDropdown } from "@/components/common/FilterBar";
import { DataTable, type Column } from "@/components/tables/DataTable";
import { StatsGrid, type StatItem } from "@/components/admin/StatsGrid";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

const ALL_VALUE = "__all__";

export function AdminListPage<T>({
  title,
  breadcrumbs,
  actions,
  stats,
  data,
  columns,
  rowKey,
  searchPlaceholder,
  dropdowns = [],
  showDateRange = false,
  filter,
  loading = false,
  error,
  page: controlledPage,
  pageSize = 10,
  total,
  onPageChange,
  manualPagination = false,
  onFiltersChange,
}: {
  title: string;
  breadcrumbs: Crumb[];
  actions?: React.ReactNode;
  stats?: StatItem[];
  data: T[];
  columns: Column<T>[];
  rowKey: (row: T) => string;
  searchPlaceholder?: string;
  dropdowns?: FilterDropdown[];
  showDateRange?: boolean;
  filter?: (row: T, search: string, dropdownValues: Record<string, string>) => boolean;
  loading?: boolean;
  error?: React.ReactNode;
  page?: number;
  pageSize?: number;
  total?: number;
  onPageChange?: (page: number) => void;
  manualPagination?: boolean;
  onFiltersChange?: (filters: { search: string; dropdownValues: Record<string, string> }) => void;
}) {
  const [search, setSearch] = useState("");
  const [internalPage, setInternalPage] = useState(1);
  const [dropdownValues, setDropdownValues] = useState<Record<string, string>>({});
  const debouncedSearch = useDebouncedValue(search);
  const page = controlledPage ?? internalPage;
  const updatePage = onPageChange ?? setInternalPage;

  const activeDropdownValues = useMemo(() => {
    const out: Record<string, string> = {};
    for (const [key, value] of Object.entries(dropdownValues)) {
      if (value && value !== ALL_VALUE) out[key] = value;
    }
    return out;
  }, [dropdownValues]);

  const wiredDropdowns: FilterDropdown[] = useMemo(
    () =>
      dropdowns.map((d) => ({
        ...d,
        options: [{ label: `All ${d.placeholder}`, value: ALL_VALUE }, ...d.options],
        value: dropdownValues[d.key] ?? ALL_VALUE,
        onChange: (value: string) => {
          setDropdownValues((prev) => ({ ...prev, [d.key]: value }));
          updatePage(1);
        },
      })),
    [dropdowns, dropdownValues, updatePage],
  );

  useEffect(() => {
    onFiltersChange?.({ search: debouncedSearch, dropdownValues: activeDropdownValues });
  }, [activeDropdownValues, debouncedSearch, onFiltersChange]);

  const filtered = useMemo(
    () => (manualPagination ? data : data.filter((row) => (filter ? filter(row, debouncedSearch, activeDropdownValues) : true))),
    [data, filter, debouncedSearch, activeDropdownValues, manualPagination],
  );

  return (
    <div>
      <PageHeader title={title} breadcrumbs={breadcrumbs} actions={actions} />
      {stats && <StatsGrid items={stats} />}
      <FilterBar
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          updatePage(1);
        }}
        searchPlaceholder={searchPlaceholder}
        dropdowns={wiredDropdowns}
        showDateRange={showDateRange}
        onReset={() => {
          setSearch("");
          setDropdownValues({});
          updatePage(1);
        }}
      />
      {error && <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</div>}
      <DataTable
        columns={columns}
        data={filtered}
        rowKey={rowKey}
        loading={loading}
        page={page}
        pageSize={pageSize}
        total={manualPagination ? total : filtered.length}
        onPageChange={updatePage}
        manualPagination={manualPagination}
      />
    </div>
  );
}
