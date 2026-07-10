import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Save, ImageIcon } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { FormSection } from "@/components/forms/FormSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ROUTES } from "@/constants/routes.constants";
import { ApiError, isAuthApiError } from "@/lib/apiError";
import { useChannel, useUpdateChannel, useChannelLogoUploadUrl } from "@/hooks/api/useChannels";
import { useLanguages } from "@/hooks/api/useLanguages";
import { useRegions } from "@/hooks/api/useRegions";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/channels/$channelId/edit")({ component: EditChannelPage });

const schema = z.object({
  title: z.string().min(2),
  website: z.string().url().or(z.literal("")),
  companyName: z.string().optional(),
  description: z.string().max(250).optional(),
  logoKey: z.string().optional(),
  language: z.string().optional(),
  nationalVisibility: z.boolean(),
  state: z.string().optional(),
  district: z.string().optional(),
  area: z.string().optional(),
  status: z.enum(["Active", "Inactive"]),
});
type FormValues = z.infer<typeof schema>;

function EditChannelPage() {
  const { channelId } = Route.useParams();
  const navigate = useNavigate();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const channelQuery = useChannel(channelId);
  const updateChannel = useUpdateChannel();
  const uploadLogoMutation = useChannelLogoUploadUrl();
  const languagesQuery = useLanguages({ is_active: true });
  const channel = channelQuery.data;
  const { register, setValue, watch, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { website: "", status: "Active", language: "", nationalVisibility: true, state: "", district: "", area: "", logoKey: "" },
  });
  const selectedLanguage = watch("language");
  const nationalVisibility = watch("nationalVisibility");
  const selectedState = watch("state");
  const selectedDistrict = watch("district");
  const selectedArea = watch("area");
  const logoKey = watch("logoKey");
  const regionsQuery = useRegions({ language_code: selectedLanguage || channel?.languageCode || "en" });
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
    } else if (channel?.logoUrl) {
      setLogoPreviewUrl(channel.logoUrl);
    } else {
      setLogoPreviewUrl(null);
    }
  }, [imageFile, channel?.logoUrl]);

  useEffect(() => {
    if (!channel) return;
    reset({
      title: channel.name,
      website: channel.website,
      companyName: channel.description === "—" ? "" : channel.description,
      description: "",
      logoKey: channel.logoKey ?? "",
      language: channel.languageCode ?? "",
      nationalVisibility: !channel.stateId,
      state: channel.stateId ? String(channel.stateId) : "",
      district: channel.districtId ? String(channel.districtId) : "",
      area: channel.areaIds?.[0] ? String(channel.areaIds[0]) : "",
      status: channel.status === "Inactive" ? "Inactive" : "Active",
    });
  }, [channel, reset]);

  const onSubmit = async (data: FormValues) => {
    try {
      await updateChannel.mutateAsync({
        id: channelId,
        payload: {
          title: data.title,
          company_name: data.companyName || undefined,
          description: data.description || undefined,
          website: data.website || undefined,
          language_code: data.language || undefined,
          logo_key: data.logoKey || undefined,
          ...(data.nationalVisibility
            ? { state_id: null, district_id: null, area_ids: [] }
            : data.state && data.district && data.area
            ? { state_id: Number(data.state), district_id: Number(data.district), area_ids: [Number(data.area)] }
            : {}),
          is_active: data.status === "Active",
        },
      });
      toast.success("Channel updated");
      navigate({ to: ROUTES.CHANNELS });
    } catch (err) {
      toast.error(isAuthApiError(err) ? "Backend admin auth is required to update channel." : err instanceof ApiError ? err.message : "Unable to update channel");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <PageHeader title="Edit Channel" breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "Channels", to: ROUTES.CHANNELS }, { label: "Edit Channel" }]} actions={<Button type="submit" disabled={updateChannel.isPending}><Save className="mr-2 h-4 w-4" />{updateChannel.isPending ? "Saving..." : "Save Changes"}</Button>} />
      <FormSection title="Channel Details" description={channelQuery.error ? "Unable to load channel from backend." : channelQuery.isLoading ? "Loading channel details..." : "Update channel details and backend location assignment."}>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Channel Title" error={errors.title?.message}><Input {...register("title")} /></Field>
          <Field label="Company Name"><Input {...register("companyName")} /></Field>
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
            </div>
            {logoKey && (
                <div className="flex items-center text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">
                  <span>logo_key: {logoKey.substring(0, 10)}...</span>
                </div>
              )}
          </Field>
          <Field label="Source URL" error={errors.website?.message}><Input {...register("website")} /></Field>
          <Field label="Description" error={errors.description?.message}><Textarea {...register("description")} placeholder="Short channel description" /></Field>
          <Field label="Language"><Select value={selectedLanguage} onValueChange={(v) => setValue("language", v, { shouldValidate: true })}><SelectTrigger><SelectValue placeholder="Select language" /></SelectTrigger><SelectContent>{(languagesQuery.data?.items ?? []).map((l) => <SelectItem key={l.id} value={l.code}>{l.name}</SelectItem>)}</SelectContent></Select></Field>
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
              <Field label="State"><Select value={selectedState} onValueChange={(v) => setValue("state", v, { shouldValidate: true })} disabled={!selectedLanguage || regionsQuery.isLoading}><SelectTrigger><SelectValue placeholder={regionsQuery.isLoading ? "Loading states..." : "Select state"} /></SelectTrigger><SelectContent>{states.map((s) => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}</SelectContent></Select></Field>
              <Field label="District"><Select value={selectedDistrict} onValueChange={(v) => setValue("district", v, { shouldValidate: true })} disabled={!selectedState}><SelectTrigger><SelectValue placeholder="Select district" /></SelectTrigger><SelectContent>{districts.map((d) => <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>)}</SelectContent></Select></Field>
              <Field label="Area/City"><Select value={selectedArea} onValueChange={(v) => setValue("area", v, { shouldValidate: true })} disabled={!selectedDistrict}><SelectTrigger><SelectValue placeholder="Select area" /></SelectTrigger><SelectContent>{areas.map((a) => <SelectItem key={a.id} value={String(a.id)}>{a.name}</SelectItem>)}</SelectContent></Select></Field>
            </>
          )}
          <Field label="Status"><Select value={watch("status")} onValueChange={(v) => setValue("status", v as FormValues["status"])}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Active">Active</SelectItem><SelectItem value="Inactive">Inactive</SelectItem></SelectContent></Select></Field>
        </div>
      </FormSection>
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
