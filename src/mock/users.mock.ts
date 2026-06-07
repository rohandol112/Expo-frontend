import type { AdminUser } from "@/types/user";

export const users: AdminUser[] = [
  { id: "usr-1", name: "Aarav Sharma", email: "aarav@example.com", phone: "+91 98765 43210", dob: "14 Apr 1994", language: "Hindi", state: "Maharashtra", district: "Pune", area: "Kothrud", referredBy: "Campaign", registeredOn: "12 Feb 2026", lastActive: "Today", posts: 24, status: "Active", type: "Registered", deviceType: "Android" },
  { id: "usr-2", name: "Neha Khan", email: "neha@example.com", phone: "+91 91234 56780", dob: "08 Sep 1991", language: "English", state: "Delhi", district: "Delhi", area: "Karol Bagh", referredBy: "Aarav Sharma", registeredOn: "20 Feb 2026", lastActive: "Yesterday", posts: 15, status: "Active", type: "Registered", deviceType: "iOS" },
  { id: "usr-3", name: "Guest 4921", email: "-", phone: "+91 90000 10000", dob: "-", language: "Hindi", state: "Uttar Pradesh", district: "Lucknow", area: "Hazratganj", referredBy: "-", registeredOn: "01 Mar 2026", lastActive: "19 May 2026", posts: 3, status: "Inactive", type: "Guest", deviceType: "Android" },
];
