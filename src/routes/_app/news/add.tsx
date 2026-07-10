import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useId, useMemo, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { X, ArrowLeft, ArrowRight, Send, Save, Calendar, Sparkles, Plus, Trash2, CheckCircle2, AlertCircle, Circle, Bold, Italic, Underline, List, Image as ImageIcon, Quote, Video, type LucideIcon } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useCategories, useCategorySubcategories } from "@/hooks/api/useCategories";
import { useChannels } from "@/hooks/api/useChannels";
import { useLanguages } from "@/hooks/api/useLanguages";
import { useRegions } from "@/hooks/api/useRegions";
import { useAdminUserSearch, useAutoFillNewsTranslations, useCreateNews } from "@/hooks/api/useNews";
import { isAuthApiError } from "@/lib/apiError";
import type { CreateAdminNewsPayload, NewsVisibilityScope } from "@/services/news.service";
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
  visibilityScope: z.enum(["all_india", "state", "district", "area", "private"]),
  visibilityStateIds: z.array(z.string()).default([]),
  visibilityDistrictIds: z.array(z.string()).default([]),
  visibilityAreaIds: z.array(z.string()).default([]),
  visibilityUserIds: z.array(z.string()).default([]),
  title: z.string().min(3, "Title must be at least 3 characters").max(255),
  description: z.string().min(1, "Description is required").max(10000),
  bottomDescription: z.string().max(2000).optional(),
  sourceLink: z.string().url("Enter a valid source URL").or(z.literal("")).optional(),
  translationTitle: z.string().optional(),
  translationDescription: z.string().optional(),
  status: z.enum(["draft", "schedule"]),
  scheduledFor: z.string().optional(),
  enablePoll: z.boolean().default(false),
  pollQuestion: z.string().optional(),
  pollOptions: z.array(z.string()).default([]),
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
  if (value.visibilityScope === "private" && value.visibilityUserIds.length === 0) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["visibilityUserIds"], message: "Select at least one user for private visibility" });
  }
  if (value.status === "schedule" && !value.scheduledFor) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["scheduledFor"], message: "Schedule date and time is required" });
  }
  if (value.enablePoll) {
    if (!value.pollQuestion || value.pollQuestion.trim().length < 3) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["pollQuestion"], message: "Poll question is required" });
    }
    const filledOptions = value.pollOptions.filter((option) => option.trim());
    if (filledOptions.length < 2) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["pollOptions"], message: "Add at least two poll options" });
    }
  }
});

type FormValues = z.infer<typeof schema>;

function numberOrUndefined(value?: string) {
  return value ? Number(value) : undefined;
}

function uploadToPresignedUrl(
  uploadUrl: string,
  file: File,
  onProgress?: (percent: number, loaded: number, total: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");

    if (onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          onProgress(
            Math.round((event.loaded / event.total) * 100),
            event.loaded,
            event.total
          );
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    };

    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.send(file);
  });
}

