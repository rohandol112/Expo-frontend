import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ArrowLeft, ImageIcon, Save, Video } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { FormSection } from "@/components/forms/FormSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ROUTES } from "@/constants/routes.constants";
import { useCreateChannel, useChannelLogoUploadUrl } from "@/hooks/api/useChannels";
import { useLanguages } from "@/hooks/api/useLanguages";
import { useRegions } from "@/hooks/api/useRegions";
import { ApiError, isAuthApiError } from "@/lib/apiError";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/channels/add")({ component: AddChannelPage });

const schema = z.object({
  title: z.string().min(3, "Channel title must be at least 3 characters"),
  website: z.string().url().or(z.literal("")),
  companyName: z.string().optional(),
  description: z.string().max(250, "Description must be 250 characters or less").optional(),
  logoKey: z.string().optional(),
  language: z.string().min(1, "Language is required"),
  nationalVisibility: z.boolean(),
  state: z.string().optional(),
  district: z.string().optional(),
  area: z.string().optional(),
  status: z.enum(["Active", "Inactive"]),
  allowUserPosts: z.boolean(),
}).superRefine((value, ctx) => {
  if (value.nationalVisibility) return;
  if (!value.state) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "State is required", path: ["state"] });
  if (!value.district) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "District is required", path: ["district"] });
  if (!value.area) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Area is required", path: ["area"] });
});
type FormValues = z.infer<typeof schema>;

