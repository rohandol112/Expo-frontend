import type { ChartPoint, DayWiseReport, ReportRow } from "@/types/report";

export const viewsOverview: ChartPoint[] = [
  { name: "Jan", views: 18000 }, { name: "Feb", views: 24000 }, { name: "Mar", views: 31000 },
  { name: "Apr", views: 42000 }, { name: "May", views: 56000 },
];

export const userGrowth: ChartPoint[] = [
  { name: "Jan", users: 1200 }, { name: "Feb", users: 1800 }, { name: "Mar", users: 2100 },
  { name: "Apr", users: 3100 }, { name: "May", users: 3900 },
];

export const topNews: ReportRow[] = [
  { id: "rn-1", name: "Metro expansion approved", value: 82400, change: "+18%" },
  { id: "rn-2", name: "Rain alert issued", value: 64200, change: "+9%" },
  { id: "rn-3", name: "Market closes higher", value: 38100, change: "+6%" },
];

export const stateUsage: ReportRow[] = [
  { id: "rs-1", name: "Maharashtra", value: 124000, change: "+12%" },
  { id: "rs-2", name: "Uttar Pradesh", value: 98000, change: "+8%" },
  { id: "rs-3", name: "Delhi", value: 63000, change: "+5%" },
];

export const languageUsage: ReportRow[] = [
  { id: "rl-1", name: "Hindi", value: 182000, change: "+14%" },
  { id: "rl-2", name: "English", value: 92000, change: "+7%" },
  { id: "rl-3", name: "Marathi", value: 44000, change: "+4%" },
];

export const dayWiseReports: DayWiseReport[] = [
  { id: "day-1", date: "24 May 2026", news: 42, users: 320, notifications: 18, views: 58400 },
  { id: "day-2", date: "25 May 2026", news: 38, users: 280, notifications: 16, views: 52100 },
  { id: "day-3", date: "26 May 2026", news: 51, users: 410, notifications: 22, views: 67250 },
  { id: "day-4", date: "27 May 2026", news: 47, users: 365, notifications: 19, views: 61900 },
  { id: "day-5", date: "28 May 2026", news: 56, users: 440, notifications: 24, views: 74200 },
];
