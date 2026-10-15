import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Edit, Flame, Gift, MapPin, Plus, Save, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { StatusBadge } from "@/components/common/StatusBadge";
import { FormSection } from "@/components/forms/FormSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  useCompetitionLocations,
  useDeleteCompetitionLocation,
  useDeleteImportantLink,
  useImportantLinks,
  useRewardsSettings,
  useUpdateRewardsSettings,
} from "@/hooks/api/useRewardsSettings";
import type { CompetitionLocation, ImportantLink } from "@/types/referrals";
import { ROUTES } from "@/constants/routes.constants";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/referrals/settings/")({ component: ReferralsSettingsPage });

function ReferralsSettingsPage() {
  const navigate = useNavigate();
  const settingsQuery = useRewardsSettings();
  const updateSettings = useUpdateRewardsSettings();
  const locationsQuery = useCompetitionLocations();
  const linksQuery = useImportantLinks();
  const deleteLocation = useDeleteCompetitionLocation();
  const deleteLink = useDeleteImportantLink();

  const [streakPoints, setStreakPoints] = useState(0);
  const [referralPoints, setReferralPoints] = useState(0);
  const [approvalDays, setApprovalDays] = useState(0);
  const [approvalUnit, setApprovalUnit] = useState("Days");
  const [locationTarget, setLocationTarget] = useState<CompetitionLocation | null>(null);
  const [linkTarget, setLinkTarget] = useState<ImportantLink | null>(null);

  useEffect(() => {
    if (settingsQuery.data) {
      setStreakPoints(settingsQuery.data.streakPointsPerDay);
      setReferralPoints(settingsQuery.data.referralPointsPerInstall);
      setApprovalDays(settingsQuery.data.referralApprovalDays);
    }
  }, [settingsQuery.data]);

  const saveStreak = async () => {
    await updateSettings.mutateAsync({ streakPointsPerDay: streakPoints });
    toast.success("Streak settings saved");
  };

  const saveReferral = async () => {
    await updateSettings.mutateAsync({ referralPointsPerInstall: referralPoints, referralApprovalDays: approvalDays });
    toast.success("Referral settings saved");
  };

  const locations = locationsQuery.data?.items ?? [];
  const links = linksQuery.data?.items ?? [];

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Manage streak points, referral points, competition locations and important links for the app."
        breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "Referrals & Points", to: ROUTES.REFERRALS }, { label: "Settings" }]}
      />

      <div className="grid gap-4 xl:grid-cols-2">
        <FormSection title="🔥 Streak Points Settings" description="Set points for each day of app usage streak. Users will get the same points for every consecutive day.">
          <div className="space-y-2">
            <Label>Points per day</Label>
            <div className="flex items-center gap-2">
              <Input type="number" className="max-w-[160px]" value={streakPoints} onChange={(e) => setStreakPoints(Number(e.target.value))} />
              <span className="text-sm text-muted-foreground">Points</span>
            </div>
          </div>
          <p className="rounded-md bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
            Users will get {streakPoints} points for each consecutive day they use the app.
          </p>
          <div className="flex justify-end">
            <Button size="sm" onClick={saveStreak} disabled={updateSettings.isPending}><Save className="mr-2 h-3.5 w-3.5" />Save</Button>
          </div>
        </FormSection>

        <FormSection title="👥 Referral Settings">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5"><Gift className="h-3.5 w-3.5" /> Referral Points</Label>
              <p className="text-xs text-muted-foreground">Points to be given to user when their friend installs the app using referral code.</p>
              <div className="flex items-center gap-2">
                <Input type="number" value={referralPoints} onChange={(e) => setReferralPoints(Number(e.target.value))} />
                <span className="text-sm text-muted-foreground">Points</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5"><Flame className="h-3.5 w-3.5" /> Referral Approval Time</Label>
              <p className="text-xs text-muted-foreground">Set waiting period for new referral to be approved and count towards rewards.</p>
              <div className="flex items-center gap-2">
                <Input type="number" value={approvalDays} onChange={(e) => setApprovalDays(Number(e.target.value))} />
                <Select value={approvalUnit} onValueChange={setApprovalUnit}>
                  <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Days">Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <Button size="sm" onClick={saveReferral} disabled={updateSettings.isPending}><Save className="mr-2 h-3.5 w-3.5" />Save</Button>
          </div>
        </FormSection>

        <FormSection title="📍 Competition Location List" description="Manage locations where competition is available in the app.">
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
                    <td className="px-3 py-2">{loc.area}</td>
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
                  <tr><td colSpan={6} className="px-3 py-6 text-center text-muted-foreground">No locations added yet</td></tr>
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
                  <tr><td colSpan={4} className="px-3 py-6 text-center text-muted-foreground">No links added yet</td></tr>
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
        description={`This will remove "${locationTarget?.title ?? ""}" from the competition location list.`}
        confirmLabel="Delete"
        destructive
        onConfirm={async () => {
          if (!locationTarget) return;
          await deleteLocation.mutateAsync(locationTarget.id);
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
          await deleteLink.mutateAsync(linkTarget.id);
          toast.success("Link deleted");
          setLinkTarget(null);
        }}
      />
    </div>
  );
}
