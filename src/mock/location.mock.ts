import type { AreaItem, DistrictItem, LocationOverview, StateItem } from "@/types/location";

export const locationOverview: LocationOverview[] = [
  { id: "loc-hi", language: "Hindi", states: 6, districts: 42, areas: 188, status: "Active" },
  { id: "loc-en", language: "English", states: 5, districts: 28, areas: 104, status: "Active" },
  { id: "loc-mr", language: "Marathi", states: 2, districts: 18, areas: 92, status: "Active" },
  { id: "loc-ur", language: "Urdu", states: 3, districts: 12, areas: 48, status: "Inactive" },
];

export const states: StateItem[] = [
  { id: "st-mh", name: "Maharashtra", code: "MH", status: "Active", addedOn: "12 Jan 2026" },
  { id: "st-up", name: "Uttar Pradesh", code: "UP", status: "Active", addedOn: "15 Jan 2026" },
  { id: "st-dl", name: "Delhi", code: "DL", status: "Active", addedOn: "20 Jan 2026" },
  { id: "st-rj", name: "Rajasthan", code: "RJ", status: "Inactive", addedOn: "05 Feb 2026" },
];

export const districts: DistrictItem[] = [
  { id: "dist-pune", name: "Pune", state: "Maharashtra", status: "Active", addedOn: "14 Jan 2026" },
  { id: "dist-mumbai", name: "Mumbai", state: "Maharashtra", status: "Active", addedOn: "15 Jan 2026" },
  { id: "dist-lucknow", name: "Lucknow", state: "Uttar Pradesh", status: "Active", addedOn: "18 Jan 2026" },
  { id: "dist-jaipur", name: "Jaipur", state: "Rajasthan", status: "Inactive", addedOn: "08 Feb 2026" },
];

export const areas: AreaItem[] = [
  { id: "area-kothrud", name: "Kothrud", district: "Pune", state: "Maharashtra", status: "Active", addedOn: "20 Jan 2026" },
  { id: "area-andheri", name: "Andheri", district: "Mumbai", state: "Maharashtra", status: "Active", addedOn: "22 Jan 2026" },
  { id: "area-hazratganj", name: "Hazratganj", district: "Lucknow", state: "Uttar Pradesh", status: "Active", addedOn: "26 Jan 2026" },
  { id: "area-vaishali", name: "Vaishali Nagar", district: "Jaipur", state: "Rajasthan", status: "Inactive", addedOn: "12 Feb 2026" },
];
