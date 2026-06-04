export type NewsStatus = "Published" | "Pending" | "Draft" | "Scheduled" | "Rejected";
export type ContentType = "Article" | "Video" | "Shorts" | "Story";

export interface NewsItem {
  id: string;
  code: string;
  title: string;
  thumbnail: string;
  category: string;
  channel?: { name: string; logo?: string };
  contentType?: ContentType;
  language: string;
  location?: { city: string; region: string };
  visibility?: {
    type: "All India" | "By State" | "By District" | "By Area";
    state?: string;
    district?: string;
    area?: string;
  };
  views: number;
  status: NewsStatus;
  publishedOn?: string;
  uploadedBy?: { name: string; email: string; avatar?: string };
  createdBy?: string;
}
