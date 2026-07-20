import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Calendar, MapPin, Send } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionCard } from "@/components/admin/SectionCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { notificationStatusLabel } from "@/services/adapters/notification.adapter";
import { useNotification, useSendNotification } from "@/hooks/api/useNotifications";
import { ROUTES } from "@/constants/routes.constants";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Request failed";
}

export const Route = createFileRoute("/_app/notifications/$notificationId/")({
  component: NotificationDetailPage,
});

function NotificationDetailPage() {
  const { notificationId } = Route.useParams();
  const navigate = useNavigate();
  const notificationQuery = useNotification(notificationId);
  const sendMutation = useSendNotification();
  const notification = notificationQuery.data;

  return (
    <div>
      <PageHeader
        title="Notification Details"
        breadcrumbs={[
          { label: "Dashboard", to: ROUTES.DASHBOARD },
          { label: "Notifications", to: ROUTES.NOTIFICATIONS },
          { label: notification?.title || notificationId },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate({ to: ROUTES.NOTIFICATIONS })}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            {/* Publishing already auto-sends; "Send" is a retry only, and once
                the push has gone out it must not be re-fired (duplicate pushes). */}
            {notification?.status === "published" && !notification?.sentAt && (
              <Button
                onClick={() =>
                  sendMutation.mutate(notificationId, {
                    onSuccess: () => toast.success("Notification sent."),
                    onError: (error) => toast.error(getErrorMessage(error)),
                  })
                }
                disabled={sendMutation.isPending}
              >
                <Send className="mr-2 h-4 w-4" />
                Send
              </Button>
            )}
            {notification?.sentAt && (
              <Button variant="outline" disabled>
                <Send className="mr-2 h-4 w-4" />
                Sent
              </Button>
            )}
          </div>
        }
      />

      {notificationQuery.isLoading && <SectionCard title="Loading">Loading notification...</SectionCard>}
      {notificationQuery.isError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          Unable to load notification from backend.
        </div>
      )}
      {notification && (
        <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
          <SectionCard title={notification.title}>
            <div className="space-y-4">
              <StatusBadge status={notificationStatusLabel(notification.status)} />
              <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                {notification.message || "No message provided."}
              </p>
              {notification.thumbnailUrl && (
                <img
                  src={notification.thumbnailUrl}
                  alt={notification.title}
                  className="max-h-80 rounded-lg border object-cover"
                />
              )}
            </div>
          </SectionCard>
          <SectionCard title="Target & Delivery">
            <div className="space-y-3 text-sm">
              <Info label="Language" value={notification.language} />
              <Info label="State" value={notification.state} icon={<MapPin className="h-4 w-4" />} />
              <Info label="District" value={notification.district} />
              <Info label="Area" value={notification.city} />
              <Info label="Sent On" value={notification.sentOn} icon={<Calendar className="h-4 w-4" />} />
              <Info label="Reach" value={(notification.reach ?? 0).toLocaleString()} />
              <Info label="Open" value={(notification.open ?? 0).toLocaleString()} />
              <Info label="In-app Link" value={notification.inAppLink || "—"} />
            </div>
          </SectionCard>
        </div>
      )}
    </div>
  );
}

function Info({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b pb-2 last:border-b-0">
      <span className="flex items-center gap-2 text-muted-foreground">
        {icon}
        {label}
      </span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}
