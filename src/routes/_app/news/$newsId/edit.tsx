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
import { useLanguages } from "@/hooks/api/useLanguages";
import { useNewsItem, useUpdateNews } from "@/hooks/api/useNews";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/news/$newsId/edit")({ component: EditNewsPage });

const schema = z.object({
  title: z.string().min(3).max(255),
  description: z.string().max(10000).optional(),
  bottomDescription: z.string().max(2000).optional(),
  languageCode: z.string().optional(),
  type: z.enum(["article", "video", "short", "story"]),
  sourceLink: z.string().url().or(z.literal("")).optional(),
  thumbnailUrl: z.string().url().or(z.literal("")).optional(),
});

type FormValues = z.infer<typeof schema>;

function EditNewsPage() {
  const { newsId } = Route.useParams();
  const navigate = useNavigate();
  const newsQuery = useNewsItem(newsId);
  const languagesQuery = useLanguages();
  const updateNews = useUpdateNews();
  const news = newsQuery.data;
  const { register, setValue, watch, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { type: "article", sourceLink: "", thumbnailUrl: "" },
  });
  const values = watch();

  useEffect(() => {
    if (!news) return;
    const typeMap = { Article: "article", Video: "video", Shorts: "short", Story: "story" } as const;
    const languageCode = languagesQuery.data?.items.find((language) => language.name === news.language || language.code === news.language)?.code;
    reset({
      title: news.title,
      description: news.description || "",
      bottomDescription: news.bottomDescription || "",
      languageCode: languageCode || news.languageCode,
      type: news.type || typeMap[news.contentType ?? "Article"],
      sourceLink: news.sourceLink || "",
      thumbnailUrl: news.thumbnailUrl || "",
    });
  }, [languagesQuery.data?.items, news, reset]);

  const onSubmit = async (data: FormValues) => {
    try {
      await updateNews.mutateAsync({
        id: newsId,
        payload: {
          title: data.title,
          description: data.description || undefined,
          bottom_description: data.bottomDescription || undefined,
          language_code: data.languageCode || undefined,
          type: data.type,
          source_link: data.sourceLink || undefined,
          thumbnail_url: data.thumbnailUrl || undefined,
        },
      });
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
      <FormSection title="News Details" description={newsQuery.error ? "Unable to load news from backend." : newsQuery.isLoading ? "Loading news details..." : "This edits the fields currently accepted by the backend news update API."}>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Title" error={errors.title?.message}><Input {...register("title")} /></Field>
          <Field label="Content Type"><Select value={values.type} onValueChange={(value) => setValue("type", value as FormValues["type"])}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="article">Article</SelectItem><SelectItem value="video">Video</SelectItem><SelectItem value="short">Shorts</SelectItem><SelectItem value="story">Story</SelectItem></SelectContent></Select></Field>
          <Field label="Language"><Select value={values.languageCode} onValueChange={(value) => setValue("languageCode", value)}><SelectTrigger><SelectValue placeholder={news?.language ?? "Select language"} /></SelectTrigger><SelectContent>{(languagesQuery.data?.items ?? []).map((language) => <SelectItem key={language.id} value={language.code}>{language.name}</SelectItem>)}</SelectContent></Select></Field>
          <Field label="Source Link" error={errors.sourceLink?.message}><Input {...register("sourceLink")} placeholder="https://example.com/source" /></Field>
          <Field label="Thumbnail URL" error={errors.thumbnailUrl?.message}><Input {...register("thumbnailUrl")} /></Field>
        </div>
        {news?.videoUrl && (
          <div className="rounded-md border p-4">
            <Label className="mb-2 block">Existing Video</Label>
            <video src={news.videoUrl} controls className="aspect-video w-full max-w-xl rounded-md bg-black object-contain" />
          </div>
        )}
        <Field label="Description" error={errors.description?.message}><Textarea {...register("description")} className="min-h-[140px]" /></Field>
        <Field label="Bottom Description" error={errors.bottomDescription?.message}><Textarea {...register("bottomDescription")} /></Field>
      </FormSection>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label>{label}</Label>{children}{error && <p className="text-xs text-destructive">{error}</p>}</div>;
}
