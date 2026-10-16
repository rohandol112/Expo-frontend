import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Save, Medal } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { LocationTabs } from "@/components/admin/LocationTabs";
import { ImageUploadGrid } from "@/components/forms/ImageUploadGrid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useGiftRanks, useSaveGiftRanks } from "@/hooks/api/useGiftRanks";
import { useCompetitionLocations, useRewardsSettings } from "@/hooks/api/useRewardsSettings";
import type { GiftRankInput } from "@/types/referrals";
import { ROUTES } from "@/constants/routes.constants";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/referrals/gift-management")({ component: GiftManagementPage });

const MEDAL_COLORS = ["bg-amber-100 text-amber-700", "bg-slate-200 text-slate-700", "bg-orange-100 text-orange-700"];
const DESCRIPTION_MAX = 100;

function GiftManagementPage() {
  const [locationId, setLocationId] = useState("all");
  const locationsQuery = useCompetitionLocations();
  const settingsQuery = useRewardsSettings();
  const ranksQuery = useGiftRanks(locationId);
  const saveRanks = useSaveGiftRanks();
  const [draft, setDraft] = useState<GiftRankInput[]>([]);

  useEffect(() => {
    if (ranksQuery.data) {
      setDraft(
        ranksQuery.data.map((r) => ({
          rank: r.rank,
          giftName: r.giftName,
          shortDescription: r.shortDescription,
          photo: r.photo ? [r.photo] : [],
          giftValue: r.giftValue,
          inherited: r.inherited,
        })),
      );
    }
  }, [ranksQuery.data]);

  // Editing an inherited row makes it this location's own gift.
  const updateRank = (rank: number, patch: Partial<GiftRankInput>) =>
    setDraft((rows) => rows.map((r) => (r.rank === rank ? { ...r, ...patch, inherited: false } : r)));

  const save = async () => {
    try {
      await saveRanks.mutateAsync({ locationId, ranks: draft });
    } catch {
      return;
    }
    toast.success("Gift settings saved");
  };

  const panThreshold = settingsQuery.data?.panRequiredMinGiftValue;
  const isLocation = locationId !== "all";

  return (
    <div>
      <PageHeader
        title="Gift Management"
        description="Set the monthly gift for each rank (1 to 10). All Locations is the default; a location can override any rank with its own gift."
        breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "Referrals & Points", to: ROUTES.REFERRALS }, { label: "Gift Management" }]}
      />
      <LocationTabs
        locations={(locationsQuery.data?.items ?? []).map((l) => ({ id: l.id, label: l.title }))}
        value={locationId}
        onChange={setLocationId}
      />
      {panThreshold !== undefined && (
        <p className="mb-3 text-sm text-muted-foreground">
          Winners must give their PAN for gifts worth ₹{panThreshold.toLocaleString("en-IN")} or more (Aadhaar is always required). Enter each gift's value so the app can ask for PAN when needed.
        </p>
      )}
      <Card className="overflow-x-auto">
        <div className="grid min-w-[860px] grid-cols-[80px_1fr_1.2fr_140px_1.6fr] gap-4 border-b bg-muted/40 px-4 py-3 text-xs font-medium uppercase text-muted-foreground">
          <span>Rank</span>
          <span>Gift Photo</span>
          <span>Gift Name</span>
          <span>Value (₹)</span>
          <span>Short Description</span>
        </div>
        {ranksQuery.isLoading && <div className="p-6 text-sm text-muted-foreground">Loading gifts…</div>}
        {ranksQuery.error && <div className="p-6 text-sm text-destructive">Unable to load gifts.</div>}
        {draft.map((row) => (
          <div key={row.rank} className="grid min-w-[860px] grid-cols-[80px_1fr_1.2fr_140px_1.6fr] items-start gap-4 border-b px-4 py-4 last:border-0">
            <div>
              {row.rank <= 3 ? (
                <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full ${MEDAL_COLORS[row.rank - 1]}`}>
                  <Medal className="h-4 w-4" />
                </span>
              ) : (
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border text-sm font-medium">{row.rank}</span>
              )}
              {isLocation && row.inherited && row.giftName && <p className="mt-1 text-[10px] leading-tight text-muted-foreground">From All Locations</p>}
            </div>
            <ImageUploadGrid label="Gift Photo" hint="JPG, PNG, Max 2MB" value={row.photo} onChange={(next) => updateRank(row.rank, { photo: next })} />
            <Input value={row.giftName} onChange={(e) => updateRank(row.rank, { giftName: e.target.value })} placeholder={`Enter gift name for rank ${row.rank}`} />
            <Input
              type="number"
              min={0}
              value={row.giftValue ?? ""}
              onChange={(e) => updateRank(row.rank, { giftValue: e.target.value === "" ? null : Math.max(0, Math.round(Number(e.target.value))) })}
              placeholder="e.g. 2500"
            />
            <div className="relative">
              <Input
                value={row.shortDescription}
                maxLength={DESCRIPTION_MAX}
                onChange={(e) => updateRank(row.rank, { shortDescription: e.target.value })}
                placeholder={`Enter short description for rank ${row.rank}`}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                {row.shortDescription.length}/{DESCRIPTION_MAX}
              </span>
            </div>
          </div>
        ))}
      </Card>
      <p className="mt-3 text-xs text-muted-foreground">Leave a gift name blank to clear that rank{isLocation ? " (it then falls back to the All Locations gift)" : ""}.</p>
      <div className="mt-6 flex justify-center">
        <Button onClick={save} disabled={saveRanks.isPending || draft.length === 0} className="min-w-[160px]">
          <Save className="mr-2 h-4 w-4" />{saveRanks.isPending ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
}
