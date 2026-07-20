import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionCard } from "@/components/admin/SectionCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useCompetitionConfig, useUpdateCompetitionConfig } from "@/hooks/api/useCompetition";
import type { CompetitionConfig } from "@/types/competitionAdmin";
import { ROUTES } from "@/constants/routes.constants";

export const Route = createFileRoute("/_app/competition/settings")({ component: CompetitionSettingsPage });

/** Converts an ISO timestamp to the value a datetime-local input expects. */
function toLocalInput(value: string | null | undefined) {
  if (!value) return "";
  const date = new Date(value);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function CompetitionSettingsPage() {
  const configQuery = useCompetitionConfig();
  const updateConfig = useUpdateCompetitionConfig();
  const [form, setForm] = useState<Partial<CompetitionConfig> | null>(null);

  const config = { ...(configQuery.data ?? {}), ...(form ?? {}) } as Partial<CompetitionConfig>;
  const setField = <K extends keyof CompetitionConfig>(key: K, value: CompetitionConfig[K]) =>
    setForm((f) => ({ ...(f ?? {}), [key]: value }));

  const handleSave = () => {
    if (!form) return toast.info("No changes to save");
    updateConfig.mutate(form, {
      onSuccess: () => {
        toast.success("Competition settings saved");
        setForm(null);
      },
      onError: (err) => toast.error(err instanceof Error ? err.message : "Save failed"),
    });
  };

  return (
    <div>
      <PageHeader
        title="Competition Settings"
        breadcrumbs={[
          { label: "Dashboard", to: ROUTES.DASHBOARD },
          { label: "Competition", to: ROUTES.COMPETITION },
          { label: "Settings" },
        ]}
        actions={
          <Button onClick={handleSave} disabled={updateConfig.isPending || !form}>
            <Save className="mr-2 h-4 w-4" />
            {updateConfig.isPending ? "Saving…" : "Save All Changes"}
          </Button>
        }
      />

      {configQuery.error && (
        <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          Unable to load competition settings from backend.
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard
          title="Competition Details"
          action={
            <div className="flex items-center gap-2">
              <Label htmlFor="comp-active" className="text-xs text-muted-foreground">Active</Label>
              <Switch id="comp-active" checked={Boolean(config.is_active)} onCheckedChange={(v) => setField("is_active", v)} />
            </div>
          }
        >
          <div className="space-y-4">
            <div>
              <Label>Competition Name</Label>
              <Input className="mt-1" value={config.title ?? ""} onChange={(e) => setField("title", e.target.value)} />
            </div>
            <div>
              <Label>Subtitle</Label>
              <Input className="mt-1" value={config.subtitle ?? ""} onChange={(e) => setField("subtitle", e.target.value)} />
            </div>
            <div>
              <Label>Points per Approved Banner</Label>
              <Input
                className="mt-1"
                type="number"
                min={0}
                value={config.banner_points ?? 25}
                onChange={(e) => setField("banner_points", Number(e.target.value))}
              />
              <p className="mt-1 text-xs text-muted-foreground">Each approved banner credits these bonus vote points (max 2 banners).</p>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Voting Period"
          description="The participant list becomes visible and Vote Now enables automatically when voting starts; the button disables when it ends."
        >
          <div className="space-y-4">
            <div>
              <Label>Voting Start Date & Time</Label>
              <Input
                className="mt-1"
                type="datetime-local"
                value={toLocalInput(config.voting_starts_at)}
                onChange={(e) => setField("voting_starts_at", e.target.value ? new Date(e.target.value).toISOString() : null)}
              />
            </div>
            <div>
              <Label>Voting End Date & Time</Label>
              <Input
                className="mt-1"
                type="datetime-local"
                value={toLocalInput(config.voting_ends_at)}
                onChange={(e) => setField("voting_ends_at", e.target.value ? new Date(e.target.value).toISOString() : null)}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Total registered pandals: {configQuery.data?.total_pandals ?? 0}
            </p>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
