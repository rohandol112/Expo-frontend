import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Image, Save, Send } from "lucide-react";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { PageHeader } from "@/components/common/PageHeader";
import { FormSection } from "@/components/forms/FormSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCreateNotification, useNotificationThumbnailUploadUrl } from "@/hooks/api/useNotifications";
import { useLanguages } from "@/hooks/api/useLanguages";
import { useRegions } from "@/hooks/api/useRegions";
import type { NotificationDeliveryOption } from "@/types/notification";
import { ROUTES } from "@/constants/routes.constants";

const notificationSchema = z
  .object({
    title: z.string().min(1, "Title is required").max(255),
    message: z.string().min(1, "Message is required").max(5000),
    language_code: z.string().min(1, "Language is required"),
    state_id: z.string().min(1, "State is required"),
    district_id: z.string().optional(),
    area_id: z.string().optional(),
    thumbnail_key: z.string().optional(),
    in_app_link: z.string().optional(),
    delivery_option: z.enum(["save_as_draft", "publish_now", "schedule_for_later"]),
    scheduled_at: z.string().optional(),
    expires_at: z.string().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.delivery_option === "schedule_for_later" && !value.scheduled_at) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["scheduled_at"],
        message: "Schedule date is required",
      });
    }
  });

type NotificationFormValues = z.infer<typeof notificationSchema>;

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Request failed";
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

export const Route = createFileRoute("/_app/notifications/add")({ component: CreateNotificationPage });

