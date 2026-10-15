import { cn } from "@/lib/utils";

/** Horizontal location tab strip shared by Gift Management and Daily Quiz. */
export function LocationTabs({
  locations,
  value,
  onChange,
  showAllLocations = true,
}: {
  locations: { id: string; label: string }[];
  value: string;
  onChange: (id: string) => void;
  showAllLocations?: boolean;
}) {
  const tabs = showAllLocations ? [{ id: "all", label: "All Locations" }, ...locations] : locations;
  return (
    <div className="mb-4 flex flex-wrap gap-1 border-b">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            "border-b-2 px-3 py-2 text-sm font-medium transition-colors",
            value === tab.id
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground",
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
