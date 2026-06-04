import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Save } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { FormSection } from "@/components/forms/FormSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ROUTES } from "@/constants/routes.constants";
import { isAuthApiError } from "@/lib/apiError";
import { useChannel, useUpdateChannel } from "@/hooks/api/useChannels";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/channels/$channelId/edit")({ component: EditChannelPage });

const schema = z.object({
  title: z.string().min(2),
  website: z.string().url().or(z.literal("")),
  companyName: z.string().optional(),
  imageUrl: z.string().url().or(z.literal("")),
  status: z.enum(["Active", "Inactive"]),
});
type FormValues = z.infer<typeof schema>;

function EditChannelPage() {
  const { channelId } = Route.useParams();
  const navigate = useNavigate();
  const channelQuery = useChannel(channelId);
  const updateChannel = useUpdateChannel();
  const channel = channelQuery.data;
  const { register, setValue, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { website: "", imageUrl: "", status: "Active" },
  });

  useEffect(() => {
    if (!channel) return;
    reset({ title: channel.name, website: channel.website, companyName: channel.description, imageUrl: "", status: channel.status === "Inactive" ? "Inactive" : "Active" });
  }, [channel, reset]);

  const onSubmit = async (data: FormValues) => {
    try {
      await updateChannel.mutateAsync({
        id: channelId,
        payload: {
          title: data.title,
          company_name: data.companyName || undefined,
          source_url: data.website || "https://example.com",
          image_url: data.imageUrl || undefined,
          is_active: data.status === "Active",
        },
      });
      toast.success("Channel updated");
      navigate({ to: ROUTES.CHANNELS });
    } catch (err) {
      toast.error(isAuthApiError(err) ? "Backend admin auth is required to update channel." : "Unable to update channel");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <PageHeader title="Edit Channel" breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "Channels", to: ROUTES.CHANNELS }, { label: "Edit Channel" }]} actions={<Button type="submit" disabled={updateChannel.isPending}><Save className="mr-2 h-4 w-4" />{updateChannel.isPending ? "Saving..." : "Save Changes"}</Button>} />
      <FormSection title="Channel Details" description={channelQuery.error ? "Unable to load channel from backend." : channelQuery.isLoading ? "Loading channel details..." : "Location fields remain frontend-only until backend schema supports them."}>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Channel Title" error={errors.title?.message}><Input {...register("title")} /></Field>
          <Field label="Company Name"><Input {...register("companyName")} /></Field>
          <Field label="Source URL" error={errors.website?.message}><Input {...register("website")} /></Field>
          <Field label="Image URL" error={errors.imageUrl?.message}><Input {...register("imageUrl")} /></Field>
          <Field label="Status"><Select value={channel?.status === "Inactive" ? "Inactive" : "Active"} onValueChange={(v) => setValue("status", v as FormValues["status"])}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Active">Active</SelectItem><SelectItem value="Inactive">Inactive</SelectItem></SelectContent></Select></Field>
          <Field label="Location Notes"><Textarea placeholder="Location fields remain frontend-only until backend supports them." /></Field>
        </div>
      </FormSection>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label>{label}</Label>{children}{error && <p className="text-xs text-destructive">{error}</p>}</div>;
}
