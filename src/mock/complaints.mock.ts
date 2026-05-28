import type { Complaint } from "@/types/complaint";

export const complaints: Complaint[] = [
  { id: "cmp-1001", title: "Incorrect area shown in news", category: "Content", priority: "High", status: "Pending", reportedBy: "Aarav Sharma", language: "Hindi", location: "Pune, Maharashtra", assignedTo: "Priya Admin", registeredOn: "20 May 2026", description: "The article location is mapped to the wrong city area.", images: ["https://images.unsplash.com/photo-1495020689067-958852a7765e?w=640"] },
  { id: "cmp-1002", title: "Spam comments on local post", category: "Abuse", priority: "Medium", status: "Active", reportedBy: "Neha Khan", language: "English", location: "Mumbai, Maharashtra", assignedTo: "Rohit Support", registeredOn: "21 May 2026", description: "Several spam comments were added to the listing.", images: ["https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=640"] },
  { id: "cmp-1003", title: "Notification not received", category: "Technical", priority: "Low", status: "Resolved", reportedBy: "Guest 4921", language: "Hindi", location: "Lucknow, UP", assignedTo: "Unassigned", registeredOn: "22 May 2026", description: "User did not receive scheduled district notification.", images: [] },
];
