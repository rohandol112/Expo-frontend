import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Save, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { FormSection } from "@/components/forms/FormSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ROUTES } from "@/constants/routes.constants";
import { isAuthApiError } from "@/lib/apiError";
import { useCategories } from "@/hooks/api/useCategories";
import { useChannels } from "@/hooks/api/useChannels";
import { useLanguages } from "@/hooks/api/useLanguages";
import { useRegions } from "@/hooks/api/useRegions";
import { useAdminUserSearch, useNewsItem, useUpdateNews } from "@/hooks/api/useNews";
import type { UpdateAdminNewsPayload } from "@/services/news.service";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/news/$newsId/edit")({ component: EditNewsPage });

const schema = z.object({
  title: z.string().min(3).max(150),
  description: z.string().min(1).max(5000),
  bottomDescription: z.string().max(300).optional(),
  languageCode: z.string().min(1),
  type: z.enum(["article", "video", "short", "story"]),
  newsSourceId: z.string().min(1),
  categoryId: z.string().min(1),
  stateId: z.string().optional(),
  districtId: z.string().optional(),
  areaId: z.string().optional(),
  visibilityScope: z.enum(["all_india", "state", "district", "area", "private"]),
  visibilityStateIds: z.array(z.string()).default([]),
  visibilityDistrictIds: z.array(z.string()).default([]),
  visibilityAreaIds: z.array(z.string()).default([]),
  visibilityUserIds: z.array(z.string()).default([]),
  sourceLink: z.string().url().or(z.literal("")).optional(),
  thumbnailUrl: z.string().url().or(z.literal("")).optional(),
  tagsText: z.string().optional(),
  enablePoll: z.boolean().default(false),
  pollQuestion: z.string().optional(),
  pollOptions: z.array(z.string()).default([]),
});

type FormValues = z.infer<typeof schema>;

function toMaybeNumber(value?: string) {
  return value ? Number(value) : undefined;
}

