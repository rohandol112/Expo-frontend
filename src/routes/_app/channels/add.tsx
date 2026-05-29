import { createFileRoute } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Save } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { FormSection } from "@/components/forms/FormSection";
import { FileUploadBox } from "@/components/forms/FileUploadBox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { languages } from "@/mock/system.mock";
import { states, districts, areas } from "@/mock/location.mock";
import { ROUTES } from "@/constants/routes.constants";

export const Route = createFileRoute("/_app/channels/add")({ component: AddChannelPage });

const schema = z.object({
  name: z.string().min(2),
  website: z.string().url().or(z.literal("")),
  description: z.string().min(5),
  language: z.string().min(1),
  state: z.string().min(1),
  district: z.string().min(1),
  area: z.string().min(1),
  status: z.enum(["Active", "Inactive"]),
  allowUserPosts: z.boolean(),
});
type FormValues = z.infer<typeof schema>;

function AddChannelPage() {
  const { register, setValue, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { status: "Active", allowUserPosts: true, website: "" },
  });
  return (
    <form onSubmit={handleSubmit(() => undefined)}>
      <PageHeader title="Add Channel" breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "Channels", to: ROUTES.CHANNELS }, { label: "Add Channel" }]} actions={<Button type="submit"><Save className="mr-2 h-4 w-4" />Save Channel</Button>} />
      <div className="grid gap-6 xl:grid-cols-2">
        <FormSection title="Channel Details">
          <Field label="Channel Name" error={errors.name?.message}><Input {...register("name")} placeholder="Pune Local Desk" /></Field>
          <FileUploadBox label="Upload channel logo" hint="Recommended 512x512" accept="image/*" />
          <Field label="Language"><Select onValueChange={(v) => setValue("language", v)}><SelectTrigger><SelectValue placeholder="Select language" /></SelectTrigger><SelectContent>{languages.map((l) => <SelectItem key={l.id} value={l.name}>{l.name}</SelectItem>)}</SelectContent></Select></Field>
          <Field label="Website" error={errors.website?.message}><Input {...register("website")} placeholder="https://example.com" /></Field>
          <Field label="Description" error={errors.description?.message}><Textarea {...register("description")} placeholder="Short channel description" /></Field>
        </FormSection>
        <div className="space-y-6">
          <FormSection title="Location Assignment">
            <Field label="State"><Select onValueChange={(v) => setValue("state", v)}><SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger><SelectContent>{states.map((s) => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}</SelectContent></Select></Field>
            <Field label="District"><Select onValueChange={(v) => setValue("district", v)}><SelectTrigger><SelectValue placeholder="Select district" /></SelectTrigger><SelectContent>{districts.map((d) => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}</SelectContent></Select></Field>
            <Field label="Area/City"><Select onValueChange={(v) => setValue("area", v)}><SelectTrigger><SelectValue placeholder="Select area" /></SelectTrigger><SelectContent>{areas.map((a) => <SelectItem key={a.id} value={a.name}>{a.name}</SelectItem>)}</SelectContent></Select></Field>
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
