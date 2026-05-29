import type { AdUnit } from "@/types/monetization";

export const adUnits: AdUnit[] = [
  { id: "ad-1", name: "Home Feed Banner", preview: "Banner", language: "Hindi", location: "Maharashtra", area: "Home Feed", revenue: "₹42,500", clicks: 1840, impressions: 210000, status: "Active" },
  { id: "ad-2", name: "Article Inline Ad", preview: "Inline", language: "English", location: "Delhi", area: "News Detail", revenue: "₹28,900", clicks: 930, impressions: 128000, status: "Paused" },
  { id: "ad-3", name: "Listing Sponsored Slot", preview: "Card", language: "Hindi", location: "Uttar Pradesh", area: "Listings", revenue: "₹19,250", clicks: 610, impressions: 82000, status: "Scheduled" },
];
