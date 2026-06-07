import type { AdminStatus } from "@/types/system";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  dob: string;
  language: string;
  state: string;
  district: string;
  area: string;
  referredBy: string;
  registeredOn: string;
  lastActive: string;
  posts: number;
  status: AdminStatus;
  type: "Registered" | "Guest";
  deviceType: "Android" | "iOS";
}
