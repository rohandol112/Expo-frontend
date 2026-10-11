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
import { DAILY_QUIZ_LOCATIONS } from "@/mock/dailyQuiz.mock";
import type { GiftRank } from "@/types/referrals";
import { ROUTES } from "@/constants/routes.constants";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/referrals/gift-management")({ component: GiftManagementPage });

const MEDAL_COLORS = ["bg-amber-100 text-amber-700", "bg-slate-200 text-slate-700", "bg-orange-100 text-orange-700"];
const DESCRIPTION_MAX = 100;

function GiftManagementPage() {
  const [locationId, setLocationId] = useState("all");
  const ranksQuery = useGiftRanks(locationId);
  const saveRanks = useSaveGiftRanks();
  const [draft, setDraft] = useState<GiftRank[]>([]);
  const [files, setFiles] = useState<Record<number, File[]>>({});

  useEffect(() => {
    if (ranksQuery.data) {
      setDraft(ranksQuery.data);
      setFiles({});
    }
  }, [ranksQuery.data]);

  const updateRank = (rank: number, patch: Partial<GiftRank>) =>
    setDraft((rows) => rows.map((r) => (r.rank === rank ? { ...r, ...patch } : r)));

  const save = async () => {
    const withPhotos = draft.map((r) => ({ ...r, photo: files[r.rank]?.[0]?.name ?? r.photo }));
    await saveRanks.mutateAsync({ locationId, ranks: withPhotos });
    toast.success("Gift settings saved");
  };

  return (
    <div>
      <PageHeader
        title="Gift Management"
        description="Set and manage gifts for each rank (1 to 10) for the quiz. Add gift name, image and short description for all locations."
        breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "Referrals & Points", to: ROUTES.REFERRALS }, { label: "Gift Management" }]}
      />

      <LocationTabs
        locations={DAILY_QUIZ_LOCATIONS.map((l) => ({ id: l.id, label: l.label }))}
        value={locationId}
        onChange={setLocationId}
      />

      <Card className="overflow-hidden">
        <div className="grid grid-cols-[80px_1fr_1.2fr_1.6fr] gap-4 border-b bg-muted/40 px-4 py-3 text-xs font-medium uppercase text-muted-foreground">
          <span>Rank</span>
          <span>Gift Photo</span>
          <span>Gift Name</span>
          <span>Short Description</span>
        </div>
        {ranksQuery.isLoading && <div className="p-6 text-sm text-muted-foreground">Loading gifts…</div>}
        {draft.map((row) => (
          <div key={row.rank} className="grid grid-cols-[80px_1fr_1.2fr_1.6fr] items-start gap-4 border-b px-4 py-4 last:border-0">
            <div>
              {row.rank <= 3 ? (
                <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full ${MEDAL_COLORS[row.rank - 1]}`}>
                  <Medal className="h-4 w-4" />
                </span>
              ) : (
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border text-sm font-medium">{row.rank}</span>
              )}
            </div>
            <div>
              <ImageUploadGrid
                label="Gift Photo"
                hint="JPG, PNG, Max 2MB"
                value={files[row.rank] ?? []}
                onChange={(next) => setFiles((f) => ({ ...f, [row.rank]: next }))}
              />
              {row.photo && !files[row.rank]?.length && <p className="mt-1 text-xs text-muted-foreground">Current: {row.photo}</p>}
            </div>
            <Input
              value={row.giftName}
              onChange={(e) => updateRank(row.rank, { giftName: e.target.value })}
              placeholder={`Enter gift name for rank ${row.rank}`}
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

      <div className="mt-6 flex justify-center">
        <Button onClick={save} disabled={saveRanks.isPending || draft.length === 0} className="min-w-[160px]">
          <Save className="mr-2 h-4 w-4" />{saveRanks.isPending ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
}
