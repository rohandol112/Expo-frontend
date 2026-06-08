import { useMemo, useState } from "react";
import { PageHeader, type Crumb } from "@/components/common/PageHeader";
import { FilterBar, type FilterDropdown } from "@/components/common/FilterBar";
import { DataTable, type Column } from "@/components/tables/DataTable";
import { StatsGrid, type StatItem } from "@/components/admin/StatsGrid";

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
}) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [dropdownValues, setDropdownValues] = useState<Record<string, string>>({});

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
          setPage(1);
        },
      })),
    [dropdowns, dropdownValues],
  );

  const filtered = useMemo(
    () => data.filter((row) => (filter ? filter(row, search, activeDropdownValues) : true)),
    [data, filter, search, activeDropdownValues],
  );

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
        pageSize={10}
        total={filtered.length}
        onPageChange={setPage}
      />
    </div>
  );
}
