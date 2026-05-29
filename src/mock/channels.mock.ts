import type { Channel } from "@/types/channel";

export const channels: Channel[] = [
  { id: "ch-1", name: "Pune Local Desk", logo: "PL", language: "Hindi", website: "https://example.com/pune", description: "Local city updates", state: "Maharashtra", district: "Pune", areas: ["Kothrud", "Shivajinagar"], posts: 428, addedOn: "16 Jan 2026", status: "Active", allowUserPosts: true },
  { id: "ch-2", name: "Mumbai Business", logo: "MB", language: "English", website: "https://example.com/mumbai", description: "Business news desk", state: "Maharashtra", district: "Mumbai", areas: ["Andheri", "Bandra"], posts: 612, addedOn: "21 Jan 2026", status: "Active", allowUserPosts: false },
  { id: "ch-3", name: "Lucknow Bulletin", logo: "LB", language: "Hindi", website: "https://example.com/lucknow", description: "Daily district bulletin", state: "Uttar Pradesh", district: "Lucknow", areas: ["Hazratganj"], posts: 305, addedOn: "02 Feb 2026", status: "Inactive", allowUserPosts: true },
];
