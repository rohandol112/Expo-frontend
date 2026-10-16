import { useCallback, useState } from "react";
import type { AdminListQuery } from "@/components/admin/AdminListPage";

/**
 * List state for a server-paged AdminListPage: search, page, dropdown values
 * and the date range. Changing the state clears district and area; changing
 * the district clears the area. Pass `dropdownValues` back as
 * `initialDropdownValues` so the cleared dropdowns show it.
 */
export function useReportListState() {
  const [list, setList] = useState<AdminListQuery>({ search: "", page: 1, dropdownValues: {} });
  const [range, setRange] = useState({ from: "", to: "" });

  const onQueryChange = useCallback((next: AdminListQuery) => {
    setList((prev) => {
      const values = { ...next.dropdownValues };
      if ((values.state ?? "") !== (prev.dropdownValues.state ?? "")) {
        values.district = "";
        values.area = "";
      } else if ((values.district ?? "") !== (prev.dropdownValues.district ?? "")) {
        values.area = "";
      }
      return { ...next, dropdownValues: values };
    });
  }, []);

  const onDateRangeChange = useCallback((next: { from: string; to: string }) => {
    setRange((prev) => (prev.from === next.from && prev.to === next.to ? prev : next));
    setList((prev) => (prev.page === 1 ? prev : { ...prev, page: 1 }));
  }, []);

  const setPage = useCallback((page: number) => setList((prev) => ({ ...prev, page })), []);

  return {
    search: list.search,
    page: list.page,
    dropdownValues: list.dropdownValues,
    from: range.from || undefined,
    to: range.to || undefined,
    onQueryChange,
    onDateRangeChange,
    setPage,
  };
}
