import type { ChartPoint, ReportRow } from "@/types/report";

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
