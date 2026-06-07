import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { X, ArrowLeft, ArrowRight, Send, Save, Calendar, Info } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Stepper } from "@/components/forms/Stepper";
import { FormSection } from "@/components/forms/FormSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { ROUTES } from "@/constants/routes.constants";
import { isSupportedNewsCategoryId } from "@/constants/newsCategories.constants";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useCategories, useCategorySubcategories } from "@/hooks/api/useCategories";
import { useChannels } from "@/hooks/api/useChannels";
import { useLanguages } from "@/hooks/api/useLanguages";
import { useRegions } from "@/hooks/api/useRegions";
import { useCreateNews } from "@/hooks/api/useNews";
import { isAuthApiError } from "@/lib/apiError";
import type { CreateAdminNewsPayload, NewsCreateStatus, NewsVisibilityScope } from "@/services/news.service";
import { newsService } from "@/services/news.service";

export const Route = createFileRoute("/_app/news/add")({
  component: AddNewsPage,
});

const STEPS = [
  { title: "Basic Information", description: "Add news basic details" },
  { title: "Multi Language Content", description: "Add content in multiple languages" },
  { title: "Visibility & Schedule", description: "Choose visibility and publish settings" },
];

const schema = z.object({
  newsSourceId: z.string().min(1, "Channel is required"),
  type: z.enum(["article", "video", "short", "story"]),
  languageCode: z.string().min(1, "Language is required"),
  categoryId: z.string().min(1, "Category is required"),
  subcategoryIds: z.array(z.string()).default([]),
  stateId: z.string().optional(),
  districtId: z.string().optional(),
  areaId: z.string().optional(),
  visibilityScope: z.enum(["all_india", "state", "district", "area"]),
  visibilityStateIds: z.array(z.string()).default([]),
  visibilityDistrictIds: z.array(z.string()).default([]),
  visibilityAreaIds: z.array(z.string()).default([]),
  title: z.string().min(3, "Title must be at least 3 characters").max(255),
  description: z.string().min(1, "Description is required").max(10000),
  bottomDescription: z.string().max(2000).optional(),
  sourceLink: z.string().url("Enter a valid source URL").or(z.literal("")).optional(),
  translationTitle: z.string().optional(),
  translationDescription: z.string().optional(),
  status: z.enum(["draft", "publish", "schedule"]),
  scheduledFor: z.string().optional(),
}).superRefine((value, ctx) => {
  if (value.visibilityScope === "state" && value.visibilityStateIds.length === 0) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["visibilityStateIds"], message: "Select at least one state for visibility" });
  }
  if (value.visibilityScope === "district" && value.visibilityDistrictIds.length === 0) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["visibilityDistrictIds"], message: "Select at least one district for visibility" });
  }
  if (value.visibilityScope === "area" && value.visibilityAreaIds.length === 0) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["visibilityAreaIds"], message: "Select at least one area for visibility" });
  }
  if (value.status === "schedule" && !value.scheduledFor) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["scheduledFor"], message: "Schedule date and time is required" });
  }
});

type FormValues = z.infer<typeof schema>;

function numberOrUndefined(value?: string) {
  return value ? Number(value) : undefined;
}

async function uploadToPresignedUrl(uploadUrl: string, file: File) {
  const response = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type || "application/octet-stream" },
    body: file,
  });
  if (!response.ok) throw new Error("Unable to upload media file");
}

function AddNewsPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const categoriesQuery = useCategories();
  const channelsQuery = useChannels();
  const languagesQuery = useLanguages();
  const regionsQuery = useRegions();
  const createNews = useCreateNews();

  const { register, setValue, watch, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: "article",
      visibilityScope: "all_india",
      visibilityStateIds: [],
      visibilityDistrictIds: [],
      visibilityAreaIds: [],
      subcategoryIds: [],
      status: "draft",
      sourceLink: "",
      bottomDescription: "",
    },
  });

  const values = watch();
  const subcategoriesQuery = useCategorySubcategories(values.categoryId || "", { page: 1, per_page: 100 });
  const newsCategories = useMemo(
    () => (categoriesQuery.data?.items ?? []).filter((category) => isSupportedNewsCategoryId(category.id)),
    [categoriesQuery.data?.items],
  );
  const newsSubcategories = useMemo(
    () => (subcategoriesQuery.data?.items ?? []).filter((subcategory) => isSupportedNewsCategoryId(subcategory.id)),
    [subcategoriesQuery.data?.items],
  );
  const states = regionsQuery.data ?? [];
  const selectedState = states.find((state) => String(state.id) === values.stateId);
  const districts = selectedState?.districts ?? [];
  const selectedDistrict = districts.find((district) => String(district.id) === values.districtId);
  const areas = selectedDistrict?.areas ?? [];

  const visibilityDistricts = states
    .filter((state) => values.visibilityStateIds?.includes(String(state.id)))
    .flatMap((state) => state.districts);
  const visibilityAreas = visibilityDistricts
    .filter((district) => values.visibilityDistrictIds?.includes(String(district.id)))
    .flatMap((district) => district.areas);

  const masterError = useMemo(() => {
    if (categoriesQuery.error || channelsQuery.error || languagesQuery.error || regionsQuery.error) {
      return "Some backend master data could not be loaded. Add News needs real channel, category, language, and region data.";
    }
    if (!categoriesQuery.isLoading && newsCategories.length === 0) {
      return "No backend-supported news categories are available. News create currently accepts only canonical category IDs 1 to 12.";
    }
    return undefined;
  }, [categoriesQuery.error, categoriesQuery.isLoading, channelsQuery.error, languagesQuery.error, newsCategories.length, regionsQuery.error]);

  const buildPayload = (data: FormValues): CreateAdminNewsPayload => {
    const visibility: CreateAdminNewsPayload["visibility"] = {
      scope: data.visibilityScope as NewsVisibilityScope,
    };
    if (data.visibilityScope === "state") visibility.state_ids = data.visibilityStateIds.map(Number);
    if (data.visibilityScope === "district") visibility.district_ids = data.visibilityDistrictIds.map(Number);
    if (data.visibilityScope === "area") visibility.area_ids = data.visibilityAreaIds.map(Number);

    const translations = data.translationTitle
      ? [{ language_code: data.languageCode, title: data.translationTitle, description: data.translationDescription || null }]
      : undefined;

    const payload: CreateAdminNewsPayload = {
      type: data.type,
      language_code: data.languageCode,
      title: data.title,
      description: data.description,
      bottom_description: data.bottomDescription || undefined,
      news_source_id: Number(data.newsSourceId),
      source_link: data.sourceLink || undefined,
      category_ids: [Number(data.categoryId)],
      visibility,
      translations,
    };

    const stateId = numberOrUndefined(data.stateId);
    const districtId = numberOrUndefined(data.districtId);
    const areaId = numberOrUndefined(data.areaId);
    if (data.visibilityScope !== "all_india" && (stateId || districtId || areaId)) {
      payload.location = {
        state_id: stateId ?? null,
        district_id: districtId ?? null,
        area_id: areaId ?? null,
      };
    }

    if (data.subcategoryIds.length > 0) {
      payload.subcategory_ids = data.subcategoryIds.map(Number);
    }

    return payload;
  };

  const submitNews = async (data: FormValues) => {
    try {
      if (!isSupportedNewsCategoryId(data.categoryId)) {
        toast.error("Selected category is not accepted by the backend News API. Please choose a canonical news category.");
        return;
      }
      const created = await createNews.mutateAsync(buildPayload(data));

      try {
        const categoryPayload = {
          category_ids: [Number(data.categoryId)],
          ...(data.subcategoryIds.length > 0 ? { subcategory_ids: data.subcategoryIds.map(Number) } : {}),
        };
        await newsService.updateCategories(created.id, categoryPayload);
      } catch {
        // Deployed backend may already persist categories during create; this compatibility call is best-effort.
      }

      if (thumbnailFile) {
        const upload = await newsService.requestThumbnailUploadUrl(created.id, {
          file_name: thumbnailFile.name,
          content_type: thumbnailFile.type || "image/jpeg",
        });
        await uploadToPresignedUrl(upload.upload_url, thumbnailFile);
        await newsService.confirmThumbnailUpload(created.id, { file_key: upload.file_key });
      }

      if (videoFile) {
        const upload = await newsService.requestVideoUploadUrl(created.id, {
          file_name: videoFile.name,
          content_type: videoFile.type || "video/mp4",
        });
        await uploadToPresignedUrl(upload.upload_url, videoFile);
        await newsService.confirmVideoUpload(created.id, { file_key: upload.file_key });
      }

      toast.success(thumbnailFile || videoFile ? "News and media uploaded" : "News create request sent to backend");
      navigate({ to: ROUTES.NEWS_ADMIN });
    } catch (err) {
      toast.error(isAuthApiError(err) ? "Backend admin auth is required to create news." : "Unable to create news or upload media");
    }
  };

  const goNext = () => setStep((current) => Math.min(current + 1, STEPS.length - 1));
  const goBack = () => (step === 0 ? navigate({ to: ROUTES.NEWS_ADMIN }) : setStep((current) => current - 1));

  return (
    <form onSubmit={handleSubmit(submitNews)}>
      <PageHeader
        title="Add News"
        breadcrumbs={[
          { label: "Dashboard", to: ROUTES.DASHBOARD },
          { label: "News Management" },
          { label: "Admin News", to: ROUTES.NEWS_ADMIN },
          { label: "Add News" },
        ]}
        actions={
          <Button variant="ghost" size="icon" type="button" onClick={() => navigate({ to: ROUTES.NEWS_ADMIN })}>
            <X className="h-5 w-5" />
          </Button>
        }
      />

      <div className="rounded-lg border bg-card p-6 mb-6">
        <Stepper steps={STEPS} current={step} />
      </div>

      {masterError && <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">{masterError}</div>}

      {step === 0 && (
        <FormSection title="Basic Information">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Select Channel *" error={errors.newsSourceId?.message}>
              <Select value={values.newsSourceId} onValueChange={(value) => setValue("newsSourceId", value)}>
                <SelectTrigger><SelectValue placeholder="Select Channel" /></SelectTrigger>
                <SelectContent>{(channelsQuery.data?.items ?? []).map((channel) => <SelectItem key={channel.id} value={channel.id}>{channel.name}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Type of Content *">
              <div className="grid grid-cols-4 rounded-md border p-1">
                {[
                  { label: "Article", value: "article" },
                  { label: "Video", value: "video" },
                  { label: "Shorts", value: "short" },
                  { label: "Story", value: "story" },
                ].map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setValue("type", type.value as FormValues["type"])}
                    className={cn("rounded text-sm py-1.5 transition", values.type === type.value ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted")}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Language *" error={errors.languageCode?.message}>
              <Select value={values.languageCode} onValueChange={(value) => setValue("languageCode", value)}>
                <SelectTrigger><SelectValue placeholder="Select Language" /></SelectTrigger>
                <SelectContent>{(languagesQuery.data?.items ?? []).map((language) => <SelectItem key={language.id} value={language.code}>{language.name}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
          </div>

          <Field label="Category *" error={errors.categoryId?.message}>
            <Select value={values.categoryId} onValueChange={(value) => { setValue("categoryId", value); setValue("subcategoryIds", []); }}>
              <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
              <SelectContent>
                {newsCategories.map((category) => <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              News API currently accepts only canonical backend category IDs 1 to 12. Admin-created categories are listed in Category Management but cannot be used for News until backend validation is updated.
            </p>
          </Field>

          {values.categoryId && (
            <div className="rounded-md border p-4 space-y-3">
              <Label>Subcategories</Label>
              {subcategoriesQuery.isLoading ? (
                <p className="text-sm text-muted-foreground">Loading subcategories...</p>
              ) : subcategoriesQuery.error ? (
                <p className="text-sm text-muted-foreground">Unable to load subcategories for this category.</p>
              ) : (
                <MultiCheckList
                  title="Subcategories"
                  items={newsSubcategories.map((subcategory) => ({ id: subcategory.id, name: subcategory.name }))}
                  selected={values.subcategoryIds ?? []}
                  onChange={(next) => setValue("subcategoryIds", next)}
                  emptyText="No subcategories found"
                />
              )}
            </div>
          )}

          <div className="rounded-md border p-4 space-y-3">
            <Label>News Location</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Select value={values.stateId} onValueChange={(value) => { setValue("stateId", value); setValue("districtId", undefined); setValue("areaId", undefined); }}>
                <SelectTrigger><SelectValue placeholder="Select State" /></SelectTrigger>
                <SelectContent>{states.map((state) => <SelectItem key={state.id} value={String(state.id)}>{state.name}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={values.districtId} onValueChange={(value) => { setValue("districtId", value); setValue("areaId", undefined); }}>
                <SelectTrigger><SelectValue placeholder="Select District" /></SelectTrigger>
                <SelectContent>{districts.map((district) => <SelectItem key={district.id} value={String(district.id)}>{district.name}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={values.areaId} onValueChange={(value) => setValue("areaId", value)}>
                <SelectTrigger><SelectValue placeholder="Select Area" /></SelectTrigger>
                <SelectContent>{areas.map((area) => <SelectItem key={area.id} value={String(area.id)}>{area.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border p-4 space-y-3">
            <Label>News Visibility *</Label>
            <RadioGroup
              value={values.visibilityScope}
              onValueChange={(value) => {
                setValue("visibilityScope", value as FormValues["visibilityScope"]);
                setValue("visibilityStateIds", []);
                setValue("visibilityDistrictIds", []);
                setValue("visibilityAreaIds", []);
              }}
              className="grid grid-cols-2 md:grid-cols-4 gap-3"
            >
              {[
                { value: "all_india", label: "All India" },
                { value: "state", label: "By State" },
                { value: "district", label: "By District" },
                { value: "area", label: "By Area" },
              ].map((option) => (
                <label key={option.value} className={cn("flex items-start gap-2 rounded-md border p-3 cursor-pointer", values.visibilityScope === option.value && "border-primary bg-primary/5")}>
                  <RadioGroupItem value={option.value} className="mt-0.5" />
                  <p className="text-sm font-medium">{option.label}</p>
                </label>
              ))}
            </RadioGroup>
            {values.visibilityScope !== "all_india" && (
              <div className="grid grid-cols-1 gap-3 rounded-md bg-muted/30 p-3 md:grid-cols-3">
                <MultiCheckList
                  title="States"
                  items={states.map((state) => ({ id: String(state.id), name: state.name }))}
                  selected={values.visibilityStateIds ?? []}
                  onChange={(next) => {
                    setValue("visibilityStateIds", next);
                    setValue("visibilityDistrictIds", []);
                    setValue("visibilityAreaIds", []);
                  }}
                />
                {(values.visibilityScope === "district" || values.visibilityScope === "area") && (
                  <MultiCheckList
                    title="Districts"
                    items={visibilityDistricts.map((district) => ({ id: String(district.id), name: district.name }))}
                    selected={values.visibilityDistrictIds ?? []}
                    onChange={(next) => {
                      setValue("visibilityDistrictIds", next);
                      setValue("visibilityAreaIds", []);
                    }}
                    emptyText="Select state first"
                  />
                )}
                {values.visibilityScope === "area" && (
                  <MultiCheckList
                    title="Areas"
                    items={visibilityAreas.map((area) => ({ id: String(area.id), name: area.name }))}
                    selected={values.visibilityAreaIds ?? []}
                    onChange={(next) => setValue("visibilityAreaIds", next)}
                    emptyText="Select district first"
                  />
                )}
              </div>
            )}
          </div>

          <Field label="Title *" error={errors.title?.message}><Input {...register("title")} placeholder="Enter news title" maxLength={255} /></Field>
          <Field label="Description *" error={errors.description?.message}><Textarea {...register("description")} placeholder="Write news description here..." className="min-h-[140px]" /></Field>
          <Field label="Source"><Input {...register("sourceLink")} placeholder="https://source-url.com" /></Field>
          <div>
            <Label className="mb-1.5 block">News Media</Label>
            <div className="grid gap-3 md:grid-cols-2">
              <Input type="file" accept="image/*" onChange={(event) => setThumbnailFile(event.target.files?.[0] ?? null)} />
              <Input type="file" accept="video/*" onChange={(event) => setVideoFile(event.target.files?.[0] ?? null)} />
            </div>
          </div>
          <Field label="Bottom Description"><Input {...register("bottomDescription")} placeholder="Optional bottom description" maxLength={2000} /></Field>
        </FormSection>
      )}

      {step === 1 && (
        <FormSection title="Multi Language Content" description="Backend supports translations. For now, one optional translation can be submitted with the selected language code.">
          <Field label="Translated Title"><Input {...register("translationTitle")} placeholder="Optional translated title" /></Field>
          <Field label="Translated Description"><Textarea {...register("translationDescription")} placeholder="Optional translated description" className="min-h-[160px]" /></Field>
        </FormSection>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <FormSection title="Visibility & Schedule" description="Private and poll/voting are not supported by backend yet.">
            <RadioGroup value={values.status} onValueChange={(value) => setValue("status", value as FormValues["status"])} className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { value: "draft", label: "Draft", desc: "Save as backend draft.", icon: Save },
                { value: "publish", label: "Publish", desc: "Request publish status if backend supports it.", icon: Send },
                { value: "schedule", label: "Schedule", desc: "Send scheduled_for with payload.", icon: Calendar },
              ].map((option) => {
                const Icon = option.icon;
                return (
                  <label key={option.value} className={cn("rounded-lg border p-4 cursor-pointer", values.status === option.value && "border-primary bg-primary/5")}>
                    <div className="mb-2 flex items-center gap-2"><Icon className="h-4 w-4" /><span className="text-sm font-semibold">{option.label}</span></div>
                    <p className="text-xs text-muted-foreground">{option.desc}</p>
                    <RadioGroupItem value={option.value} className="mt-3" />
                  </label>
                );
              })}
            </RadioGroup>
            {values.status === "schedule" && (
              <Field label="Schedule Date & Time" error={errors.scheduledFor?.message}>
                <Input type="datetime-local" {...register("scheduledFor")} />
              </Field>
            )}
          </FormSection>
          <div className="rounded-md border bg-blue-50/50 border-blue-100 p-3">
            <p className="text-sm font-semibold inline-flex items-center gap-1.5 mb-1"><Info className="h-4 w-4 text-blue-600" /> Backend TODO</p>
            <p className="text-xs text-muted-foreground">Poll/voting and private visibility are UI concepts only until backend endpoints/fields are added.</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mt-6">
        <Button type="button" variant="outline" onClick={goBack}>
          {step === 0 ? "Cancel" : (<><ArrowLeft className="h-4 w-4 mr-1" /> Back</>)}
        </Button>
        <div className="flex gap-2">
          {step === 2 && (
            <Button type="button" variant="outline" disabled={createNews.isPending} onClick={() => { setValue("status", "draft"); handleSubmit(submitNews)(); }}>
              Save as Draft
            </Button>
          )}
          {step < 2 ? (
            <Button type="button" onClick={goNext}>Save & Next <ArrowRight className="h-4 w-4 ml-1" /></Button>
          ) : (
            <Button type="submit" disabled={createNews.isPending}>
              <Send className="h-4 w-4 mr-1" /> {createNews.isPending ? "Submitting..." : "Submit"}
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label>{label}</Label>{children}{error && <p className="text-xs text-destructive">{error}</p>}</div>;
}

function MultiCheckList({
  title,
  items,
  selected,
  onChange,
  emptyText = "No options available",
}: {
  title: string;
  items: { id: string; name: string }[];
  selected: string[];
  onChange: (next: string[]) => void;
  emptyText?: string;
}) {
  const toggle = (id: string, checked: boolean) => {
    onChange(checked ? [...selected, id] : selected.filter((value) => value !== id));
  };

  return (
    <div className="rounded-md border bg-background p-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
      <div className="max-h-44 space-y-2 overflow-y-auto pr-1">
        {items.length === 0 ? (
          <p className="text-xs text-muted-foreground">{emptyText}</p>
        ) : (
          items.map((item) => (
            <label key={item.id} className="flex items-center gap-2 text-sm">
              <Checkbox checked={selected.includes(item.id)} onCheckedChange={(checked) => toggle(item.id, checked === true)} />
              <span>{item.name}</span>
            </label>
          ))
        )}
      </div>
    </div>
  );
}
