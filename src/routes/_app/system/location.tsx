import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { MapPin, Plus } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionCard } from "@/components/admin/SectionCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { locationOverview } from "@/mock/location.mock";
import { ROUTES } from "@/constants/routes.constants";

export const Route = createFileRoute("/_app/system/location")({ component: LocationOverviewPage });

function LocationOverviewPage() {
  const navigate = useNavigate();
  return (
    <div>
      <PageHeader title="All Locations" breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "System" }, { label: "All Locations" }]} actions={<Button onClick={() => navigate({ to: ROUTES.SYS_STATES_ADD })}><Plus className="mr-2 h-4 w-4" />Add</Button>} />
      <div className="grid gap-4 xl:grid-cols-2">
        {locationOverview.map((item) => (
          <SectionCard key={item.id}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary"><MapPin className="h-5 w-5" /></div>
                <div>
                  <p className="font-semibold">{item.language}</p>
                  <p className="text-sm text-muted-foreground">Location hierarchy</p>
                </div>
              </div>
              <StatusBadge status={item.status} />
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3">
              <Metric label="States" value={item.states} />
              <Metric label="Districts" value={item.districts} />
              <Metric label="Areas" value={item.areas} />
            </div>
            <div className="mt-5 flex gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate({ to: ROUTES.SYS_STATES })}>View</Button>
              <Button variant="outline" size="sm">Edit</Button>
              <Button size="sm" onClick={() => navigate({ to: ROUTES.SYS_STATES_ADD })}>Add</Button>
            </div>
          </SectionCard>
        ))}
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return <div className="rounded-lg border bg-muted/20 p-3"><p className="text-xl font-semibold">{value}</p><p className="text-xs text-muted-foreground">{label}</p></div>;
}
