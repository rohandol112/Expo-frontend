import { useEffect, useRef, useState } from "react";
import { Search, Filter, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface FilterDropdown {
  key: string;
  placeholder: string;
  options: { label: string; value: string }[];
  value?: string;
  onChange?: (v: string) => void;
}

export function FilterBar({
  search,
  onSearchChange,
  searchPlaceholder = "Search...",
  dropdowns = [],
  showDateRange = true,
  onReset,
  onFilter,
}: {
  search?: string;
  onSearchChange?: (v: string) => void;
  searchPlaceholder?: string;
  dropdowns?: FilterDropdown[];
  showDateRange?: boolean;
  onReset?: () => void;
  onFilter?: () => void;
}) {
  const [searchValue, setSearchValue] = useState(search ?? "");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const debouncedSearch = useDebouncedValue(searchValue);
  const lastEmittedSearch = useRef(search ?? "");

  useEffect(() => {
    setSearchValue(search ?? "");
  }, [search]);

  useEffect(() => {
    if (debouncedSearch !== lastEmittedSearch.current) {
      lastEmittedSearch.current = debouncedSearch;
      onSearchChange?.(debouncedSearch);
    }
  }, [debouncedSearch, onSearchChange]);

  const handleReset = () => {
    setSearchValue("");
    setStartDate("");
    setEndDate("");
    onReset?.();
  };

  return (
    <div className="flex flex-wrap items-center gap-3 mb-5">
      <div className="relative flex-1 min-w-[220px] max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder={searchPlaceholder}
          className="pl-9"
        />
      </div>
      {dropdowns.map((d) => (
        <Select key={d.key} value={d.value} onValueChange={d.onChange}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder={d.placeholder} />
          </SelectTrigger>
          <SelectContent>
            {d.options.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}
      {showDateRange && (
        <>
          <div className="relative w-[170px]">
            <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <span className="pointer-events-none absolute left-9 top-1 text-[10px] font-medium leading-none text-muted-foreground">
              Start Date
            </span>
            <Input
              type="date"
              value={startDate}
              max={endDate || undefined}
              onChange={(e) => setStartDate(e.target.value)}
              aria-label="Start date"
              className="h-10 pl-9 pt-4 text-xs text-foreground"
            />
          </div>
          <div className="relative w-[170px]">
            <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <span className="pointer-events-none absolute left-9 top-1 text-[10px] font-medium leading-none text-muted-foreground">
              End Date
            </span>
            <Input
              type="date"
              value={endDate}
              min={startDate || undefined}
              onChange={(e) => setEndDate(e.target.value)}
              aria-label="End date"
              className="h-10 pl-9 pt-4 text-xs text-foreground"
            />
          </div>
        </>
      )}
      <Button variant="outline" className="gap-2" onClick={onFilter}>
        <Filter className="h-4 w-4" /> Filters
      </Button>
      {onReset && (
        <Button variant="ghost" onClick={handleReset} className="text-muted-foreground">
          Reset
        </Button>
      )}
    </div>
  );
}
