import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BookOpen, Edit, ListChecks, MapPin, Plus, Save, Trash2, Trophy } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { StatusBadge } from "@/components/common/StatusBadge";
import { FormSection } from "@/components/forms/FormSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useCompetitionLocations,
  useDeleteCompetitionLocation,
  useDeleteImportantLink,
  useImportantLinks,
  useRewardsSettings,
  useUpdateRewardsSettings,
} from "@/hooks/api/useRewardsSettings";
import type { CompetitionLocation, ImportantLink, RewardsSettings } from "@/types/referrals";
import { ROUTES } from "@/constants/routes.constants";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/referrals/settings/")({ component: ReferralsSettingsPage });

/** A numeric settings input with its unit and a one-line explanation. */
function NumberField({
  label,
  hint,
  unit,
  value,
  onChange,
  min = 0,
  max,
}: {
  label: string;
  hint?: string;
  unit?: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      <div className="flex items-center gap-2">
        <Input
          type="number"
          className="max-w-[160px]"
          min={min}
          max={max}
          value={value}
          onChange={(e) => {
            const n = Math.round(Number(e.target.value) || 0);
            onChange(Math.min(max ?? n, Math.max(min, n)));
          }}
        />
        {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
      </div>
    </div>
  );
}

function ReferralsSettingsPage() {
  const navigate = useNavigate();
  const settingsQuery = useRewardsSettings();
  const updateSettings = useUpdateRewardsSettings();
  const locationsQuery = useCompetitionLocations();
  const linksQuery = useImportantLinks();
  const deleteLocation = useDeleteCompetitionLocation();
  const deleteLink = useDeleteImportantLink();
  const [form, setForm] = useState<RewardsSettings | null>(null);
  const [locationTarget, setLocationTarget] = useState<CompetitionLocation | null>(null);
  const [linkTarget, setLinkTarget] = useState<ImportantLink | null>(null);

  useEffect(() => {
    if (settingsQuery.data) setForm(settingsQuery.data);
  }, [settingsQuery.data]);

  const set = <K extends keyof RewardsSettings>(key: K) => (value: RewardsSettings[K]) => setForm((f) => (f ? { ...f, [key]: value } : f));

  /** Saves just the given fields, so one card's Save never overwrites another card's unsaved edits. */
  const save = async (keys: (keyof RewardsSettings)[], message: string) => {
    if (!form) return;
    const payload: Partial<RewardsSettings> = {};
    for (const k of keys) payload[k] = form[k];
    try {
      await updateSettings.mutateAsync(payload);
    } catch {
      return;
    }
    toast.success(message);
  };

  const saveButton = (keys: (keyof RewardsSettings)[], message: string) => (
    <div className="flex justify-end">
      <Button size="sm" onClick={() => save(keys, message)} disabled={updateSettings.isPending || !form}><Save className="mr-2 h-3.5 w-3.5" />Save</Button>
    </div>
  );

  const locations = locationsQuery.data?.items ?? [];
  const links = linksQuery.data?.items ?? [];
  const gapExample = form ? Array.from({ length: 3 }, (_, i) => i * (form.readingRewardGap + 1) + 1).join(", ") : "";

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Manage streak points, referral points, reading and quiz rules, competition locations and important links for the app."
        breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "Referrals & Points", to: ROUTES.REFERRALS }, { label: "Settings" }]}
      />
      {settingsQuery.error && (
        <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">Unable to load settings.</div>
      )}

      {form && (
        <div className="mb-4 grid gap-4 xl:grid-cols-2">
          <FormSection title="🔥 Streak Points Settings" description="Set points for each day of app usage streak. Users will get the same points for every consecutive day.">
            <NumberField label="Points per day" unit="Points" value={form.streakPointsPerDay} onChange={set("streakPointsPerDay")} />
            <p className="rounded-md bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
              Users will get {form.streakPointsPerDay} points for each consecutive day they use the app.
            </p>
            {saveButton(["streakPointsPerDay"], "Streak settings saved")}
          </FormSection>

          <FormSection title="👥 Referral Settings">
            <div className="grid gap-4 md:grid-cols-2">
              <NumberField
                label="Referral Points"
                hint="Points to the user whose friend joins with their code and stays active."
                unit="Points"
                value={form.referralPointsPerInstall}
                onChange={set("referralPointsPerInstall")}
              />
              <NumberField
                label="Referral Approval Time"
                hint="The friend must still be opening the app after this many days."
                unit="Days"
                min={0}
                max={90}
                value={form.referralApprovalDays}
                onChange={set("referralApprovalDays")}
              />
              <NumberField
                label="Code Entry Window"
                hint="How long after joining a new user can still enter a referral code."
                unit="Days"
                min={0}
                max={90}
                value={form.referralApplyWindowDays}
                onChange={set("referralApplyWindowDays")}
              />
            </div>
            {saveButton(["referralPointsPerInstall", "referralApprovalDays", "referralApplyWindowDays"], "Referral settings saved")}
          </FormSection>

          <FormSection title="📰 Reading Points" description="Points for reading or watching news. Opening an item pays nothing; the user has to stay on it.">
            <div className="grid gap-4 md:grid-cols-2">
              <NumberField label="Points per article" hint="1 to 10 points (0 turns reading points off)." unit="Points" min={0} max={10} value={form.readingPointsPerArticle} onChange={set("readingPointsPerArticle")} />
              <NumberField label="Stay time" hint="How long the user must stay on a news item before it counts." unit="Seconds" min={3} max={600} value={form.readingMinSeconds} onChange={set("readingMinSeconds")} />
              <NumberField label="Reward every" hint="Articles skipped between paid reads (0 = every read pays)." unit="Articles gap" min={0} max={5} value={form.readingRewardGap} onChange={set("readingRewardGap")} />
              <NumberField label="Daily limit" hint="Most paid reads per user per day." unit="Articles" min={0} value={form.readingDailyArticleLimit} onChange={set("readingDailyArticleLimit")} />
              <NumberField label="Like points" hint="Points for liking a news item (once per item)." unit="Points" min={0} value={form.likePointsPerArticle} onChange={set("likePointsPerArticle")} />
            </div>
            <p className="flex items-start gap-2 rounded-md bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
              <BookOpen className="mt-0.5 h-4 w-4 shrink-0" />
              {form.readingPointsPerArticle === 0
                ? "Reading points are off."
                : `A read counts after ${form.readingMinSeconds} seconds. Paid reads each day: ${gapExample}… (${form.readingPointsPerArticle} points each, up to ${form.readingDailyArticleLimit} a day).`}
            </p>
            {saveButton(["readingPointsPerArticle", "readingMinSeconds", "readingRewardGap", "readingDailyArticleLimit", "likePointsPerArticle"], "Reading settings saved")}
          </FormSection>

          <FormSection title="🏆 Quiz & Gift Claims">
            <div className="grid gap-4 md:grid-cols-2">
              <NumberField label="Daily quiz winners" hint="First players in each location to get every quiz right win the day's gift." unit="Users" min={1} max={100} value={form.quizDailyWinnerCount} onChange={set("quizDailyWinnerCount")} />
              <NumberField label="Quiz gift claim window" hint="Time a quiz winner has to claim the gift." unit="Hours" min={1} max={720} value={form.quizGiftClaimHours} onChange={set("quizGiftClaimHours")} />
              <NumberField label="Monthly gift claim window" hint="Days after the month ends to claim a monthly gift." unit="Days" min={1} max={90} value={form.monthlyGiftClaimDays} onChange={set("monthlyGiftClaimDays")} />
              <NumberField label="PAN required from" hint="Gift value at which winners must also give PAN. Aadhaar is always required." unit="₹" min={0} value={form.panRequiredMinGiftValue} onChange={set("panRequiredMinGiftValue")} />
            </div>
            <p className="flex items-start gap-2 rounded-md bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
              <Trophy className="mt-0.5 h-4 w-4 shrink-0" />
              Set each gift's value in Gift Management and Daily Quiz so the app knows when to ask for PAN.
            </p>
            {saveButton(["quizDailyWinnerCount", "quizGiftClaimHours", "monthlyGiftClaimDays", "panRequiredMinGiftValue"], "Quiz & claim settings saved")}
          </FormSection>

          <FormSection title="✅ Daily Tasks" description="Bonus points for completing each task in a day. The first day all three are done also pays the welcome bonus once.">
            <div className="grid gap-4 md:grid-cols-2">
              <NumberField label="Read news: target" unit="Articles" min={1} value={form.taskReadTarget} onChange={set("taskReadTarget")} />
              <NumberField label="Read news: bonus" unit="Points" value={form.taskReadBonus} onChange={set("taskReadBonus")} />
              <NumberField label="Refer friends: target" unit="Friends" min={1} value={form.taskReferTarget} onChange={set("taskReferTarget")} />
              <NumberField label="Refer friends: bonus" unit="Points" value={form.taskReferBonus} onChange={set("taskReferBonus")} />
              <NumberField label="Play quizzes: target" unit="Quizzes" min={1} max={2} value={form.taskQuizTarget} onChange={set("taskQuizTarget")} />
              <NumberField label="Play quizzes: bonus" unit="Points" value={form.taskQuizBonus} onChange={set("taskQuizBonus")} />
              <NumberField label="Welcome bonus" unit="Points" value={form.welcomeBonusPoints} onChange={set("welcomeBonusPoints")} />
            </div>
            <p className="flex items-start gap-2 rounded-md bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
              <ListChecks className="mt-0.5 h-4 w-4 shrink-0" />Tasks reset every day at midnight (IST).
            </p>
            {saveButton(
              ["taskReadTarget", "taskReadBonus", "taskReferTarget", "taskReferBonus", "taskQuizTarget", "taskQuizBonus", "welcomeBonusPoints"],
              "Daily task settings saved",
            )}
          </FormSection>
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-2">
        <FormSection title="📍 Competition Location List" description="Each location is a separate rewards program, with its own leader board, gifts, quizzes and winners.">
          <div className="flex justify-end">
            <Button size="sm" onClick={() => navigate({ to: ROUTES.REFERRALS_SETTINGS_LOCATIONS_ADD })}><Plus className="mr-1.5 h-3.5 w-3.5" />Add Location</Button>
          </div>
          <div className="overflow-x-auto rounded-md border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-left text-xs uppercase text-muted-foreground">
                  <th className="px-3 py-2 font-medium">Location Name</th>
                  <th className="px-3 py-2 font-medium">State</th>
                  <th className="px-3 py-2 font-medium">District</th>
                  <th className="px-3 py-2 font-medium">Area</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {locations.map((loc) => (
                  <tr key={loc.id} className="border-b last:border-0">
                    <td className="px-3 py-2 font-medium"><span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-muted-foreground" />{loc.title}</span></td>
                    <td className="px-3 py-2">{loc.state}</td>
                    <td className="px-3 py-2">{loc.district}</td>
                    <td className="max-w-[220px] px-3 py-2">{loc.area}</td>
                    <td className="px-3 py-2"><StatusBadge status={loc.status} /></td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1">
                        <Button variant="outline" size="sm" onClick={() => navigate({ to: "/referrals/settings/locations/$id/edit", params: { id: loc.id } })}>
                          <Edit className="mr-1 h-3.5 w-3.5" />Edit
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setLocationTarget(loc)} aria-label="Delete location">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {locations.length === 0 && (
                  <tr><td colSpan={6} className="px-3 py-6 text-center text-muted-foreground">{locationsQuery.isLoading ? "Loading…" : "No locations added yet"}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </FormSection>

        <FormSection title="🔗 Important Links" description="Add important links which will be shown in the app. When user clicks on the link, a popup with title and description will be displayed.">
          <div className="flex justify-end">
            <Button size="sm" onClick={() => navigate({ to: ROUTES.REFERRALS_SETTINGS_LINKS_ADD })}><Plus className="mr-1.5 h-3.5 w-3.5" />Add Link</Button>
          </div>
          <div className="overflow-x-auto rounded-md border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-left text-xs uppercase text-muted-foreground">
                  <th className="px-3 py-2 font-medium">Title</th>
                  <th className="px-3 py-2 font-medium">Description</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {links.map((link) => (
                  <tr key={link.id} className="border-b last:border-0">
                    <td className="px-3 py-2 font-medium">{link.title}</td>
                    <td className="max-w-[260px] truncate px-3 py-2 text-muted-foreground">{link.description.replace(/<[^>]+>/g, "")}</td>
                    <td className="px-3 py-2"><StatusBadge status={link.status} /></td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1">
                        <Button variant="outline" size="sm" onClick={() => navigate({ to: "/referrals/settings/links/$id/edit", params: { id: link.id } })}>
                          <Edit className="mr-1 h-3.5 w-3.5" />Edit
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setLinkTarget(link)} aria-label="Delete link">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {links.length === 0 && (
                  <tr><td colSpan={4} className="px-3 py-6 text-center text-muted-foreground">{linksQuery.isLoading ? "Loading…" : "No links added yet"}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </FormSection>
      </div>

      <ConfirmDialog
        open={Boolean(locationTarget)}
        onOpenChange={(open) => !open && setLocationTarget(null)}
        title="Delete location?"
        description={`This will remove "${locationTarget?.title ?? ""}" from the competition location list. A location that already has quiz plays or gift claims can't be deleted; set it Inactive instead.`}
        confirmLabel="Delete"
        destructive
        onConfirm={async () => {
          if (!locationTarget) return;
          try {
            await deleteLocation.mutateAsync(locationTarget.id);
          } catch {
            return;
          }
          toast.success("Location deleted");
          setLocationTarget(null);
        }}
      />
      <ConfirmDialog
        open={Boolean(linkTarget)}
        onOpenChange={(open) => !open && setLinkTarget(null)}
        title="Delete link?"
        description={`This will remove "${linkTarget?.title ?? ""}" from the app.`}
        confirmLabel="Delete"
        destructive
        onConfirm={async () => {
          if (!linkTarget) return;
          try {
            await deleteLink.mutateAsync(linkTarget.id);
          } catch {
            return;
          }
          toast.success("Link deleted");
          setLinkTarget(null);
        }}
      />
    </div>
  );
}
