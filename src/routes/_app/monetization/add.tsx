import { createFileRoute } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Save } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { FormSection } from "@/components/forms/FormSection";
import { MediaUploadBox } from "@/components/forms/MediaUploadBox";
import { LocationSelector } from "@/components/forms/LocationSelector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { languages } from "@/mock/system.mock";
import { ROUTES } from "@/constants/routes.constants";

export const Route = createFileRoute("/_app/monetization/add")({ component: AddAdPage });

const schema = z.object({
  name: z.string().min(2),
  type: z.string().min(1),
  placement: z.string().min(1),
  language: z.string().min(1),
  status: z.enum(["Active", "Inactive", "Scheduled", "Paused"]),
});
type FormValues = z.infer<typeof schema>;

function AddAdPage() {
  const { register, setValue, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { status: "Active" },
  });

  return (
    <form onSubmit={handleSubmit(() => undefined)}>
      <PageHeader title="Add New Ad" breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "Monetization", to: ROUTES.MONETIZATION }, { label: "Add New Ad" }]} actions={<Button type="submit"><Save className="mr-2 h-4 w-4" />Save Ad</Button>} />
      <FormSection title="Ad Details">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Ad Title / Name" error={errors.name?.message}><Input {...register("name")} placeholder="Home Feed Banner" /></Field>
          <Field label="Ad Type"><Select onValueChange={(v) => setValue("type", v)}><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger><SelectContent>{["Banner", "Interstitial", "Native", "Video"].map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></Field>
          <Field label="Ad Placement"><Select onValueChange={(v) => setValue("placement", v)}><SelectTrigger><SelectValue placeholder="Select placement" /></SelectTrigger><SelectContent>{["Home Feed", "News Detail", "Listings", "Category Page"].map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></Field>
          <Field label="Language"><Select onValueChange={(v) => setValue("language", v)}><SelectTrigger><SelectValue placeholder="Select language" /></SelectTrigger><SelectContent>{languages.map((l) => <SelectItem key={l.id} value={l.name}>{l.name}</SelectItem>)}</SelectContent></Select></Field>
          <Field label="Status"><Select defaultValue="Active" onValueChange={(v) => setValue("status", v as FormValues["status"])}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["Active", "Inactive", "Scheduled", "Paused"].map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></Field>
        </div>
        <LocationSelector label="Ad Location" />
        <div>
          <Label className="mb-1.5 block">Ad Media</Label>
          <MediaUploadBox imageLabel="Upload Ad Image" videoLabel="Upload Ad Video" />
        </div>
      </FormSection>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label>{label}</Label>{children}{error && <p className="text-xs text-destructive">{error}</p>}</div>;
}