function formatEta(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "Estimating...";
  if (seconds < 60) return `${Math.round(seconds)}s remaining`;
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${mins}m ${secs}s remaining`;
}

function AddNewsPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [translationMode, setTranslationMode] = useState<"manual" | "ai">("manual");
  const [activeTranslationCode, setActiveTranslationCode] = useState<string>("");
  const [translationDrafts, setTranslationDrafts] = useState<Record<string, { title: string; description: string; bottomDescription: string }>>({});
  const [selectedLanguageCodes, setSelectedLanguageCodes] = useState<string[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [uploadStatus, setUploadStatus] = useState<{
    thumbnail: { percent: number; eta: string } | null;
    video: { percent: number; eta: string } | null;
  } | null>(null);
  const categoriesQuery = useCategories();
  const channelsQuery = useChannels();
  const languagesQuery = useLanguages();
  const userSearchQuery = useAdminUserSearch({ search: userSearch || undefined, page: 1, per_page: 20 });
  const createNews = useCreateNews();
  const autoFillTranslations = useAutoFillNewsTranslations();

  const { register, setValue, watch, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: "article",
      visibilityScope: "all_india",
      visibilityStateIds: [],
      visibilityDistrictIds: [],
      visibilityAreaIds: [],
      visibilityUserIds: [],
      subcategoryIds: [],
      status: "draft",
      sourceLink: "",
      bottomDescription: "",
      enablePoll: false,
      pollOptions: ["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"],
    },
  });

  const values = watch();
  // Regions are language-scoped (each language has its own state/district/area
  // ids); fetch them in the news's primary language so the saved location ids
  // match language_code and pass the backend's validateGeo check.
  const regionsQuery = useRegions({ language_code: values.languageCode || undefined });
  const subcategoriesQuery = useCategorySubcategories(values.categoryId || "", { page: 1, per_page: 100 });
  const newsCategories = categoriesQuery.data?.items ?? [];
  const newsSubcategories = subcategoriesQuery.data?.items ?? [];
  const languages = languagesQuery.data?.items ?? [];
  const activeLanguage = activeTranslationCode || values.languageCode || selectedLanguageCodes[0] || "";
  const states = regionsQuery.data ?? [];
  const selectedState = states.find((state) => String(state.id) === values.stateId);
  const districts = selectedState?.districts ?? [];
  const selectedDistrict = districts.find((district) => String(district.id) === values.districtId);
  const areas = selectedDistrict?.areas ?? [];

  const selectedLanguageObj = useMemo(() => {
    return languages.find((l) => l.code === values.languageCode);
  }, [languages, values.languageCode]);
  const selectedLanguageName = selectedLanguageObj?.name;

  const filteredChannels = useMemo(() => {
    if (!values.languageCode) return [];
    return (channelsQuery.data?.items ?? []).filter((c) => c.languageCode === values.languageCode);
  }, [channelsQuery.data?.items, values.languageCode]);

  const filteredCategories = useMemo(() => {
    if (!selectedLanguageName) return [];
    return newsCategories.filter((c) => c.language === selectedLanguageName);
  }, [newsCategories, selectedLanguageName]);

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
      return "No active backend categories are available. Create or activate a category before adding news.";
    }
    return undefined;
  }, [categoriesQuery.error, categoriesQuery.isLoading, channelsQuery.error, languagesQuery.error, newsCategories.length, regionsQuery.error]);

  const selectedUsers = userSearchQuery.data?.items ?? [];

  const updateTranslationDraft = (code: string, patch: Partial<{ title: string; description: string; bottomDescription: string }>) => {
    setTranslationDrafts((prev) => ({
      ...prev,
      [code]: { title: "", description: "", bottomDescription: "", ...(prev[code] ?? {}), ...patch },
    }));
  };

  // Location ids belong to a specific language's region tree; clear them when the
  // primary language changes so we never submit a cross-language (invalid) region.
  const resetLocation = () => {
    setValue("stateId", undefined);
    setValue("districtId", undefined);
    setValue("areaId", undefined);
  };

  const toggleLanguage = (code: string) => {
    const next = selectedLanguageCodes.includes(code)
      ? selectedLanguageCodes.filter((c) => c !== code)
      : [...selectedLanguageCodes, code];
    setSelectedLanguageCodes(next);
    // First selected language is the default; keep it valid if the default was removed.
    if (!next.includes(values.languageCode)) {
      setValue("languageCode", next[0] ?? "", { shouldValidate: true });
      resetLocation();
    }
    if (activeTranslationCode === code && !next.includes(code)) {
      setActiveTranslationCode("");
    }
  };

  const setDefaultLanguage = (code: string) => {
    if (!selectedLanguageCodes.includes(code)) setSelectedLanguageCodes((prev) => [...prev, code]);
    if (code !== values.languageCode) resetLocation();
    setValue("languageCode", code, { shouldValidate: true });
  };

  const translationStatus = (code: string) => {
    if (code === values.languageCode) return values.title && values.description ? "Filled" : "Partial";
    const draft = translationDrafts[code];
    if (!draft?.title && !draft?.description && !draft?.bottomDescription) return "Not Filled";
    return draft.title && draft.description ? "Filled" : "Partial";
  };

  const buildPayload = (data: FormValues): CreateAdminNewsPayload => {
    const visibility: CreateAdminNewsPayload["visibility"] = {
      scope: data.visibilityScope as NewsVisibilityScope,
    };
    if (data.visibilityScope === "state") visibility.state_ids = data.visibilityStateIds.map(Number);
    if (data.visibilityScope === "district") visibility.district_ids = data.visibilityDistrictIds.map(Number);
    if (data.visibilityScope === "area") visibility.area_ids = data.visibilityAreaIds.map(Number);
    if (data.visibilityScope === "private") visibility.user_ids = data.visibilityUserIds.map(Number);

    const translations = Object.entries(translationDrafts)
      .filter(([code, draft]) => code !== data.languageCode && selectedLanguageCodes.includes(code) && Boolean(draft.title.trim()))
      .map(([language_code, draft]) => ({
        language_code,
        title: draft.title.trim(),
        description: draft.description.trim() || null,
        bottom_description: draft.bottomDescription.trim() || null,
      }));

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
      translations: translations.length ? translations : undefined,
      status: data.status,
      scheduled_for: data.status === "schedule" && data.scheduledFor ? new Date(data.scheduledFor).toISOString() : undefined,
    };

    const stateId = numberOrUndefined(data.stateId);
    const districtId = numberOrUndefined(data.districtId);
    const areaId = numberOrUndefined(data.areaId);
    if (stateId || districtId || areaId) {
      payload.location = {
        state_id: stateId ?? null,
        district_id: districtId ?? null,
        area_id: areaId ?? null,
      };
    }

    if (data.subcategoryIds.length > 0) {
      payload.subcategory_ids = data.subcategoryIds.map(Number);
    }

    const pollOptions = data.pollOptions.map((option) => option.trim()).filter(Boolean);
    if (data.enablePoll && data.pollQuestion?.trim() && pollOptions.length >= 2) {
      payload.poll = {
        question: data.pollQuestion.trim(),
        options: pollOptions,
      };
    }

    return payload;
  };

  const submitNews = async (data: FormValues) => {
    try {
      const finalStatus = data.status;
      const created = await createNews.mutateAsync({
        ...buildPayload(data),
        status: "draft",
        scheduled_for: undefined,
      });

      try {
        const categoryPayload = {
          category_ids: [Number(data.categoryId)],
          ...(data.subcategoryIds.length > 0 ? { subcategory_ids: data.subcategoryIds.map(Number) } : {}),
        };
        await newsService.updateCategories(created.id, categoryPayload);
      } catch {
        // Deployed backend may already persist categories during create; this compatibility call is best-effort.
      }

      setUploadStatus({ thumbnail: null, video: null });

      if (thumbnailFile) {
        setUploadStatus((prev) => ({
          ...(prev ?? { video: null }),
          thumbnail: { percent: 0, eta: "Estimating time..." },
        }));
        const upload = await newsService.requestThumbnailUploadUrl(created.id, {
          file_name: thumbnailFile.name,
          content_type: thumbnailFile.type || "image/jpeg",
        });

        const startTime = Date.now();
        await uploadToPresignedUrl(upload.upload_url, thumbnailFile, (percent, loaded, total) => {
          const elapsed = (Date.now() - startTime) / 1000;
          const speed = elapsed > 0 ? loaded / elapsed : 0;
          const etaSecs = speed > 0 ? (total - loaded) / speed : 0;
          const etaText = etaSecs > 0 ? formatEta(etaSecs) : "Completing...";
          setUploadStatus((prev) => {
            if (!prev) return null;
            return { ...prev, thumbnail: { percent, eta: etaText } };
          });
        });

        await newsService.confirmThumbnailUpload(created.id, { file_key: upload.file_key });
      }

      if (videoFile) {
        setUploadStatus((prev) => ({
          ...(prev ?? { thumbnail: null }),
          video: { percent: 0, eta: "Estimating time..." },
        }));
        const upload = await newsService.requestVideoUploadUrl(created.id, {
          file_name: videoFile.name,
          content_type: videoFile.type || "video/mp4",
        });

        const startTime = Date.now();
        await uploadToPresignedUrl(upload.upload_url, videoFile, (percent, loaded, total) => {
          const elapsed = (Date.now() - startTime) / 1000;
          const speed = elapsed > 0 ? loaded / elapsed : 0;
          const etaSecs = speed > 0 ? (total - loaded) / speed : 0;
          const etaText = etaSecs > 0 ? formatEta(etaSecs) : "Completing...";
          setUploadStatus((prev) => {
            if (!prev) return null;
            return { ...prev, video: { percent, eta: etaText } };
          });
        });

        await newsService.confirmVideoUpload(created.id, { file_key: upload.file_key });
      }

      setUploadStatus(null);

      if (finalStatus === "schedule" && data.scheduledFor) {
        await newsService.schedule(created.id, new Date(data.scheduledFor).toISOString());
      }

      toast.success(
        finalStatus === "schedule"
          ? "News scheduled successfully"
          : thumbnailFile || videoFile
            ? "News and media uploaded"
            : "News saved as draft",
      );
      navigate({ to: ROUTES.NEWS_ADMIN });
    } catch (err) {
      setUploadStatus(null);
      toast.error(isAuthApiError(err) ? "Backend admin auth is required to create news." : "Unable to create news or upload media");
    }
  };

  const handleFormSubmit = handleSubmit((data, event) => {
    event?.preventDefault();
    if (step < STEPS.length - 1) {
      setStep((current) => Math.min(current + 1, STEPS.length - 1));
      return;
    }
    void submitNews(data);
  });
  const goNext = (event?: { preventDefault: () => void }) => {
    event?.preventDefault();
    setStep((current) => Math.min(current + 1, STEPS.length - 1));
  };
  const goBack = () => (step === 0 ? navigate({ to: ROUTES.NEWS_ADMIN }) : setStep((current) => current - 1));

  const handleAutoFill = async () => {
    const targets = selectedLanguageCodes.filter((code) => code && code !== values.languageCode);
    if (!values.languageCode || !values.title) {
      toast.error("Select a source language and enter a title first");
      return;
    }
    if (targets.length === 0) {
      toast.error("No target languages available");
      return;
    }
    try {
      const result = await autoFillTranslations.mutateAsync({
        source_language_code: values.languageCode,
        target_language_codes: targets,
        title: values.title,
        description: values.description,
        bottom_description: values.bottomDescription,
      });
      setTranslationDrafts((prev) => {
        const next = { ...prev };
        for (const translation of result.translations) {
          next[translation.language_code] = {
            title: translation.title,
            description: translation.description ?? "",
            bottomDescription: translation.bottom_description ?? "",
          };
        }
        return next;
      });
      toast.success("AI auto-fill placeholder completed");
    } catch {
      toast.error("Unable to auto-fill translations");
    }
  };

  return (
    <form onSubmit={handleFormSubmit}>
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
            <div className="md:col-span-3">
              <Field label="Languages *" error={errors.languageCode?.message}>
                <div className="flex flex-wrap gap-2">
                  {(languagesQuery.data?.items ?? []).map((language) => {
                    const selected = selectedLanguageCodes.includes(language.code);
                    const isDefault = values.languageCode === language.code;
                    return (
                      <button
                        type="button"
                        key={language.id}
                        onClick={() => toggleLanguage(language.code)}
                        className={cn(
                          "rounded-full border px-3 py-1 text-sm transition-colors",
                          selected ? "border-primary bg-primary/10 text-primary" : "border-input text-muted-foreground hover:bg-accent",
                        )}
                      >
                        {language.name}{isDefault ? " (default)" : ""}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Select every language this news should appear in. The first becomes the default; add per-language content in the next step.</p>
              </Field>
            </div>

            <Field label="Select Channel *" error={errors.newsSourceId?.message}>
              <Select 
                value={values.newsSourceId} 
                onValueChange={(value) => setValue("newsSourceId", value)}
                disabled={!values.languageCode}
              >
                <SelectTrigger><SelectValue placeholder={values.languageCode ? "Select Channel" : "Select language first"} /></SelectTrigger>
                <SelectContent>
                  {filteredChannels.map((channel) => <SelectItem key={channel.id} value={channel.id}>{channel.name}</SelectItem>)}
                </SelectContent>
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

            <Field label="Category *" error={errors.categoryId?.message}>
              <Select 
                value={values.categoryId} 
                onValueChange={(value) => { setValue("categoryId", value); setValue("subcategoryIds", []); }}
                disabled={!values.languageCode}
              >
                <SelectTrigger><SelectValue placeholder={values.languageCode ? "Select Category" : "Select language first"} /></SelectTrigger>
                <SelectContent>
                  {filteredCategories.map((category) => <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Only active backend categories for the selected language are listed here.
              </p>
            </Field>
          </div>

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
              <Select value={values.stateId} onValueChange={(value) => { setValue("stateId", value); setValue("districtId", undefined); setValue("areaId", undefined); }} disabled={!values.languageCode}>
                <SelectTrigger><SelectValue placeholder="Select State" /></SelectTrigger>
                <SelectContent>{states.map((state) => <SelectItem key={state.id} value={String(state.id)}>{state.name}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={values.districtId} onValueChange={(value) => { setValue("districtId", value); setValue("areaId", undefined); }} disabled={!values.stateId}>
                <SelectTrigger><SelectValue placeholder="Select District" /></SelectTrigger>
                <SelectContent>{districts.map((district) => <SelectItem key={district.id} value={String(district.id)}>{district.name}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={values.areaId} onValueChange={(value) => setValue("areaId", value)} disabled={!values.districtId}>
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
                setValue("visibilityUserIds", []);
              }}
              className="grid grid-cols-2 md:grid-cols-4 gap-3"
            >
              {[
                { value: "all_india", label: "All India" },
                { value: "state", label: "By State" },
                { value: "district", label: "By District" },
                { value: "area", label: "By Area" },
                { value: "private", label: "Private" },
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
                {values.visibilityScope === "private" && (
                  <div className="md:col-span-3 space-y-3">
                    <Input value={userSearch} onChange={(event) => setUserSearch(event.target.value)} placeholder="Search users for private visibility" />
                    <MultiCheckList
                      title="Users"
                      items={selectedUsers.map((user) => ({ id: String(user.id), name: user.name || user.email || user.phone || `User #${user.id}` }))}
                      selected={values.visibilityUserIds ?? []}
                      onChange={(next) => setValue("visibilityUserIds", next)}
                      emptyText={userSearchQuery.isLoading ? "Searching users..." : "No users found"}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          <Field label="Title *" error={errors.title?.message}><Input {...register("title")} placeholder="Enter news title (max 150 characters)" maxLength={150} /></Field>
          <Field label="Description *" error={errors.description?.message}>
            <RichTextarea value={values.description ?? ""} onChange={(value) => setValue("description", value)} placeholder="Write news description here..." />
          </Field>
          <Field label="Source"><Input {...register("sourceLink")} placeholder="https://source-url.com" /></Field>
          <div>
            <Label className="mb-1.5 block">News Media</Label>
            <div className="grid gap-3 md:grid-cols-2">
              <MediaPicker
                label="Thumbnail Image *"
                title="Upload Thumbnail"
                hint={thumbnailFile?.name || "JPG, PNG recommended"}
                icon={ImageIcon}
                accept="image/*"
                value={thumbnailFile}
                onChange={(file) => setThumbnailFile(file)}
              />
              <MediaPicker
                label="Video (Optional)"
                title="Upload Video"
                hint={videoFile?.name || "MP4, WebM, MOV recommended"}
                icon={Video}
                accept="video/*"
                value={videoFile}
                onChange={(file) => setVideoFile(file)}
              />
            </div>
          </div>
          <Field label="Bottom Description"><Input {...register("bottomDescription")} placeholder="Optional bottom description" maxLength={300} /></Field>
        </FormSection>
      )}

      {step === 1 && (
        <div className="rounded-lg border bg-card">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b p-5">
            <div>
              <h2 className="text-lg font-semibold">Multi Language Content</h2>
              <p className="text-sm text-muted-foreground">Add news content in multiple languages.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Bulk Fill Options</span>
              <Button type="button" variant={translationMode === "manual" ? "default" : "outline"} onClick={() => setTranslationMode("manual")}>Manual</Button>
              <Button type="button" variant={translationMode === "ai" ? "default" : "outline"} onClick={() => setTranslationMode("ai")}><Sparkles className="mr-2 h-4 w-4" />AI Auto Fill</Button>
            </div>
          </div>
          {translationMode === "ai" && (
            <div className="mx-5 mt-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-blue-50/60 p-4">
              <div>
                <p className="font-semibold text-blue-700">AI Auto Fill</p>
                <p className="text-sm text-muted-foreground">The backend currently returns deterministic placeholder translations until a real AI provider is configured.</p>
              </div>
              <Button type="button" onClick={handleAutoFill} disabled={autoFillTranslations.isPending}><Sparkles className="mr-2 h-4 w-4" />{autoFillTranslations.isPending ? "Filling..." : "AI Fill in All Languages"}</Button>
            </div>
          )}
          <div className="grid gap-5 p-5 lg:grid-cols-[320px_1fr]">
            <div className="space-y-3">
              {selectedLanguageCodes.length === 0 && (
                <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">Select one or more languages in the Basic Information step first.</div>
              )}
              {languages.filter((language) => selectedLanguageCodes.includes(language.code)).map((language) => {
                const status = translationStatus(language.code);
                const Icon = status === "Filled" ? CheckCircle2 : status === "Partial" ? AlertCircle : Circle;
                return (
                  <button
                    key={language.id}
                    type="button"
                    onClick={() => setActiveTranslationCode(language.code)}
                    className={cn("flex w-full items-center justify-between rounded-lg border p-3 text-left", activeLanguage === language.code && "border-primary bg-primary/5")}
                  >
                    <span className="font-medium">
                      {language.nativeName || language.name}{" "}
                      {language.code === values.languageCode ? (
                        <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">Default</span>
                      ) : (
                        <span
                          onClick={(e) => { e.stopPropagation(); setDefaultLanguage(language.code); }}
                          className="ml-2 cursor-pointer rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground hover:bg-accent"
                        >
                          Make default
                        </span>
                      )}
                    </span>
                    <span className={cn("inline-flex items-center gap-1 text-xs", status === "Filled" ? "text-green-600" : status === "Partial" ? "text-amber-600" : "text-muted-foreground")}><Icon className="h-3.5 w-3.5" />{status}</span>
                  </button>
                );
              })}
              <div className="rounded-lg bg-muted/40 p-4 text-sm">
                <p className="mb-2 font-semibold">Status Guide</p>
                <p className="text-muted-foreground">Filled means title and description exist. Partial means some fields are empty.</p>
              </div>
            </div>
            <TranslationEditor
              code={activeLanguage}
              label={languages.find((language) => language.code === activeLanguage)?.name ?? activeLanguage}
              isDefault={activeLanguage === values.languageCode}
              title={activeLanguage === values.languageCode ? values.title : translationDrafts[activeLanguage]?.title ?? ""}
              description={activeLanguage === values.languageCode ? values.description : translationDrafts[activeLanguage]?.description ?? ""}
              bottomDescription={activeLanguage === values.languageCode ? values.bottomDescription ?? "" : translationDrafts[activeLanguage]?.bottomDescription ?? ""}
              onTitleChange={(value) => activeLanguage === values.languageCode ? setValue("title", value) : updateTranslationDraft(activeLanguage, { title: value })}
              onDescriptionChange={(value) => activeLanguage === values.languageCode ? setValue("description", value) : updateTranslationDraft(activeLanguage, { description: value })}
              onBottomDescriptionChange={(value) => activeLanguage === values.languageCode ? setValue("bottomDescription", value) : updateTranslationDraft(activeLanguage, { bottomDescription: value })}
            />
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <FormSection title="Visibility & Schedule" description="Choose how and when the news will be visible to users.">
            <RadioGroup value={values.status} onValueChange={(value) => setValue("status", value as FormValues["status"])} className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { value: "draft", label: "Draft", desc: "Save as draft. Only admin can see.", icon: Save },
                { value: "schedule", label: "Schedule", desc: "Schedule for later publish.", icon: Calendar },
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
          <FormSection title="Enable Voting Poll" description="Allow users to vote on a question related to this news.">
            <label className="flex items-center gap-3">
              <Checkbox checked={values.enablePoll} onCheckedChange={(checked) => setValue("enablePoll", checked === true)} />
              <span className="text-sm font-medium">Enable voting poll</span>
            </label>
            {values.enablePoll && (
              <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
                <Field label="Poll Question" error={errors.pollQuestion?.message}><Input {...register("pollQuestion")} maxLength={200} placeholder="What is your opinion on this topic?" /></Field>
                <div className="space-y-2">
                  <Label>Poll Options</Label>
                  {(values.pollOptions ?? []).map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <Input value={option} onChange={(event) => {
                        const next = [...(values.pollOptions ?? [])];
                        next[index] = event.target.value;
                        setValue("pollOptions", next);
                      }} placeholder={`Option ${index + 1}`} />
                      <Button type="button" variant="outline" size="icon" onClick={() => setValue("pollOptions", values.pollOptions.filter((_, i) => i !== index))}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={() => setValue("pollOptions", [...(values.pollOptions ?? []), ""])}><Plus className="mr-2 h-4 w-4" />Add Option</Button>
                  {errors.pollOptions?.message && <p className="text-xs text-destructive">{errors.pollOptions.message}</p>}
                </div>
              </div>
            )}
          </FormSection>
        </div>
      )}

      <div className="flex items-center justify-between mt-6">
        <Button type="button" variant="outline" onClick={goBack}>
          {step === 0 ? "Cancel" : (<><ArrowLeft className="h-4 w-4 mr-1" /> Back</>)}
        </Button>
        <div className="flex gap-2">
          {step < 2 ? (
            <Button type="button" onClick={goNext}>Save & Next <ArrowRight className="h-4 w-4 ml-1" /></Button>
          ) : (
            <Button type="submit" disabled={createNews.isPending}>
              <Send className="h-4 w-4 mr-1" /> {createNews.isPending ? "Saving..." : values.status === "schedule" ? "Schedule News" : "Save Draft"}
            </Button>
          )}
        </div>
      </div>
      {uploadStatus && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-card border rounded-lg p-6 max-w-md w-full shadow-lg space-y-4">
            <h3 className="text-lg font-semibold">Uploading Media</h3>
            <p className="text-sm text-muted-foreground">Please wait while your media is being uploaded to the server.</p>
            
            {uploadStatus.thumbnail && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span>Thumbnail Upload</span>
                  <span>{uploadStatus.thumbnail.percent}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary transition-all duration-300" style={{ width: `${uploadStatus.thumbnail.percent}%` }} />
                </div>
                <p className="text-[10px] text-muted-foreground text-right">{uploadStatus.thumbnail.eta}</p>
              </div>
            )}

            {uploadStatus.video && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span>Video Upload</span>
                  <span>{uploadStatus.video.percent}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary transition-all duration-300" style={{ width: `${uploadStatus.video.percent}%` }} />
                </div>
                <p className="text-[10px] text-muted-foreground text-right">{uploadStatus.video.eta}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label>{label}</Label>{children}{error && <p className="text-xs text-destructive">{error}</p>}</div>;
}

function MediaPicker({
  label,
  title,
  hint,
  icon: Icon,
  accept,
  value,
  onChange,
}: {
  label: string;
  title: string;
  hint: string;
  icon: LucideIcon;
  accept: string;
  value: File | string | null;
  onChange: (file: File | null) => void;
}) {
  const inputId = useId();
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    if (value instanceof File) {
      const url = URL.createObjectURL(value);
      setObjectUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    } else if (typeof value === "string" && value) {
      setObjectUrl(value);
    } else {
      setObjectUrl(null);
    }
  }, [value]);

  const isImage = accept.includes("image");
  const isVideo = accept.includes("video");

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {objectUrl ? (
        <div className="relative rounded-md border bg-muted flex flex-col items-center justify-center overflow-hidden h-48 group">
          {isImage && (
            <img src={objectUrl} alt="Preview" className="h-full w-full object-cover" />
          )}
          {isVideo && (
            <video src={objectUrl} controls className="h-full w-full object-contain" />
          )}
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute top-2 right-2 rounded-full bg-red-600 p-1.5 text-white hover:bg-red-700 shadow-md transition-colors"
            title="Remove media"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <>
          <input
            id={inputId}
            type="file"
            accept={accept}
            className="hidden"
            onChange={(event) => onChange(event.target.files?.[0] ?? null)}
          />
          <label
            htmlFor={inputId}
            className="flex h-32 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed bg-background px-4 text-center transition hover:border-primary/70 hover:bg-primary/5"
          >
            <Icon className="mb-2 h-8 w-8 text-muted-foreground" />
            <span className="text-sm font-semibold">{title}</span>
            <span className="mt-1 max-w-[90%] truncate text-xs text-muted-foreground">{hint}</span>
          </label>
        </>
      )}
    </div>
  );
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