function AddChannelPage() {
  const navigate = useNavigate();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const createChannel = useCreateChannel();
  const uploadLogoMutation = useChannelLogoUploadUrl();
  const languagesQuery = useLanguages({ is_active: true });
  const { register, setValue, watch, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { status: "Active", allowUserPosts: true, nationalVisibility: true, website: "", language: "", state: "", district: "", area: "", logoKey: "" },
  });
  const selectedLanguage = watch("language");
  const nationalVisibility = watch("nationalVisibility");
  const selectedState = watch("state");
  const selectedDistrict = watch("district");
  const logoKey = watch("logoKey");
  const regionsQuery = useRegions({ language_code: selectedLanguage || "en" });
  const states = regionsQuery.data ?? [];
  const districts = useMemo(
    () => states.find((state) => String(state.id) === selectedState)?.districts ?? [],
    [selectedState, states],
  );
  const areas = useMemo(
    () => districts.find((district) => String(district.id) === selectedDistrict)?.areas ?? [],
    [selectedDistrict, districts],
  );

  useEffect(() => {
    if (imageFile) {
      const url = URL.createObjectURL(imageFile);
      setLogoPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setLogoPreviewUrl(null);
    }
  }, [imageFile]);

  useEffect(() => {
    setValue("state", "", { shouldValidate: false });
    setValue("district", "", { shouldValidate: false });
    setValue("area", "", { shouldValidate: false });
  }, [selectedLanguage, setValue]);

  useEffect(() => {
    setValue("district", "", { shouldValidate: false });
    setValue("area", "", { shouldValidate: false });
  }, [selectedState, setValue]);

  useEffect(() => {
    setValue("area", "", { shouldValidate: false });
  }, [selectedDistrict, setValue]);

  const onSubmit = async (data: FormValues) => {
    try {
      await createChannel.mutateAsync({
        title: data.title,
        company_name: data.companyName || undefined,
        language_code: data.language,
        description: data.description || undefined,
        website: data.website || undefined,
        logo_key: data.logoKey || undefined,
        ...(data.nationalVisibility
          ? { state_id: null, district_id: null, area_ids: [] }
          : { state_id: Number(data.state), district_id: Number(data.district), area_ids: [Number(data.area)] }),
        allow_user_posts: data.allowUserPosts,
        is_active: data.status === "Active",
      });
      toast.success("Channel saved");
      if (videoFile) toast.info("Selected video file will be uploaded after channel video upload endpoints are available.");
      navigate({ to: ROUTES.CHANNELS });
    } catch (err) {
      toast.error(isAuthApiError(err) ? "Backend admin auth is required to save channel." : err instanceof ApiError ? err.message : "Unable to save channel");
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
          <Field label="Channel Image">
            <div className="space-y-2">
              {logoPreviewUrl && (
                <div className="h-20 w-20 rounded-md overflow-hidden border bg-muted">
                  <img src={logoPreviewUrl} alt="Logo Preview" className="h-full w-full object-cover" />
                </div>
              )}
              <div className="flex gap-2">
                <MediaInput
                  icon={<ImageIcon className="h-5 w-5" />}
                  label={
                    uploadLogoMutation.isPending
                      ? "Uploading logo..."
                      : logoKey
                      ? `Logo ready: ${imageFile?.name || logoKey.substring(0, 15)}...`
                      : "Choose image file"
                  }
                  accept="image/*"
                  onChange={(file) => {
                    if (!file) return;
                    setImageFile(file);
                    uploadLogoMutation.mutate(
                      { file_name: file.name, content_type: file.type || "image/jpeg" },
                      {
                        onSuccess: async (result) => {
                          try {
                            await fetch(result.upload_url, {
                              method: "PUT",
                              body: file,
                              headers: { "Content-Type": file.type || "image/jpeg" },
                            });
                            setValue("logoKey", result.file_key, { shouldDirty: true });
                            toast.success("Logo uploaded.");
                          } catch (err) {
                            toast.error("Failed to upload logo to storage.");
                          }
                        },
                        onError: (err) => {
                          toast.error(err.message || "Failed to generate upload URL.");
                        },
                      }
                    );
                  }}
                />
              </div>
              {logoKey && (
                <div className="flex items-center text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">
                  <span>logo_key: {logoKey.substring(0, 10)}...</span>
                </div>
              )}
            </div>
          </Field>
          <Field label="Channel Video"><MediaInput icon={<Video className="h-5 w-5" />} label={videoFile?.name || "Choose video file"} accept="video/*" onChange={setVideoFile} /></Field>
          <p className="text-xs text-muted-foreground">Logo upload will be triggered immediately upon file selection. The generated key is submitted with the channel.</p>
          <Field label="Language" error={errors.language?.message}><Select value={selectedLanguage} onValueChange={(v) => setValue("language", v, { shouldValidate: true })}><SelectTrigger><SelectValue placeholder="Select language" /></SelectTrigger><SelectContent>{(languagesQuery.data?.items ?? []).map((l) => <SelectItem key={l.id} value={l.code}>{l.name}</SelectItem>)}</SelectContent></Select></Field>
          <Field label="Source URL" error={errors.website?.message}><Input {...register("website")} placeholder="https://example.com" /></Field>
          <Field label="Description" error={errors.description?.message}><Textarea {...register("description")} placeholder="Short channel description" /></Field>
        </FormSection>
        <div className="space-y-6">
          <FormSection title="Location Assignment">
            <label className="flex items-center justify-between rounded-lg border p-3 text-sm">
              <span>National Visibility</span>
              <Switch
                checked={nationalVisibility}
                onCheckedChange={(checked) => {
                  setValue("nationalVisibility", checked, { shouldValidate: true });
                  if (checked) {
                    setValue("state", "", { shouldValidate: false });
                    setValue("district", "", { shouldValidate: false });
                    setValue("area", "", { shouldValidate: false });
                  }
                }}
              />
            </label>
            {!nationalVisibility && (
              <>
                <Field label="State" error={errors.state?.message}><Select value={selectedState} onValueChange={(v) => setValue("state", v, { shouldValidate: true })} disabled={!selectedLanguage || regionsQuery.isLoading}><SelectTrigger><SelectValue placeholder={regionsQuery.isLoading ? "Loading states..." : "Select state"} /></SelectTrigger><SelectContent>{states.map((s) => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}</SelectContent></Select></Field>
                <Field label="District" error={errors.district?.message}><Select value={selectedDistrict} onValueChange={(v) => setValue("district", v, { shouldValidate: true })} disabled={!selectedState}><SelectTrigger><SelectValue placeholder="Select district" /></SelectTrigger><SelectContent>{districts.map((d) => <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>)}</SelectContent></Select></Field>
                <Field label="Area/City" error={errors.area?.message}><Select value={watch("area")} onValueChange={(v) => setValue("area", v, { shouldValidate: true })} disabled={!selectedDistrict}><SelectTrigger><SelectValue placeholder="Select area" /></SelectTrigger><SelectContent>{areas.map((a) => <SelectItem key={a.id} value={String(a.id)}>{a.name}</SelectItem>)}</SelectContent></Select></Field>
              </>
            )}
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

function MediaInput({ icon, label, accept, onChange }: { icon: React.ReactNode; label: string; accept: string; onChange: (file: File | null) => void }) {
  return (
    <label className="flex h-24 cursor-pointer items-center justify-center gap-3 rounded-md border border-dashed bg-background text-sm transition hover:border-primary/70 hover:bg-primary/5">
      <Input type="file" accept={accept} className="sr-only" onChange={(event) => onChange(event.target.files?.[0] ?? null)} />
      {icon}
      <span className="max-w-[220px] truncate">{label}</span>
    </label>
  );
}
