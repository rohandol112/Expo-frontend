import { ChevronDown, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface MultiSelectOption {
  label: string;
  value: number;
}

/**
 * Compact multi-select rendered as a bordered control with selected values shown
 * as removable chips and a dropdown of checkboxes. Built on the existing
 * dropdown-menu primitive (no extra deps).
 */
export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = "Select…",
  disabled,
  className,
}: {
  options: MultiSelectOption[];
  value: number[];
  onChange: (next: number[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}) {
  const selected = options.filter((o) => value.includes(o.value));
  const toggle = (v: number) =>
    onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={disabled}>
        <button
          type="button"
          className={cn(
            "flex min-h-9 w-full flex-wrap items-center gap-1.5 rounded-md border border-input bg-transparent px-2 py-1.5 text-left text-sm disabled:cursor-not-allowed disabled:opacity-50",
            className,
          )}
        >
          {selected.length === 0 && <span className="px-1 text-muted-foreground">{placeholder}</span>}
          {selected.map((o) => (
            <span
              key={o.value}
              className="inline-flex items-center gap-1 rounded bg-primary/10 px-1.5 py-0.5 text-xs text-primary"
              onClick={(e) => {
                e.stopPropagation();
                toggle(o.value);
              }}
            >
              {o.label}
              <X className="h-3 w-3" />
            </span>
          ))}
          <ChevronDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="max-h-72 w-56 overflow-y-auto" align="start">
        {options.length === 0 && <div className="px-2 py-1.5 text-sm text-muted-foreground">No options</div>}
        {options.map((o) => (
          <DropdownMenuCheckboxItem
            key={o.value}
            checked={value.includes(o.value)}
            onCheckedChange={() => toggle(o.value)}
            onSelect={(e) => e.preventDefault()}
          >
            {o.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
