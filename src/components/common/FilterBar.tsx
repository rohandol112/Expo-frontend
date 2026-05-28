import { Search, Filter, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
  return (
    <div className="flex flex-wrap items-center gap-3 mb-5">
      <div className="relative flex-1 min-w-[220px] max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search ?? ""}
          onChange={(e) => onSearchChange?.(e.target.value)}
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
          <Button variant="outline" className="gap-2 text-muted-foreground font-normal">
            <Calendar className="h-4 w-4" /> From Date
          </Button>
          <Button variant="outline" className="gap-2 text-muted-foreground font-normal">
            <Calendar className="h-4 w-4" /> To Date
          </Button>
        </>
      )}
      <Button variant="outline" className="gap-2" onClick={onFilter}>
        <Filter className="h-4 w-4" /> Filters
      </Button>
      {onReset && (
        <Button variant="ghost" onClick={onReset} className="text-muted-foreground">
          Reset
        </Button>
      )}
    </div>
  );
}