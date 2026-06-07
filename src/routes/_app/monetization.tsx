import { Outlet, createFileRoute, useLocation, useNavigate } from "@tanstack/react-router";
import { Banknote, Eye, MousePointerClick, PauseCircle, Plus, Timer } from "lucide-react";
import { useState } from "react";
import { AdminListPage } from "@/components/admin/AdminListPage";
import { SectionCard } from "@/components/admin/SectionCard";
import { ActionMenu } from "@/components/common/ActionMenu";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { adUnits } from "@/mock/monetization.mock";
import type { AdUnit } from "@/types/monetization";
import type { Column } from "@/components/tables/DataTable";
import { ROUTES } from "@/constants/routes.constants";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/monetization")({ component: MonetizationPage });

function MonetizationPage() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  if (pathname !== ROUTES.MONETIZATION) return <Outlet />;
  const [adMobEnabled, setAdMobEnabled] = useState(true);
  const [manualEnabled, setManualEnabled] = useState(true);
  const columns: Column<AdUnit>[] = [
    { key: "unit", header: "Ad Unit", cell: (r) => <span className="font-medium">{r.name}</span> },
    { key: "preview", header: "Ad Preview", cell: (r) => <div className="rounded border bg-muted/30 px-3 py-2 text-xs">{r.preview}</div> },
    { key: "language", header: "Language", cell: (r) => r.language },
    { key: "location", header: "Location", cell: (r) => r.location },
    { key: "area", header: "Monetization Area", cell: (r) => r.area },
    { key: "revenue", header: "Revenue", cell: (r) => r.revenue },
    { key: "clicks", header: "Clicks", cell: (r) => r.clicks.toLocaleString() },
    { key: "impressions", header: "Impressions", cell: (r) => r.impressions.toLocaleString() },
    { key: "status", header: "Status", cell: (r) => <StatusBadge status={r.status} /> },
    { key: "actions", header: "Actions", cell: () => <ActionMenu /> },
  ];
  return (
    <Tabs defaultValue="ad-management">
      <TabsList className="mb-5"><TabsTrigger value="ad-management">Ad Management</TabsTrigger><TabsTrigger value="ad-placement">Ad Placement</TabsTrigger></TabsList>
      <TabsContent value="ad-management" className="space-y-5">
        <div className="grid gap-4 lg:grid-cols-2">
          <SettingPanel title="Google AdMob" description="SDK monetization panel" enabled={adMobEnabled} onToggle={setAdMobEnabled} showChangeKey />
          <SettingPanel title="Manual Ads" description="Manually configured campaign panel" enabled={manualEnabled} onToggle={setManualEnabled} />
        </div>
        <AdminListPage title="Monetization Management" breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "Monetization" }]} actions={<Button onClick={() => navigate({ to: ROUTES.MONETIZATION_ADD })}><Plus className="mr-2 h-4 w-4" />Add New Ad</Button>} stats={[{ title: "Total Ads", value: adUnits.length, icon: Banknote, variant: "blue" }, { title: "Active Ads", value: adUnits.filter((a) => a.status === "Active").length, icon: Eye, variant: "green" }, { title: "Paused Ads", value: adUnits.filter((a) => a.status === "Paused").length, icon: PauseCircle, variant: "amber" }, { title: "Scheduled Ads", value: adUnits.filter((a) => a.status === "Scheduled").length, icon: Timer, variant: "violet" }]} data={adUnits} columns={columns} rowKey={(r) => r.id} searchPlaceholder="Search ad unit..." dropdowns={[{ key: "language", placeholder: "Language", options: ["Hindi", "English"].map((s) => ({ label: s, value: s })) }, { key: "location", placeholder: "Location", options: ["Maharashtra", "Delhi", "Uttar Pradesh"].map((s) => ({ label: s, value: s })) }]} filter={(row, search) => row.name.toLowerCase().includes(search.toLowerCase())} />
      </TabsContent>
      <TabsContent value="ad-placement"><SectionCard title="Ad Placement" description="Placement map and ordering controls will use the same mock ad units."><MousePointerClick className="h-8 w-8 text-primary" /></SectionCard></TabsContent>
    </Tabs>
  );
}

function SettingPanel({ title, description, enabled, onToggle, showChangeKey = false }: { title: string; description: string; enabled: boolean; onToggle: (v: boolean) => void; showChangeKey?: boolean }) {
  return (
    <SectionCard title={title} description={description} className={!enabled ? "opacity-60" : ""} action={<Switch checked={enabled} onCheckedChange={onToggle} />}>
      <div className="flex items-center justify-between gap-3">
        <p className={enabled ? "text-2xl font-semibold text-emerald-600" : "text-2xl font-semibold text-muted-foreground"}>{enabled ? "Enabled" : "Disabled"}</p>
        {showChangeKey && (
          <Button variant="outline" size="sm" disabled={!enabled} onClick={() => toast.info("Google AdMob key API not available yet.")}>
            Change Key
          </Button>
        )}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">TODO: persist enable/disable settings after monetization APIs are available.</p>
    </SectionCard>
  );
}
