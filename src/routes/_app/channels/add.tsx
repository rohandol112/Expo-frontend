import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ArrowLeft, Save } from "lucide-react";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { FormSection } from "@/components/forms/FormSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ROUTES } from "@/constants/routes.constants";
import { useCreateChannel } from "@/hooks/api/useChannels";
import { useLanguages } from "@/hooks/api/useLanguages";
import { useRegions } from "@/hooks/api/useRegions";
import { isAuthApiError } from "@/lib/apiError";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/channels/add")({ component: AddChannelPage });

const schema = z.object({
  title: z.string().min(2),
  website: z.string().url().or(z.literal("")),
  companyName: z.string().optional(),
  language: z.string().optional(),
  state: z.string().optional(),
  district: z.string().optional(),
  area: z.string().optional(),
  status: z.enum(["Active", "Inactive"]),
  allowUserPosts: z.boolean(),
  imageUrl: z.string().url().or(z.literal("")),
});
type FormValues = z.infer<typeof schema>;

function AddChannelPage() {
  const navigate = useNavigate();
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const createChannel = useCreateChannel();
  const languagesQuery = useLanguages();
  const regionsQuery = useRegions();
  const { register, setValue, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { status: "Active", allowUserPosts: true, website: "", imageUrl: "" },
  });
  const states = regionsQuery.data ?? [];
  const districts = useMemo(() => states.flatMap((state) => state.districts), [states]);
  const areas = useMemo(() => districts.flatMap((district) => district.areas), [districts]);

  const onSubmit = async (data: FormValues) => {
    try {
      await createChannel.mutateAsync({
        title: data.title,
        company_name: data.companyName || undefined,
        source_url: data.website || "https://example.com",
        image_url: data.imageUrl || undefined,
        is_active: data.status === "Active",
      });
      toast.success("Channel saved");
      if (videoFile) toast.info("Channel video upload is pending backend upload support.");
      navigate({ to: ROUTES.CHANNELS });
    } catch (err) {
      toast.error(isAuthApiError(err) ? "Backend admin auth is required to save channel." : "Unable to save channel");
    }
  };
  return (
    <form onSubmit={handleSubmit(onSubmit, () => toast.error("Please fix the highlighted channel fields."))}>
      <PageHeader
        title="Add Channel"
        breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "Channels", to: ROUTES.CHANNELS }, { label: "Add Channel" }]}
        actions={
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => navigate({ to: ROUTES.CHANNELS })}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button type="submit" disabled={createChannel.isPending}><Save className="mr-2 h-4 w-4" />{createChannel.isPending ? "Saving..." : "Save Channel"}</Button>
          </div>
        }
      />
      <div className="grid gap-6 xl:grid-cols-2">
        <FormSection title="Channel Details">
          <Field label="Channel Title" error={errors.title?.message}><Input {...register("title")} placeholder="Pune Local Desk" /></Field>
          <Field label="Company Name"><Input {...register("companyName")} placeholder="Pehli Baat Media" /></Field>
          <Field label="Image URL" error={errors.imageUrl?.message}><Input {...register("imageUrl")} placeholder="https://example.com/logo.png" /></Field>
          <Field label="Channel Video"><Input type="file" accept="video/*" onChange={(event) => setVideoFile(event.target.files?.[0] ?? null)} /></Field>
          <p className="text-xs text-muted-foreground">TODO: Backend channel media supports `image_url` only. Location and video upload remain frontend-only until backend fields are available.</p>
          <Field label="Language"><Select onValueChange={(v) => setValue("language", v)}><SelectTrigger><SelectValue placeholder="Select language" /></SelectTrigger><SelectContent>{(languagesQuery.data?.items ?? []).map((l) => <SelectItem key={l.id} value={l.code}>{l.name}</SelectItem>)}</SelectContent></Select></Field>
          <Field label="Source URL" error={errors.website?.message}><Input {...register("website")} placeholder="https://example.com" /></Field>
          <Field label="Description"><Textarea placeholder="Location fields below are UI-only until backend supports them." /></Field>
        </FormSection>
        <div className="space-y-6">
          <FormSection title="Location Assignment">
            <Field label="State"><Select onValueChange={(v) => setValue("state", v)}><SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger><SelectContent>{states.map((s) => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}</SelectContent></Select></Field>
            <Field label="District"><Select onValueChange={(v) => setValue("district", v)}><SelectTrigger><SelectValue placeholder="Select district" /></SelectTrigger><SelectContent>{districts.map((d) => <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>)}</SelectContent></Select></Field>
            <Field label="Area/City"><Select onValueChange={(v) => setValue("area", v)}><SelectTrigger><SelectValue placeholder="Select area" /></SelectTrigger><SelectContent>{areas.map((a) => <SelectItem key={a.id} value={String(a.id)}>{a.name}</SelectItem>)}</SelectContent></Select></Field>
          </FormSection>
          <FormSection title="Additional Settings">
            <Field label="Status"><Select defaultValue="Active" onValueChange={(v) => setValue("status", v as FormValues["status"])}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Active">Active</SelectItem><SelectItem value="Inactive">Inactive</SelectItem></SelectContent></Select></Field>
            <label className="flex items-center justify-between rounded-lg border p-3 text-sm"><span>Allow User Posts</span><Switch defaultChecked onCheckedChange={(v) => setValue("allowUserPosts", v)} /></label>
          </FormSection>
        </div>
      </div>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label>{label}</Label>{children}{error && <p className="text-xs text-destructive">{error}</p>}</div>;
}