function EditNewsPage() {
  const { newsId } = Route.useParams();
  const navigate = useNavigate();
  const [userSearch, setUserSearch] = useState("");
  const [selectedLanguageCodes, setSelectedLanguageCodes] = useState<string[]>([]);
  const [translationDrafts, setTranslationDrafts] = useState<Record<string, { title: string; description: string; bottomDescription: string }>>({});
  const [activeTranslationCode, setActiveTranslationCode] = useState<string>("");
  const newsQuery = useNewsItem(newsId);
  const categoriesQuery = useCategories();
  const channelsQuery = useChannels();
  const languagesQuery = useLanguages();
  const regionsQuery = useRegions({ language_code: newsQuery.data?.languageCode || undefined });
  const userSearchQuery = useAdminUserSearch({ search: userSearch || undefined, page: 1, per_page: 20 });
  const updateNews = useUpdateNews();
  const news = newsQuery.data;
  const { register, setValue, watch, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: "article",
      sourceLink: "",
      thumbnailUrl: "",
      visibilityScope: "all_india",
      visibilityStateIds: [],
      visibilityDistrictIds: [],
      visibilityAreaIds: [],
      visibilityUserIds: [],
      enablePoll: false,
      pollOptions: ["Strongly Agree", "Agree"],
    },
  });
  const values = watch();
  const states = regionsQuery.data ?? [];
  const selectedState = states.find((state) => String(state.id) === values.stateId);
  const districts = selectedState?.districts ?? [];
  const selectedDistrict = districts.find((district) => String(district.id) === values.districtId);
  const areas = selectedDistrict?.areas ?? [];
  const visibilityDistricts = states.filter((state) => values.visibilityStateIds.includes(String(state.id))).flatMap((state) => state.districts);
  const visibilityAreas = visibilityDistricts.filter((district) => values.visibilityDistrictIds.includes(String(district.id))).flatMap((district) => district.areas);

  useEffect(() => {
    if (!news) return;
    reset({
      title: news.title,
      description: news.description || "",
      bottomDescription: news.bottomDescription || "",
      languageCode: news.languageCode || "",
      type: news.type || "article",
      newsSourceId: news.newsSourceId ? String(news.newsSourceId) : "",
      categoryId: news.categories?.[0]?.id ? String(news.categories[0].id) : "",
      stateId: news.location?.stateId ? String(news.location.stateId) : undefined,
      districtId: news.location?.districtId ? String(news.location.districtId) : undefined,
      areaId: news.location?.areaId ? String(news.location.areaId) : undefined,
      visibilityScope: news.visibility?.type === "By State" ? "state" : news.visibility?.type === "By District" ? "district" : news.visibility?.type === "By Area" ? "area" : news.visibility?.type === "Private" ? "private" : "all_india",
      visibilityStateIds: news.visibility?.stateIds?.map(String) ?? [],
      visibilityDistrictIds: news.visibility?.districtIds?.map(String) ?? [],
      visibilityAreaIds: news.visibility?.areaIds?.map(String) ?? [],
      visibilityUserIds: news.visibility?.userIds?.map(String) ?? [],
      sourceLink: news.sourceLink || "",
      thumbnailUrl: news.thumbnailUrl || "",
      tagsText: news.tags?.join(", ") || "",
      enablePoll: Boolean(news.poll),
      pollQuestion: news.poll?.question || "",
      pollOptions: news.poll?.options.map((option) => option.text) ?? ["Strongly Agree", "Agree"],
    });
    // Seed the language multi-select + per-language drafts from the saved news.
    const primary = news.languageCode || "";
    const codes = new Set<string>();
    if (primary) codes.add(primary);
    const drafts: Record<string, { title: string; description: string; bottomDescription: string }> = {};
    for (const t of news.translations ?? []) {
      if (!t.language_code) continue;
      codes.add(t.language_code);
      if (t.language_code !== primary) {
        drafts[t.language_code] = { title: t.title ?? "", description: t.description ?? "", bottomDescription: t.bottom_description ?? "" };
      }
    }
    setSelectedLanguageCodes(Array.from(codes));
    setTranslationDrafts(drafts);
    setActiveTranslationCode(primary);
  }, [news, reset]);

  const userItems = userSearchQuery.data?.items ?? [];
  const languages = languagesQuery.data?.items ?? [];
  const activeLanguage = activeTranslationCode || values.languageCode || selectedLanguageCodes[0] || "";

  const toggleLanguage = (code: string) => {
    const next = selectedLanguageCodes.includes(code) ? selectedLanguageCodes.filter((c) => c !== code) : [...selectedLanguageCodes, code];
    setSelectedLanguageCodes(next);
    if (!next.includes(values.languageCode)) setValue("languageCode", next[0] ?? "", { shouldValidate: true });
    if (activeTranslationCode === code && !next.includes(code)) setActiveTranslationCode("");
  };
  const setDefaultLanguage = (code: string) => {
    if (!selectedLanguageCodes.includes(code)) setSelectedLanguageCodes((prev) => [...prev, code]);
    setValue("languageCode", code, { shouldValidate: true });
  };
  const updateTranslationDraft = (code: string, patch: Partial<{ title: string; description: string; bottomDescription: string }>) => {
    setTranslationDrafts((prev) => {
      const current = prev[code] ?? { title: "", description: "", bottomDescription: "" };
      return { ...prev, [code]: { ...current, ...patch } };
    });
  };

  const visibility = useMemo<UpdateAdminNewsPayload["visibility"]>(() => {
    if (values.visibilityScope === "state") return { scope: "state", state_ids: values.visibilityStateIds.map(Number) };
    if (values.visibilityScope === "district") return { scope: "district", district_ids: values.visibilityDistrictIds.map(Number) };
    if (values.visibilityScope === "area") return { scope: "area", area_ids: values.visibilityAreaIds.map(Number) };
    if (values.visibilityScope === "private") return { scope: "private", user_ids: values.visibilityUserIds.map(Number) };
    return { scope: "all_india" };
  }, [values.visibilityAreaIds, values.visibilityDistrictIds, values.visibilityScope, values.visibilityStateIds, values.visibilityUserIds]);

  const onSubmit = async (data: FormValues) => {
    const translations = Object.entries(translationDrafts)
      .filter(([code, draft]) => code !== data.languageCode && selectedLanguageCodes.includes(code) && Boolean(draft.title.trim()))
      .map(([language_code, draft]) => ({
        language_code,
        title: draft.title.trim(),
        description: draft.description.trim() || null,
        bottom_description: draft.bottomDescription.trim() || null,
      }));
    const payload: UpdateAdminNewsPayload = {
      title: data.title,
      description: data.description,
      bottom_description: data.bottomDescription || null,
      language_code: data.languageCode,
      translations: translations.length ? translations : undefined,
      type: data.type,
      news_source_id: Number(data.newsSourceId),
      category_ids: [Number(data.categoryId)],
      source_link: data.sourceLink || undefined,
      thumbnail_url: data.thumbnailUrl || undefined,
      tags: data.tagsText?.split(",").map((tag) => tag.trim()).filter(Boolean),
      visibility,
      location: {
        state_id: toMaybeNumber(data.stateId) ?? null,
        district_id: toMaybeNumber(data.districtId) ?? null,
        area_id: toMaybeNumber(data.areaId) ?? null,
      },
      poll: data.enablePoll && data.pollQuestion?.trim()
        ? { question: data.pollQuestion.trim(), options: data.pollOptions.map((option) => option.trim()).filter(Boolean) }
        : null,
    };
    try {
      await updateNews.mutateAsync({ id: newsId, payload });
      toast.success("News updated");
      navigate({ to: "/news/$newsId", params: { newsId } });
    } catch (err) {
      toast.error(isAuthApiError(err) ? "Backend admin auth is required to update news." : "Unable to update news");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <PageHeader
        title="Edit News"
        breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "News Management", to: ROUTES.NEWS_ALL }, { label: "Edit News" }]}
        actions={<Button type="submit" disabled={updateNews.isPending}><Save className="mr-2 h-4 w-4" />{updateNews.isPending ? "Saving..." : "Save Changes"}</Button>}
      />
      {newsQuery.error && <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">Unable to load news from backend.</div>}
      <FormSection title="News Details" description={newsQuery.isLoading ? "Loading news details..." : "Update fields supported by the backend admin news API."}>
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Channel" error={errors.newsSourceId?.message}><Select value={values.newsSourceId} onValueChange={(value) => setValue("newsSourceId", value)}><SelectTrigger><SelectValue placeholder="Select channel" /></SelectTrigger><SelectContent>{(channelsQuery.data?.items ?? []).map((channel) => <SelectItem key={channel.id} value={channel.id}>{channel.name}</SelectItem>)}</SelectContent></Select></Field>
          <Field label="Type"><Select value={values.type} onValueChange={(value) => setValue("type", value as FormValues["type"])}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="article">Article</SelectItem><SelectItem value="video">Video</SelectItem><SelectItem value="short">Shorts</SelectItem><SelectItem value="story">Story</SelectItem></SelectContent></Select></Field>
          <div className="md:col-span-3">
            <Field label="Languages" error={errors.languageCode?.message}>
              <div className="flex flex-wrap gap-2">
                {(languagesQuery.data?.items ?? []).map((language) => {
                  const selected = selectedLanguageCodes.includes(language.code);
                  const isDefault = values.languageCode === language.code;
                  return (
                    <button
                      type="button"
                      key={language.id}
                      onClick={() => toggleLanguage(language.code)}
                      className={`rounded-full border px-3 py-1 text-sm ${selected ? "border-primary bg-primary/10 text-primary" : "border-input text-muted-foreground"}`}
                    >
                      {language.name}{isDefault ? " (default)" : ""}
                    </button>
                  );
                })}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Select every language this news appears in. The first is the default (edited in the Title / Description fields below); others are edited under Multi Language Content.</p>
            </Field>
          </div>
          <Field label="Category" error={errors.categoryId?.message}><Select value={values.categoryId} onValueChange={(value) => setValue("categoryId", value)}><SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger><SelectContent>{(categoriesQuery.data?.items ?? []).map((category) => <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>)}</SelectContent></Select></Field>
          <Field label="Source Link" error={errors.sourceLink?.message}><Input {...register("sourceLink")} placeholder="https://example.com/source" /></Field>
          <Field label="Thumbnail URL" error={errors.thumbnailUrl?.message}><Input {...register("thumbnailUrl")} /></Field>
        </div>
        <Field label="Title" error={errors.title?.message}><Input {...register("title")} maxLength={150} /></Field>
        <Field label="Description" error={errors.description?.message}><Textarea {...register("description")} className="min-h-[140px]" maxLength={5000} /></Field>
        <Field label="Bottom Description" error={errors.bottomDescription?.message}><Textarea {...register("bottomDescription")} maxLength={300} /></Field>
        <Field label="Tags"><Input {...register("tagsText")} placeholder="politics, breaking, local" /></Field>
      </FormSection>

      <FormSection title="Multi Language Content" description="Manage this news in each selected language. The default language uses the Title / Description fields above.">
        {selectedLanguageCodes.filter((code) => code !== values.languageCode).length === 0 ? (
          <p className="text-sm text-muted-foreground">Select more than one language above to add translated content.</p>
        ) : (
          <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
            <div className="space-y-2">
              {languages.filter((language) => selectedLanguageCodes.includes(language.code)).map((language) => (
                <button
                  key={language.id}
                  type="button"
                  onClick={() => setActiveTranslationCode(language.code)}
                  className={`flex w-full items-center justify-between rounded-lg border p-3 text-left ${activeLanguage === language.code ? "border-primary bg-primary/5" : ""}`}
                >
                  <span className="font-medium">
                    {language.nativeName || language.name}{" "}
                    {language.code === values.languageCode ? (
                      <span className="ml-1 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">Default</span>
                    ) : (
                      <span onClick={(event) => { event.stopPropagation(); setDefaultLanguage(language.code); }} className="ml-1 cursor-pointer rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">Make default</span>
                    )}
                  </span>
                </button>
              ))}
            </div>
            <div className="space-y-3">
              {activeLanguage && activeLanguage === values.languageCode ? (
                <p className="text-sm text-muted-foreground">Editing the default language — use the Title / Description fields above.</p>
              ) : activeLanguage ? (
                <>
                  <Field label={`Title (${activeLanguage})`}><Input value={translationDrafts[activeLanguage]?.title ?? ""} onChange={(event) => updateTranslationDraft(activeLanguage, { title: event.target.value })} /></Field>
                  <Field label={`Description (${activeLanguage})`}><Textarea className="min-h-[120px]" value={translationDrafts[activeLanguage]?.description ?? ""} onChange={(event) => updateTranslationDraft(activeLanguage, { description: event.target.value })} /></Field>
                  <Field label={`Bottom Description (${activeLanguage})`}><Textarea value={translationDrafts[activeLanguage]?.bottomDescription ?? ""} onChange={(event) => updateTranslationDraft(activeLanguage, { bottomDescription: event.target.value })} /></Field>
                </>
              ) : null}
            </div>
          </div>
        )}
      </FormSection>

      <FormSection title="Location & Visibility">
        <div className="grid gap-4 md:grid-cols-3">
          <Select value={values.stateId} onValueChange={(value) => { setValue("stateId", value); setValue("districtId", undefined); setValue("areaId", undefined); }}><SelectTrigger><SelectValue placeholder="Select State" /></SelectTrigger><SelectContent>{states.map((state) => <SelectItem key={state.id} value={String(state.id)}>{state.name}</SelectItem>)}</SelectContent></Select>
          <Select value={values.districtId} onValueChange={(value) => { setValue("districtId", value); setValue("areaId", undefined); }}><SelectTrigger><SelectValue placeholder="Select District" /></SelectTrigger><SelectContent>{districts.map((district) => <SelectItem key={district.id} value={String(district.id)}>{district.name}</SelectItem>)}</SelectContent></Select>
          <Select value={values.areaId} onValueChange={(value) => setValue("areaId", value)}><SelectTrigger><SelectValue placeholder="Select Area" /></SelectTrigger><SelectContent>{areas.map((area) => <SelectItem key={area.id} value={String(area.id)}>{area.name}</SelectItem>)}</SelectContent></Select>
        </div>
        <RadioGroup value={values.visibilityScope} onValueChange={(value) => setValue("visibilityScope", value as FormValues["visibilityScope"])} className="grid gap-3 md:grid-cols-5">
          {[["all_india", "All India"], ["state", "By State"], ["district", "By District"], ["area", "By Area"], ["private", "Private"]].map(([value, label]) => (
            <label key={value} className="flex cursor-pointer items-center gap-2 rounded-md border p-3"><RadioGroupItem value={value} /> <span className="text-sm font-medium">{label}</span></label>
          ))}
        </RadioGroup>
        {values.visibilityScope !== "all_india" && (
          <div className="grid gap-3 md:grid-cols-3">
            {values.visibilityScope !== "private" && <MultiCheckList title="States" items={states.map((state) => ({ id: String(state.id), name: state.name }))} selected={values.visibilityStateIds} onChange={(next) => { setValue("visibilityStateIds", next); setValue("visibilityDistrictIds", []); setValue("visibilityAreaIds", []); }} />}
            {(values.visibilityScope === "district" || values.visibilityScope === "area") && <MultiCheckList title="Districts" items={visibilityDistricts.map((district) => ({ id: String(district.id), name: district.name }))} selected={values.visibilityDistrictIds} onChange={(next) => { setValue("visibilityDistrictIds", next); setValue("visibilityAreaIds", []); }} />}
            {values.visibilityScope === "area" && <MultiCheckList title="Areas" items={visibilityAreas.map((area) => ({ id: String(area.id), name: area.name }))} selected={values.visibilityAreaIds} onChange={(next) => setValue("visibilityAreaIds", next)} />}
            {values.visibilityScope === "private" && <div className="md:col-span-3 space-y-3"><Input value={userSearch} onChange={(event) => setUserSearch(event.target.value)} placeholder="Search users" /><MultiCheckList title="Users" items={userItems.map((user) => ({ id: String(user.id), name: user.name || user.email || user.phone || `User #${user.id}` }))} selected={values.visibilityUserIds} onChange={(next) => setValue("visibilityUserIds", next)} emptyText="No users found" /></div>}
          </div>
        )}
      </FormSection>

      <FormSection title="Voting Poll">
        <label className="flex items-center gap-3"><Checkbox checked={values.enablePoll} onCheckedChange={(checked) => setValue("enablePoll", checked === true)} /><span className="text-sm font-medium">Enable voting poll</span></label>
        {values.enablePoll && (
          <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
            <Field label="Poll Question"><Input {...register("pollQuestion")} maxLength={200} /></Field>
            <div className="space-y-2">
              <Label>Poll Options</Label>
              {values.pollOptions.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <Input value={option} onChange={(event) => { const next = [...values.pollOptions]; next[index] = event.target.value; setValue("pollOptions", next); }} />
                  <Button type="button" variant="outline" size="icon" onClick={() => setValue("pollOptions", values.pollOptions.filter((_, i) => i !== index))}><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={() => setValue("pollOptions", [...values.pollOptions, ""])}>Add Option</Button>
            </div>
          </div>
        )}
      </FormSection>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label>{label}</Label>{children}{error && <p className="text-xs text-destructive">{error}</p>}</div>;
}

function MultiCheckList({ title, items, selected, onChange, emptyText = "No options available" }: { title: string; items: { id: string; name: string }[]; selected: string[]; onChange: (next: string[]) => void; emptyText?: string }) {
  return (
    <div className="rounded-md border p-3">
      <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">{title}</p>
      <div className="max-h-44 space-y-2 overflow-y-auto">
        {items.length === 0 ? <p className="text-xs text-muted-foreground">{emptyText}</p> : items.map((item) => (
          <label key={item.id} className="flex items-center gap-2 text-sm">
            <Checkbox checked={selected.includes(item.id)} onCheckedChange={(checked) => onChange(checked === true ? [...selected, item.id] : selected.filter((value) => value !== item.id))} />
            {item.name}
          </label>
        ))}
      </div>
    </div>
  );
}
