import { useEffect, useMemo, useRef, useState } from "react";
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

type FilterState = {
  search: string;
  dropdownValues: Record<string, string>;
};

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
  onPageChange,
  onQueryChange,
  onFiltersChange,
  searchDebounceMs = 300,
  initialDropdownValues,
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
  serverSide?: boolean;
  total?: number;
  pageSize?: number;
  page?: number;
  onPageChange?: (page: number) => void;
  onQueryChange?: (query: AdminListQuery) => void;
  onFiltersChange?: (filters: FilterState) => void;
  searchDebounceMs?: number;
  initialDropdownValues?: Record<string, string>;
}) {
  const [search, setSearch] = useState("");
  const [internalPage, setInternalPage] = useState(1);
  const [dropdownValues, setDropdownValues] = useState<Record<string, string>>(initialDropdownValues ?? {});
  const debouncedSearch = useDebouncedValue(search, searchDebounceMs);
  const page = controlledPage ?? internalPage;
  const setPage = onPageChange ?? setInternalPage;

  const initialValuesStr = JSON.stringify(initialDropdownValues);
  useEffect(() => {
    if (initialDropdownValues) {
      setDropdownValues((prev) => {
        let changed = false;
        const next = { ...prev };
        for (const [k, v] of Object.entries(initialDropdownValues)) {
          if (prev[k] !== v) {
            next[k] = v;
            changed = true;
          }
        }
        return changed ? next : prev;
      });
    }
  }, [initialValuesStr]);

  const activeDropdownValues = useMemo(() => {
    const out: Record<string, string> = {};
    for (const [key, value] of Object.entries(dropdownValues)) {
      if (value && value !== ALL_VALUE) out[key] = value;
    }
    return out;
  }, [dropdownValues]);

  const onFiltersChangeRef = useRef(onFiltersChange);
  onFiltersChangeRef.current = onFiltersChange;
  useEffect(() => {
    onFiltersChangeRef.current?.({ search: debouncedSearch, dropdownValues: activeDropdownValues });
  }, [activeDropdownValues, debouncedSearch]);

  const onQueryChangeRef = useRef(onQueryChange);
  onQueryChangeRef.current = onQueryChange;
  useEffect(() => {
    onQueryChangeRef.current?.({ search: debouncedSearch, page, dropdownValues: activeDropdownValues });
  }, [activeDropdownValues, debouncedSearch, page]);

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
    [dropdowns, dropdownValues, setPage],
  );

  const filtered = useMemo(() => {
    if (serverSide) return data;
    return data.filter((row) => (filter ? filter(row, debouncedSearch, activeDropdownValues) : true));
  }, [activeDropdownValues, data, debouncedSearch, filter, serverSide]);

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
