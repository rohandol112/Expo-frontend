import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionCard } from "@/components/admin/SectionCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCompetitionEntry, useReviewBanner, useReviewEntry } from "@/hooks/api/useCompetition";
import { ROUTES } from "@/constants/routes.constants";

export const Route = createFileRoute("/_app/competition/participants/$participantId")({
  component: ParticipantDetailPage,
});

const STATUS_LABELS: Record<string, string> = {
  submitted: "In Review",
  approved: "Active",
  rejected: "Rejected",
  in_review: "In Review",
};

function ParticipantDetailPage() {
  const { participantId } = Route.useParams();
  const navigate = useNavigate();
  const entryQuery = useCompetitionEntry(participantId);
  const reviewEntry = useReviewEntry();
  const reviewBanner = useReviewBanner();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const entry = entryQuery.data;

  const handleApprove = () => {
    reviewEntry.mutate(
      { id: Number(participantId), status: "approved" },
      {
        onSuccess: () => toast.success("Participant approved"),
        onError: (err) => toast.error(err instanceof Error ? err.message : "Approval failed"),
      },
    );
  };

  const handleReject = () => {
    reviewEntry.mutate(
      { id: Number(participantId), status: "rejected", reason: rejectReason || "Entry rejected by admin" },
      {
        onSuccess: () => {
          toast.success("Participant rejected");
          setRejectOpen(false);
        },
        onError: (err) => toast.error(err instanceof Error ? err.message : "Rejection failed"),
      },
    );
  };

  return (
    <div>
      <PageHeader
        title="Participant Details"
        breadcrumbs={[
          { label: "Dashboard", to: ROUTES.DASHBOARD },
          { label: "Competition", to: ROUTES.COMPETITION },
          { label: "Participants", to: ROUTES.COMPETITION_PARTICIPANTS },
          { label: entry?.name ?? participantId },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate({ to: ROUTES.COMPETITION_PARTICIPANTS })}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Participants
            </Button>
            {entry && entry.status !== "approved" && (
              <Button onClick={handleApprove} disabled={reviewEntry.isPending}>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Approve
              </Button>
            )}
            {entry && entry.status !== "rejected" && (
              <Button variant="destructive" onClick={() => setRejectOpen(true)} disabled={reviewEntry.isPending}>
                <XCircle className="mr-2 h-4 w-4" />
                Reject
              </Button>
            )}
          </div>
        }
      />

      {entryQuery.isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {entryQuery.error && (
        <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          Unable to load participant from backend.
        </div>
      )}

      {entry && (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <SectionCard title="Basic Information" action={<StatusBadge status={STATUS_LABELS[entry.status] ?? entry.status} />}>
              <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
                <div><dt className="text-muted-foreground">Mandal / Pandal Name</dt><dd className="font-medium">{entry.name}</dd></div>
                <div><dt className="text-muted-foreground">Committee / Organization</dt><dd className="font-medium">{entry.committee_name || "—"}</dd></div>
                <div><dt className="text-muted-foreground">Established In</dt><dd className="font-medium">{entry.established_year ?? "—"}</dd></div>
                <div>
                  <dt className="text-muted-foreground">Location</dt>
                  <dd className="font-medium">{[entry.state_name, entry.district_name, entry.area_name].filter(Boolean).join(" › ") || "—"}</dd>
                </div>
                <div className="sm:col-span-2"><dt className="text-muted-foreground">Address</dt><dd className="font-medium">{entry.address || "—"}</dd></div>
                <div className="sm:col-span-2"><dt className="text-muted-foreground">Description</dt><dd>{entry.description || "—"}</dd></div>
              </dl>
            </SectionCard>

            <SectionCard title="Contact Details">
              <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
                <div><dt className="text-muted-foreground">Full Name</dt><dd className="font-medium">{entry.contact.name || "—"}</dd></div>
                <div><dt className="text-muted-foreground">Mobile Number</dt><dd className="font-medium">{entry.contact.phone || "—"}</dd></div>
                <div><dt className="text-muted-foreground">Email Address</dt><dd className="font-medium">{entry.contact.email || "—"}</dd></div>
                <div>
                  <dt className="text-muted-foreground">Participating As</dt>
                  <dd className="font-medium capitalize">{entry.contact.participant_type}</dd>
                </div>
              </dl>
            </SectionCard>

            <SectionCard title={`Banners (${entry.banners.length})`} description="Each approved banner earns bonus vote points. AI reviews first; uncertain cases need manual review.">
              {entry.banners.length === 0 ? (
                <p className="text-sm text-muted-foreground">No banners uploaded.</p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {entry.banners.map((banner) => (
                    <div key={banner.id} className="rounded-lg border p-3">
                      {banner.image_url ? (
                        <img src={banner.image_url} alt="" className="mb-3 h-40 w-full rounded object-cover" />
                      ) : (
                        <div className="mb-3 h-40 w-full rounded bg-muted" />
                      )}
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Banner {banner.slot}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(banner.uploaded_at).toLocaleDateString("en-IN")} · {banner.points} pts
                          </p>
                        </div>
                        <StatusBadge status={STATUS_LABELS[banner.status] ?? banner.status} />
                      </div>
                      {banner.status === "in_review" && (
                        <div className="mt-3 flex gap-2">
                          <Button
                            size="sm"
                            disabled={reviewBanner.isPending}
                            onClick={() =>
                              reviewBanner.mutate(
                                { id: banner.id, status: "approved" },
                                { onSuccess: () => toast.success("Banner approved") },
                              )
                            }
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={reviewBanner.isPending}
                            onClick={() =>
                              reviewBanner.mutate(
                                { id: banner.id, status: "rejected", reason: "Rejected by admin" },
                                { onSuccess: () => toast.success("Banner rejected") },
                              )
                            }
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          </div>

          <div className="space-y-4">
            <SectionCard title="Cover Image">
              {entry.cover_photo_url ? (
                <img src={entry.cover_photo_url} alt="" className="w-full rounded-lg object-cover" />
              ) : (
                <div className="flex h-40 items-center justify-center rounded-lg bg-muted text-sm text-muted-foreground">
                  No cover image
                </div>
              )}
            </SectionCard>

            <SectionCard title={`Uploaded Photos (${entry.photo_urls.length})`}>
              {entry.photo_urls.length === 0 ? (
                <p className="text-sm text-muted-foreground">No photos uploaded.</p>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {entry.photo_urls.map((url) => (
                    <img key={url} src={url} alt="" className="aspect-square w-full rounded object-cover" />
                  ))}
                </div>
              )}
            </SectionCard>

            <SectionCard title="Votes">
              <p className="text-3xl font-bold">{entry.total_votes.toLocaleString("en-IN")}</p>
              {entry.rank != null && <p className="text-sm text-muted-foreground">Rank #{entry.rank} overall</p>}
            </SectionCard>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        title="Reject participant?"
        description="The participant will see the rejection reason in the app."
        confirmLabel="Reject"
        onConfirm={handleReject}
      >
        <Textarea
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="Rejection reason"
          className="mt-2"
        />
      </ConfirmDialog>
    </div>
  );
}
