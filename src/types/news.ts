export type NewsStatus = "Published" | "Pending" | "Draft" | "Scheduled" | "Rejected";
export type ContentType = "Article" | "Video" | "Shorts" | "Story";
export type NewsVisibilityType = "All India" | "By State" | "By District" | "By Area" | "Private";

export interface NewsPoll {
  id?: number;
  question: string;
  options: Array<{
    id?: number;
    text: string;
    sort_order?: number;
    vote_count?: number;
  }>;
  total_votes?: number;
}

export interface NewsItem {
  id: string;
  code: string;
  title: string;
  description?: string | null;
  bottomDescription?: string | null;
  slug?: string;
  thumbnail: string;
  thumbnailUrl?: string | null;
  videoUrl?: string | null;
  durationSeconds?: number | null;
  category: string;
  categories?: Array<{ id: number; name: string }>;
  channel?: { name: string; logo?: string };
  newsSourceId?: number | null;
  sourceName?: string | null;
  sourceLink?: string | null;
  contentType?: ContentType;
  type?: "article" | "video" | "short" | "story";
  languageCode?: string;
  language: string;
  location?: {
    state?: string | number | null;
    district?: string | number | null;
    area?: string | number | null;
    stateId?: number | null;
    districtId?: number | null;
    areaId?: number | null;
  };
  visibility?: {
    type: NewsVisibilityType;
    state?: string;
    district?: string;
    area?: string;
    users?: string;
    stateIds?: number[];
    districtIds?: number[];
    areaIds?: number[];
    userIds?: number[];
  };
  hasPoll?: boolean;
  pollQuestion?: string | null;
  poll?: NewsPoll | null;
  tags?: string[];
  translations?: Array<{
    language_code?: string;
    title?: string;
    description?: string | null;
    bottom_description?: string | null;
  }>;
  views: number;
  status: NewsStatus;
  statusLabel?: string;
  rejectionReason?: string | null;
  scheduledFor?: string | null;
  publishedOn?: string;
  uploadedOn?: string;
  uploadedBy?: { id?: number | string; name: string; email?: string; avatar?: string; role?: string | null };
  createdById?: number | null;
  createdByRole?: string | null;
  analytics?: { views: number; shares?: number; comments?: number; hasPoll?: boolean };
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  isFeatured?: boolean;
  isAdminNews?: boolean;
}
