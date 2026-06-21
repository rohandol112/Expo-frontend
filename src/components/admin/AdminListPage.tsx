import { useEffect, useMemo, useState } from "react";
import { PageHeader, type Crumb } from "@/components/common/PageHeader";
import { FilterBar, type FilterDropdown } from "@/components/common/FilterBar";
import { DataTable, type Column } from "@/components/tables/DataTable";
import { StatsGrid, type StatItem } from "@/components/admin/StatsGrid";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

const ALL_VALUE = "__all__";

export interface AdminListQuery {
  search: string;
  page: number;
  dropdownValues: Record<string, string>;
}

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
  serverSide = false,
  total,
  pageSize = 10,
  page: controlledPage,
  onPageChange: controlledOnPageChange,
  onQueryChange,
  searchDebounceMs = 300,
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
  /** When true, `data` is already the current page from the backend (search/filter/pagination all server-side). */
  serverSide?: boolean;
  /** Real total row count from the backend. Required when serverSide is true. */
  total?: number;
  pageSize?: number;
  page?: number;
  onPageChange?: (page: number) => void;
  /** Fires (debounced for search) whenever search/page/dropdowns change - wire this to refetch from the API. */
  onQueryChange?: (query: AdminListQuery) => void;
  searchDebounceMs?: number;
}) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, searchDebounceMs);
  const [internalPage, setInternalPage] = useState(1);
  const [dropdownValues, setDropdownValues] = useState<Record<string, string>>({});

  const page = controlledPage ?? internalPage;
  const setPage = controlledOnPageChange ?? setInternalPage;

  const activeDropdownValues = useMemo(() => {
    const out: Record<string, string> = {};
    for (const [key, value] of Object.entries(dropdownValues)) {
      if (value && value !== ALL_VALUE) out[key] = value;
    }
    return out;
  }, [dropdownValues]);

  useEffect(() => {
    if (!onQueryChange) return;
    onQueryChange({ search: debouncedSearch, page, dropdownValues: activeDropdownValues });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, page, activeDropdownValues]);

  const wiredDropdowns: FilterDropdown[] = useMemo(
    () =>
      dropdowns.map((d) => ({
        ...d,
        options: [{ label: `All ${d.placeholder}`, value: ALL_VALUE }, ...d.options],
        value: dropdownValues[d.key] ?? ALL_VALUE,
        onChange: (value: string) => {
          setDropdownValues((prev) => ({ ...prev, [d.key]: value }));
          setPage(1);
        },
      })),
    [dropdowns, dropdownValues],
  );

  const filtered = useMemo(() => {
    if (serverSide) return data;
    return data.filter((row) => (filter ? filter(row, debouncedSearch, activeDropdownValues) : true));
  }, [data, filter, debouncedSearch, activeDropdownValues, serverSide]);

  return (
    <div>
      <PageHeader title={title} breadcrumbs={breadcrumbs} actions={actions} />
      {stats && <StatsGrid items={stats} />}
      <FilterBar
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        searchPlaceholder={searchPlaceholder}
        dropdowns={wiredDropdowns}
        showDateRange={showDateRange}
        onReset={() => {
          setSearch("");
          setDropdownValues({});
          setPage(1);
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
        total={serverSide ? total ?? data.length : filtered.length}
        onPageChange={setPage}
        serverPaged={serverSide}
      />
    </div>
  );
}
