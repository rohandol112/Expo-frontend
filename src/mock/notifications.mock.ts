import type { NewsNotification } from "@/types/notification";

export const notifications: NewsNotification[] = [
  { id: "ntf-1", news: "Metro expansion approved", language: "Hindi", targetState: "Maharashtra", district: "Pune", city: "Pune", sentOn: "22 May 2026", targetLanguage: "Hindi", reach: 92000, open: 31800, status: "Active" },
  { id: "ntf-2", news: "Market closes higher", language: "English", targetState: "Maharashtra", district: "Mumbai", city: "Mumbai", sentOn: "21 May 2026", targetLanguage: "English", reach: 66000, open: 18420, status: "Scheduled" },
  { id: "ntf-3", news: "Rain alert issued", language: "Hindi", targetState: "Uttar Pradesh", district: "Lucknow", city: "Lucknow", sentOn: "20 May 2026", targetLanguage: "Hindi", reach: 41000, open: 8900, status: "Failed" },
];
