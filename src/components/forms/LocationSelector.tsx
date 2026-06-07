import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { areas, districts, states } from "@/mock/location.mock";

export function LocationSelector({
  showState = true,
  showDistrict = true,
  showArea = true,
  label = "Location",
}: {
  showState?: boolean;
  showDistrict?: boolean;
  showArea?: boolean;
  label?: string;
}) {
  return (
    <div>
      <Label className="mb-1.5 block">{label}</Label>
      <div className="grid gap-3 md:grid-cols-3">
        {showState && (
          <Select>
            <SelectTrigger><SelectValue placeholder="Select State" /></SelectTrigger>
            <SelectContent>{states.map((s) => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}</SelectContent>
          </Select>
        )}
        {showDistrict && (
          <Select>
            <SelectTrigger><SelectValue placeholder="Select District" /></SelectTrigger>
            <SelectContent>{districts.map((d) => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}</SelectContent>
          </Select>
        )}
        {showArea && (
          <Select>
            <SelectTrigger><SelectValue placeholder="Select Area" /></SelectTrigger>
            <SelectContent>{areas.map((a) => <SelectItem key={a.id} value={a.name}>{a.name}</SelectItem>)}</SelectContent>
          </Select>
        )}
      </div>
    </div>
  );
}