function RichTextarea({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) {
  return (
    <div className="overflow-hidden rounded-md border bg-background">
      <div className="flex flex-wrap items-center gap-1 border-b bg-muted/30 px-2 py-2 text-muted-foreground">
        {[Bold, Italic, Underline, List, ImageIcon, Quote].map((Icon, index) => (
          <Button key={index} type="button" variant="ghost" size="icon" className="h-7 w-7">
            <Icon className="h-3.5 w-3.5" />
          </Button>
        ))}
        <span className="ml-auto text-xs">{value.length}/5000</span>
      </div>
      <Textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} maxLength={5000} className="min-h-[150px] resize-y border-0 focus-visible:ring-0" />
    </div>
  );
}

function TranslationEditor({
  code,
  label,
  isDefault,
  title,
  description,
  bottomDescription,
  onTitleChange,
  onDescriptionChange,
  onBottomDescriptionChange,
}: {
  code: string;
  label: string;
  isDefault: boolean;
  title: string;
  description: string;
  bottomDescription: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onBottomDescriptionChange: (value: string) => void;
}) {
  return (
    <div className="rounded-lg border p-5">
      <div className="mb-5 flex items-center gap-2">
        <h3 className="text-lg font-semibold">{label || code}</h3>
        {isDefault && <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">Default</span>}
      </div>
      <div className="space-y-4">
        <Field label={`Title (${code})`}>
          <div className="relative">
            <Input value={title} onChange={(event) => onTitleChange(event.target.value)} maxLength={150} placeholder={`Enter news title in ${label}`} />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{title.length}/150</span>
          </div>
        </Field>
        <Field label={`Description (${code})`}>
          <RichTextarea value={description} onChange={onDescriptionChange} placeholder={`Write news description in ${label}...`} />
        </Field>
        <Field label={`Bottom Description (${code})`}>
          <div className="relative">
            <Input value={bottomDescription} onChange={(event) => onBottomDescriptionChange(event.target.value)} maxLength={300} placeholder={`Enter bottom description in ${label}`} />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{bottomDescription.length}/300</span>
          </div>
        </Field>
      </div>
    </div>
  );
}
