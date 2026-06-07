import type { Category } from "@/types/category";

export const categories: Category[] = [
  { id: "cat-1", name: "Politics", slug: "politics", language: "Hindi", posts: 1280, featured: true, status: "Active", preferredUser: "Editor", displayOrder: 1, createdOn: "10 Jan 2026", updatedOn: "21 May 2026", imageUrl: "https://picsum.photos/seed/politics/80/80" },
  { id: "cat-2", name: "Business", slug: "business", language: "English", posts: 940, featured: true, status: "Active", preferredUser: "Admin", displayOrder: 2, createdOn: "11 Jan 2026", updatedOn: "18 May 2026", imageUrl: "https://picsum.photos/seed/business/80/80" },
  { id: "cat-3", name: "Sports", slug: "sports", language: "Hindi", posts: 760, featured: false, status: "Active", preferredUser: "Reporter", displayOrder: 3, createdOn: "12 Jan 2026", updatedOn: "17 May 2026", imageUrl: "https://picsum.photos/seed/sports/80/80" },
  { id: "cat-4", name: "Lifestyle", slug: "lifestyle", language: "Marathi", posts: 240, featured: false, status: "Inactive", preferredUser: "Editor", displayOrder: 8, createdOn: "22 Jan 2026", updatedOn: "02 May 2026", imageUrl: "https://picsum.photos/seed/lifestyle/80/80" },
];
