import type { AdminStatus } from "@/types/system";

export interface Complaint {
  id: string;
  title: string;
  category: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  status: AdminStatus | "Resolved";
  reportedBy: string;
  language: string;
  location: string;
  state: string;
  district: string;
  area: string;
  assignedTo: string;
  registeredOn: string;
  description: string;
  images: string[];
  videos: string[];
}
