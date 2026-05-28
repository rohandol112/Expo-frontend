import { mockNews } from "@/mock/news.mock";
import type { NewsItem } from "@/types/news";

export const newsService = {
  async list(): Promise<NewsItem[]> {
    await new Promise((r) => setTimeout(r, 200));
    return mockNews;
  },
  async create(payload: Partial<NewsItem>): Promise<NewsItem> {
    await new Promise((r) => setTimeout(r, 300));
    return { id: String(Date.now()), code: `NWS${Date.now()}`, ...payload } as NewsItem;
  },
};