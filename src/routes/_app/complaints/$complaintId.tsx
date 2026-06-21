import { createFileRoute } from "@tanstack/react-router";
import { AlertCircle, FileText, Image as ImageIcon, MapPin, MessageSquareText, Send, Tag, User as UserIcon } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { StatsCard } from "@/components/common/StatsCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ROUTES } from "@/constants/routes.constants";
import {
  useComplaint,
  useComplaintMessages,
  useComplaintTimeline,
  useUpdateComplaintStatus,
  useAddComplaintMessage,
} from "@/hooks/api/useComplaints";
import { useComplaintChatSocket } from "@/hooks/api/useComplaintChat";
import { isAuthApiError } from "@/lib/apiError";
import type { ComplaintStatus } from "@/types/complaint";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/complaints/$complaintId")({ component: ComplaintDetailPage });

const STATUS_OPTIONS: ComplaintStatus[] = ["Pending", "In Review", "In Progress", "Awaiting Action", "Resolved", "Rejected"];

function ComplaintDetailPage() {
  const { complaintId } = Route.useParams();
  const complaintQuery = useComplaint(complaintId);
  const messagesQuery = useComplaintMessages(complaintId);
  const { connected: chatConnected } = useComplaintChatSocket(complaintId);
  const timelineQuery = useComplaintTimeline(complaintId);
  const updateStatus = useUpdateComplaintStatus();
  const addMessage = useAddComplaintMessage();

  const [statusDraft, setStatusDraft] = useState<ComplaintStatus | "">("");
  const [responseDraft, setResponseDraft] = useState("");
  const [messageDraft, setMessageDraft] = useState("");

  const complaint = complaintQuery.data;

  if (complaintQuery.isError) {
    return (
      <div>
        <PageHeader title="Complaint Detail" breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "Complaints", to: ROUTES.COMPLAINTS }, { label: complaintId }]} />
        <div className="rounded-lg border bg-card p-10">
          <EmptyState
            icon={AlertCircle}
            title="Unable to load complaint"
            description={isAuthApiError(complaintQuery.error) ? "Backend admin auth is required to view complaint details." : "The complaint could not be loaded from the backend."}
          />
        </div>
      </div>
    );
  }

  const currentStatus = statusDraft || complaint?.status || "";

  return (
    <div>
      <PageHeader
        title={complaint?.title ?? "Complaint Detail"}
        breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "Complaints", to: ROUTES.COMPLAINTS }, { label: complaint?.number ?? complaintId }]}
      />

      <div className="grid gap-4 md:grid-cols-4">
        <StatsCard title="Status" value={complaint?.status ?? "—"} icon={AlertCircle} variant="violet" />
        <StatsCard title="Priority" value={complaint?.priority ?? "—"} icon={Tag} variant="amber" />
        <StatsCard title="Category" value={complaint?.category ?? "—"} icon={FileText} variant="blue" />
        <StatsCard title="Assigned To" value={complaint?.assignedTo ?? "—"} icon={UserIcon} variant="green" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <div className="rounded-lg border bg-card p-6">
            <dl className="grid gap-4 md:grid-cols-2">
              <Detail label="Complaint Number" value={complaint?.number} />
              <Detail label="Sub Category" value={complaint?.subCategory} />
              <Detail label="Reported By" value={complaint?.reportedBy} />
              <Detail label="Reporter Phone" value={complaint?.reportedByPhone} />
              <Detail label="Language" value={complaint?.language} />
              <Detail label="Location" value={complaint?.location} />
              <Detail label="Registered On" value={complaint?.registeredOn} />
              <Detail label="Last Updated" value={complaint?.updatedOn} />
              <Detail label="Resolved On" value={complaint?.resolvedOn} />
            </dl>
          </div>

          <div className="rounded-lg border bg-card p-6">
            <p className="mb-3 flex items-center gap-2 text-sm font-semibold"><FileText className="h-4 w-4" /> Description</p>
            <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{complaint?.description || "No description available."}</p>
          </div>

          {complaint?.adminResponse && (
            <div className="rounded-lg border bg-card p-6">
              <p className="mb-3 flex items-center gap-2 text-sm font-semibold"><MessageSquareText className="h-4 w-4" /> Admin Response</p>
              <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{complaint.adminResponse}</p>
            </div>
          )}

          <div className="rounded-lg border bg-card p-6">
            <p className="mb-3 flex items-center gap-2 text-sm font-semibold"><ImageIcon className="h-4 w-4" /> Attached Images</p>
            {complaint?.images?.length ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {complaint.images.map((url) => (
                  <a key={url} href={url} target="_blank" rel="noreferrer" className="block aspect-square overflow-hidden rounded-md border">
                    <img src={url} alt="Complaint attachment" className="h-full w-full object-cover" />
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No images attached to this complaint.</p>
            )}
          </div>

          <div className="rounded-lg border bg-card p-6">
            <p className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <MessageSquareText className="h-4 w-4" /> Conversation
              <span className="ml-auto flex items-center gap-1.5 text-xs font-normal text-muted-foreground">
                <span className={`h-2 w-2 rounded-full ${chatConnected ? "bg-green-500" : "bg-muted-foreground/40"}`} />
                {chatConnected ? "Live" : "Offline"}
              </span>
            </p>
            <div className="space-y-3">
              {messagesQuery.isLoading && <p className="text-sm text-muted-foreground">Loading messages...</p>}
              {!messagesQuery.isLoading && (messagesQuery.data?.length ?? 0) === 0 && (
                <p className="text-sm text-muted-foreground">No messages yet. Start the conversation below.</p>
              )}
              {(messagesQuery.data ?? []).map((msg) => (
                <div key={msg.id} className={`rounded-md border p-3 text-sm ${msg.isAdmin ? "border-primary/30 bg-primary/5" : "bg-muted/30"}`}>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="font-medium">{msg.senderName} {msg.isAdmin && <span className="text-xs font-normal text-primary">(Admin)</span>}</span>
                    <span className="text-xs text-muted-foreground">{msg.createdAt}</span>
                  </div>
                  <p className="text-muted-foreground">{msg.message}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Textarea
                value={messageDraft}
                onChange={(e) => setMessageDraft(e.target.value)}
                placeholder="Write a reply to the complainant..."
                className="min-h-[44px] flex-1"
              />
              <Button
                disabled={!messageDraft.trim() || addMessage.isPending}
                onClick={async () => {
                  try {
                    await addMessage.mutateAsync({ id: complaintId, message: messageDraft.trim() });
                    setMessageDraft("");
                    toast.success("Message sent");
                  } catch (err) {
                    toast.error(isAuthApiError(err) ? "Backend admin auth is required to send messages." : "Unable to send message");
                  }
                }}
              >
                <Send className="mr-2 h-4 w-4" /> Send
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border bg-card p-6">
            <p className="mb-3 text-sm font-semibold">Update Status</p>
            <div className="space-y-3">
              <Select value={currentStatus || undefined} onValueChange={(value) => setStatusDraft(value as ComplaintStatus)}>
                <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}
                </SelectContent>
              </Select>
              <Textarea
                value={responseDraft}
                onChange={(e) => setResponseDraft(e.target.value)}
                placeholder="Add an admin response (optional)"
                className="min-h-[80px]"
              />
              <Button
                className="w-full"
                disabled={!currentStatus || updateStatus.isPending}
                onClick={async () => {
                  if (!currentStatus) return;
                  try {
                    await updateStatus.mutateAsync({ id: complaintId, status: currentStatus as ComplaintStatus, adminResponse: responseDraft.trim() || undefined });
                    toast.success("Complaint status updated");
                    setStatusDraft("");
                    setResponseDraft("");
                  } catch (err) {
                    toast.error(isAuthApiError(err) ? "Backend admin auth is required to update complaint status." : "Unable to update complaint status");
                  }
                }}
              >
                Update Status
              </Button>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-6">
            <p className="mb-3 flex items-center gap-2 text-sm font-semibold"><MapPin className="h-4 w-4" /> Timeline</p>
            <div className="space-y-4">
              {timelineQuery.isLoading && <p className="text-sm text-muted-foreground">Loading timeline...</p>}
              {!timelineQuery.isLoading && (timelineQuery.data?.length ?? 0) === 0 && (
                <p className="text-sm text-muted-foreground">No status changes recorded yet.</p>
              )}
              {(timelineQuery.data ?? []).map((entry, index) => (
                <div key={entry.id} className="relative pl-5">
                  {index !== (timelineQuery.data?.length ?? 0) - 1 && <span className="absolute left-[5px] top-4 h-full w-px bg-border" />}
                  <span className="absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full bg-primary" />
                  <div className="flex items-center gap-2"><StatusBadge status={entry.status} /></div>
                  {entry.note && <p className="mt-1 text-sm text-muted-foreground">{entry.note}</p>}
                  <p className="mt-1 text-xs text-muted-foreground">{entry.changedByName} · {entry.createdAt}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value?: string | number }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm font-medium">{value || "—"}</dd>
    </div>
  );
}
