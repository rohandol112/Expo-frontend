import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Save } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { PageHeader } from "@/components/common/PageHeader";
import { FormSection } from "@/components/forms/FormSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useNotification, useUpdateNotification } from "@/hooks/api/useNotifications";
import { ROUTES } from "@/constants/routes.constants";

const editSchema = z.object({
  title: z.string().min(1, "Title is required"),
  message: z.string().min(1, "Message is required"),
  thumbnail_key: z.string().optional(),
  in_app_link: z.string().optional(),
  scheduled_at: z.string().optional(),
  expires_at: z.string().optional(),
});

type EditValues = z.infer<typeof editSchema>;

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Request failed";
}

function toLocalDateTime(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 16);
}

function toIsoDateTime(value?: string) {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function toBackendUrl(value?: string) {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;
  try {
    return new URL(trimmed, window.location.origin).toString();
  } catch {
    return trimmed;
  }
}

export const Route = createFileRoute("/_app/notifications/$notificationId/edit")({
  component: EditNotificationPage,
});

function EditNotificationPage() {
  const { notificationId } = Route.useParams();
  const navigate = useNavigate();
  const notificationQuery = useNotification(notificationId);
  const updateMutation = useUpdateNotification();
  const form = useForm<EditValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      title: "",
      message: "",
      thumbnail_key: "",
      in_app_link: "",
      scheduled_at: "",
      expires_at: "",
    },
  });

  useEffect(() => {
    const notification = notificationQuery.data;
    if (!notification) return;
    form.reset({
      title: notification.title,
      message: notification.message,
      thumbnail_key: notification.thumbnailKey || "",
      in_app_link: notification.inAppLink || "",
      scheduled_at: toLocalDateTime(notification.scheduledAt),
      expires_at: toLocalDateTime(notification.expiresAt),
    });
  }, [form, notificationQuery.data]);

  const submit = form.handleSubmit((values) => {
    updateMutation.mutate(
      {
        id: notificationId,
        payload: {
          title: values.title,
          message: values.message,
          thumbnail_key: values.thumbnail_key || undefined,
          in_app_link: toBackendUrl(values.in_app_link),
          scheduled_at: toIsoDateTime(values.scheduled_at),
          expires_at: toIsoDateTime(values.expires_at),
        },
      },
      {
        onSuccess: () => {
          toast.success("Notification updated.");
          navigate({ to: ROUTES.NOTIFICATIONS_VIEW(notificationId) });
        },
        onError: (error) => toast.error(getErrorMessage(error)),
      },
    );
  });

  return (
    <form onSubmit={submit}>
      <PageHeader
        title="Edit Notification"
        breadcrumbs={[
          { label: "Dashboard", to: ROUTES.DASHBOARD },
          { label: "Notifications", to: ROUTES.NOTIFICATIONS },
          { label: "Edit" },
        ]}
        actions={
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => navigate({ to: ROUTES.NOTIFICATIONS })}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button type="submit" disabled={updateMutation.isPending || notificationQuery.isLoading}>
              <Save className="mr-2 h-4 w-4" />
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        }
      />
      {notificationQuery.isError && (
        <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          Unable to load notification from backend.
        </div>
      )}
      <FormSection title="Notification Details" description="Backend allows updates for draft notifications only.">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Title" error={form.formState.errors.title?.message}>
            <Input {...form.register("title")} />
          </Field>
          <Field label="Thumbnail Key">
            <Input {...form.register("thumbnail_key")} />
          </Field>
        </div>
        <Field label="Message" error={form.formState.errors.message?.message}>
          <Textarea {...form.register("message")} className="min-h-[140px]" />
        </Field>
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="In-app Link" error={form.formState.errors.in_app_link?.message}>
            <Input {...form.register("in_app_link")} placeholder="https://example.com/news/123 or /news/123" />
          </Field>
          <Field label="Schedule Date">
            <Input type="datetime-local" {...form.register("scheduled_at")} />
          </Field>
          <Field label="Expiry Date">
            <Input type="datetime-local" {...form.register("expires_at")} />
          </Field>
        </div>
      </FormSection>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
}