function CreateNotificationPage() {
  const navigate = useNavigate();
  const createMutation = useCreateNotification();
  const uploadUrlMutation = useNotificationThumbnailUploadUrl();
  const languagesQuery = useLanguages();

  const form = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      title: "",
      message: "",
      language_code: "en",
      state_id: "",
      district_id: "",
      area_id: "",
      thumbnail_key: "",
      in_app_link: "",
      delivery_option: "save_as_draft",
      scheduled_at: "",
      expires_at: "",
    },
  });

  const languageCode = form.watch("language_code");
  const stateId = form.watch("state_id");
  const districtId = form.watch("district_id");
  const deliveryOption = form.watch("delivery_option");
  const regionsQuery = useRegions({ language_code: languageCode || "en" });

  const selectedState = useMemo(
    () => (regionsQuery.data ?? []).find((state) => String(state.id) === stateId),
    [regionsQuery.data, stateId],
  );
  const selectedDistrict = useMemo(
    () => selectedState?.districts.find((district) => String(district.id) === districtId),
    [districtId, selectedState],
  );

  const submit = form.handleSubmit((values) => {
    createMutation.mutate(
      {
        title: values.title,
        message: values.message,
        language_code: values.language_code,
        state_id: Number(values.state_id),
        district_id: values.district_id ? Number(values.district_id) : undefined,
        area_id: values.area_id ? Number(values.area_id) : undefined,
        thumbnail_key: values.thumbnail_key || undefined,
        in_app_link: toBackendUrl(values.in_app_link),
        delivery_option: values.delivery_option as NotificationDeliveryOption,
        scheduled_at: toIsoDateTime(values.scheduled_at),
        expires_at: toIsoDateTime(values.expires_at),
      },
      {
        onSuccess: () => {
          toast.success("Notification saved.");
          navigate({ to: ROUTES.NOTIFICATIONS });
        },
        onError: (error) => toast.error(getErrorMessage(error)),
      },
    );
  });

  return (
    <form onSubmit={submit}>
      <PageHeader
        title="Create Custom Notification"
        breadcrumbs={[
          { label: "Dashboard", to: ROUTES.DASHBOARD },
          { label: "Notifications", to: ROUTES.NOTIFICATIONS },
          { label: "Create" },
        ]}
        actions={
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => navigate({ to: ROUTES.NOTIFICATIONS })}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              <Send className="mr-2 h-4 w-4" />
              {createMutation.isPending ? "Saving..." : "Save Notification"}
            </Button>
          </div>
        }
      />

      <FormSection title="Notification Details" description="Create draft, publish immediately, or schedule for later.">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Title" error={form.formState.errors.title?.message}>
            <Input {...form.register("title")} placeholder="Breaking update" />
          </Field>
          <Field label="Language" error={form.formState.errors.language_code?.message}>
            <Select
              value={languageCode}
              onValueChange={(value) => {
                form.setValue("language_code", value, { shouldValidate: true });
                form.setValue("state_id", "");
                form.setValue("district_id", "");
                form.setValue("area_id", "");
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {(languagesQuery.data?.items ?? []).map((language) => (
                  <SelectItem key={language.code} value={language.code}>
                    {language.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>

        <Field label="Message" error={form.formState.errors.message?.message}>
          <Textarea {...form.register("message")} placeholder="Write notification message..." className="min-h-[140px]" />
        </Field>
      </FormSection>

      <FormSection title="Targeting" description="Backend requires language and state. District and area are optional.">
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="State" error={form.formState.errors.state_id?.message}>
            <Select
              value={stateId}
              onValueChange={(value) => {
                form.setValue("state_id", value, { shouldValidate: true });
                form.setValue("district_id", "");
                form.setValue("area_id", "");
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                {(regionsQuery.data ?? []).map((state) => (
                  <SelectItem key={state.id} value={String(state.id)}>
                    {state.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="District">
            <Select
              value={districtId}
              onValueChange={(value) => {
                form.setValue("district_id", value);
                form.setValue("area_id", "");
              }}
              disabled={!selectedState}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select district" />
              </SelectTrigger>
              <SelectContent>
                {(selectedState?.districts ?? []).map((district) => (
                  <SelectItem key={district.id} value={String(district.id)}>
                    {district.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Area">
            <Select
              value={form.watch("area_id")}
              onValueChange={(value) => form.setValue("area_id", value)}
              disabled={!selectedDistrict}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select area" />
              </SelectTrigger>
              <SelectContent>
                {(selectedDistrict?.areas ?? []).map((area) => (
                  <SelectItem key={area.id} value={String(area.id)}>
                    {area.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>
      </FormSection>

      <FormSection title="Media & Delivery" description="Thumbnail upload is prepared through backend upload-url API.">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Thumbnail Key">
            <Input {...form.register("thumbnail_key")} placeholder="Stored object key" />
          </Field>
          <Field label="Thumbnail Image">
            <div className="flex gap-2">
              <Input
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  uploadUrlMutation.mutate(
                    { file_name: file.name, content_type: file.type || "image/jpeg" },
                    {
                      onSuccess: async (result) => {
                        try {
                          await fetch(result.upload_url, {
                            method: "PUT",
                            body: file,
                            headers: { "Content-Type": file.type || "image/jpeg" },
                          });
                          form.setValue("thumbnail_key", result.file_key, { shouldDirty: true });
                          toast.success("Thumbnail uploaded.");
                        } catch {
                          toast.error("Failed to upload thumbnail to storage.");
                        }
                      },
                      onError: (error) => toast.error(getErrorMessage(error)),
                    },
                  );
                }}
              />
              <Button type="button" variant="outline" disabled={uploadUrlMutation.isPending}>
                <Image className="h-4 w-4" />
              </Button>
            </div>
          </Field>
          <Field label="In-app Link" error={form.formState.errors.in_app_link?.message}>
            <Input {...form.register("in_app_link")} placeholder="https://example.com/news/123 or /news/123" />
          </Field>
          <Field label="Delivery Option">
            <Select
              value={deliveryOption}
              onValueChange={(value) => form.setValue("delivery_option", value as NotificationDeliveryOption)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select delivery option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="save_as_draft">Save as draft</SelectItem>
                <SelectItem value="publish_now">Publish now</SelectItem>
                <SelectItem value="schedule_for_later">Schedule for later</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Schedule Date" error={form.formState.errors.scheduled_at?.message}>
            <Input
              type="datetime-local"
              {...form.register("scheduled_at")}
              disabled={deliveryOption !== "schedule_for_later"}
            />
          </Field>
          <Field label="Expiry Date">
            <Input type="datetime-local" {...form.register("expires_at")} />
          </Field>
        </div>
      </FormSection>

      <div className="mt-6 flex justify-end">
        <Button type="submit" disabled={createMutation.isPending}>
          <Save className="mr-2 h-4 w-4" />
          {createMutation.isPending ? "Saving..." : "Save Notification"}
        </Button>
      </div>
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
