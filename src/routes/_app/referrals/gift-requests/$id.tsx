import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AlertTriangle, ArrowLeft, CheckCircle2, Eye, XCircle, MessageSquare } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { useLightbox } from "@/components/common/ImageLightbox";
import { StatusBadge } from "@/components/common/StatusBadge";
import { FormSection } from "@/components/forms/FormSection";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useGiftRequest, useApproveGiftRequest, useRejectGiftRequest } from "@/hooks/api/useGiftRequests";
import { ROUTES } from "@/constants/routes.constants";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/referrals/gift-requests/$id")({ component: GiftRequestDetailsPage });

function Detail({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm font-medium">{value || "—"}</dd>
    </div>
  );
}

function PhotoCard({ label, number, file, onView }: { label: string; number?: string; file?: string; onView: (src: string, caption: string) => void }) {
  // `file` is a short-lived signed URL for the uploaded document photo.
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{number || "—"}</p>
      {file ? (
        <div className="space-y-1">
          <button type="button" onClick={() => onView(file, label)} className="block overflow-hidden rounded-md border">
            <img src={file} alt={label} className="h-28 w-44 object-cover" />
          </button>
          <button type="button" onClick={() => onView(file, label)} className="flex items-center gap-1 text-xs text-primary hover:underline">
            <Eye className="h-3.5 w-3.5" /> View Full Image
          </button>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">No photo uploaded</p>
      )}
    </div>
  );
}

function GiftRequestDetailsPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const requestQuery = useGiftRequest(id);
  const approve = useApproveGiftRequest();
  const reject = useRejectGiftRequest();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const { openZoom, lightbox } = useLightbox();

  const request = requestQuery.data;
  const backToList = () => navigate({ to: ROUTES.REFERRALS_GIFT_REQUESTS });

  if (!requestQuery.isLoading && !request) {
    return (
      <div>
        <PageHeader title="Gift Request Details" breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "Referrals & Points", to: ROUTES.REFERRALS }, { label: "Gift Request", to: ROUTES.REFERRALS_GIFT_REQUESTS }, { label: "Request Details" }]} />
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">Gift request not found.</div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Gift Request Details"
        description="View user gift collection details submitted from the app."
        breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "Referrals & Points", to: ROUTES.REFERRALS }, { label: "Gift Request", to: ROUTES.REFERRALS_GIFT_REQUESTS }, { label: "Request Details" }]}
        actions={
          <Button variant="outline" onClick={backToList}><ArrowLeft className="mr-2 h-4 w-4" />Back to Gift Requests</Button>
        }
      />

      {request && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <StatusBadge status={request.status} />
            <span className="text-sm text-muted-foreground">{request.rankOrGift} · Requested {request.requestedAt}</span>
          </div>

          <FormSection title="Gift">
            <dl className="grid gap-4 md:grid-cols-3">
              <Detail label="Gift" value={request.giftName} />
              <Detail label="Gift Value" value={request.giftValue != null ? `₹${request.giftValue.toLocaleString("en-IN")}` : "Not set"} />
              <Detail label="Rewards Location" value={request.locationTitle ?? undefined} />
            </dl>
            {(request.giftPhoto || request.deliveryPhoto) && (
              <div className="flex flex-wrap gap-6">
                {request.giftPhoto && <PhotoCard label="Gift Photo" file={request.giftPhoto} onView={openZoom} />}
                {request.deliveryPhoto && <PhotoCard label="Delivery Photo" file={request.deliveryPhoto} onView={openZoom} />}
              </div>
            )}
          </FormSection>

          <FormSection title="1. Personal Information">
            <dl className="grid gap-4 md:grid-cols-2">
              <Detail label="Full Name" value={request.name} />
              <Detail label="Contact Phone Number" value={request.phone} />
              <Detail label="Address" value={request.address} />
              <Detail label="Date of Birth" value={request.dob} />
            </dl>
          </FormSection>

          <FormSection title="2. Documents">
            <div className="flex items-start gap-2 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              {request.panRequired
                ? "PAN card is mandatory for this gift's value, and Aadhaar card is mandatory for verification."
                : "Aadhaar card is mandatory for verification. PAN is needed only for higher-value gifts (see Settings)."}
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <PhotoCard label="PAN Card" number={request.panNumber} file={request.panPhoto} onView={openZoom} />
              <PhotoCard label="Aadhaar Card" number={request.aadhaarNumber} file={request.aadhaarPhoto} onView={openZoom} />
            </div>
          </FormSection>

          <FormSection title="3. Additional Message (Optional)">
            <p className="flex items-start gap-2 text-sm">
              <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              {request.message || "No message provided."}
            </p>
            {request.rejectionReason && (
              <p className="flex items-start gap-2 text-sm text-rose-700">
                <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
                Rejection reason: {request.rejectionReason}
              </p>
            )}
          </FormSection>

          <div className="flex flex-wrap justify-end gap-2">
            {request.status === "Pending" && (
              <Button
                className="bg-emerald-600 font-bold text-white hover:bg-emerald-700"
                disabled={approve.isPending}
                onClick={async () => {
                  try {
                    await approve.mutateAsync(request.id);
                  } catch {
                    return;
                  }
                  toast.success("Gift request approved");
                }}
              >
                <CheckCircle2 className="mr-1.5 h-4 w-4" />Approve Request
              </Button>
            )}
            {request.status === "Pending" && (
              <Button className="bg-red-600 font-bold text-white hover:bg-red-700" disabled={reject.isPending} onClick={() => setRejectOpen(true)}>
                <XCircle className="mr-1.5 h-4 w-4" />Reject Request
              </Button>
            )}
          </div>
        </div>
      )}

      <ConfirmDialog
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        title="Reject Gift Request"
        description={`Tell the user why "${request?.name ?? ""}"'s request is rejected.`}
        confirmLabel="Confirm Rejection"
        destructive
        onConfirm={async () => {
          if (!request) return;
          try {
            await reject.mutateAsync({ id: request.id, reason: rejectReason.trim() || undefined });
          } catch {
            return;
          }
          toast.success("Gift request rejected");
          setRejectOpen(false);
          setRejectReason("");
        }}
      >
        <Textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Reason for rejection" rows={3} />
      </ConfirmDialog>

      {lightbox}
    </div>
  );
}
