import type { Complaint, ComplaintStatus } from "@/types/complaint";

export interface BackendRegionRef {
  id: number;
  name: string;
}

export interface BackendComplaintImage {
  id: number;
  image_url: string | null;
  video_url?: string | null;
  url?: string | null;
  media_url?: string | null;
  media_type?: "image" | "video" | string | null;
  sort_order: number;
}

export interface BackendComplaint {
  id: number;
  complaint_number: string | null;
  user: { id: number; name: string | null; phone: string | null; avatar_url: string | null };
  subject: string;
  description: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "pending" | "in_review" | "in_progress" | "awaiting_action" | "resolved" | "rejected";
  category: { id: number; name: string } | null;
  sub_category: { id: number; name: string } | null;
  location_address: string | null;
  language_code: string | null;
  state: BackendRegionRef | null;
  district: BackendRegionRef | null;
  area: BackendRegionRef | null;
  assigned_to: { id: number; name: string | null } | null;
  admin_response: string | null;
  images: BackendComplaintImage[];
  resolved_at: string | null;
  created_by: number | null;
  created_at: string;
  updated_at: string;
}

export interface BackendComplaintMessage {
  id: number;
  complaint_id: number;
  sender: { id: number; name: string | null; avatar_url: string | null };
  message: string;
  is_admin: boolean;
  created_at: string;
}

export interface BackendComplaintStatusHistory {
  id: number;
  status: BackendComplaint["status"];
  note: string | null;
  changed_by: { id: number | null; name: string | null; type: string };
  created_at: string;
}

export const PRIORITY_LABELS: Record<BackendComplaint["priority"], Complaint["priority"]> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

export const STATUS_LABELS: Record<BackendComplaint["status"], ComplaintStatus> = {
  pending: "Pending",
  in_review: "In Review",
  in_progress: "In Progress",
  awaiting_action: "Awaiting Action",
  resolved: "Resolved",
  rejected: "Rejected",
};

export const STATUS_VALUES: Record<ComplaintStatus, BackendComplaint["status"]> = {
  Pending: "pending",
  "In Review": "in_review",
  "In Progress": "in_progress",
  "Awaiting Action": "awaiting_action",
  Resolved: "resolved",
  Rejected: "rejected",
};

function languageName(code?: string | null) {
  const map: Record<string, string> = { hi: "Hindi", en: "English", mr: "Marathi", ta: "Tamil", bn: "Bengali", gu: "Gujarati", pa: "Punjabi" };
  return code ? map[code] ?? code.toUpperCase() : "—";
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

function formatDateTime(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(date);
}

export function toComplaint(row: BackendComplaint): Complaint {
  const locationParts = [row.area?.name, row.district?.name, row.state?.name].filter(Boolean);
  return {
    id: String(row.id),
    number: row.complaint_number || `CMP-${row.id}`,
    title: row.subject,
    category: row.category?.name || "—",
    subCategory: row.sub_category?.name || "—",
    priority: PRIORITY_LABELS[row.priority] ?? "Medium",
    status: STATUS_LABELS[row.status] ?? "Pending",
    reportedBy: row.user?.name || `User #${row.user?.id ?? "—"}`,
    reportedByPhone: row.user?.phone || "—",
    language: languageName(row.language_code),
    location: row.location_address || locationParts.join(", ") || "—",
    state: row.state?.name || "—",
    district: row.district?.name || "—",
    area: row.area?.name || "—",
    assignedTo: row.assigned_to?.name || "Unassigned",
    registeredOn: formatDateTime(row.created_at),
    updatedOn: formatDateTime(row.updated_at),
    resolvedOn: formatDate(row.resolved_at),
    adminResponse: row.admin_response || "",
    description: row.description,
    images: (row.images || [])
      .map((img) => img.image_url || img.video_url || img.media_url || img.url)
      .filter((url): url is string => Boolean(url)),
  };
}

export interface ComplaintMessage {
  id: string;
  senderId: number;
  senderName: string;
  senderAvatar: string | null;
  message: string;
  isAdmin: boolean;
  createdAt: string;
}

export function toComplaintMessage(row: BackendComplaintMessage): ComplaintMessage {
  return {
    id: String(row.id),
    senderId: row.sender.id,
    senderName: row.sender.name || (row.is_admin ? "Admin" : "User"),
    senderAvatar: row.sender.avatar_url,
    message: row.message,
    isAdmin: row.is_admin,
    createdAt: formatDateTime(row.created_at),
  };
}

export interface ComplaintTimelineEntry {
  id: string;
  status: ComplaintStatus;
  note: string;
  changedByName: string;
  changedByType: string;
  createdAt: string;
}

export function toComplaintTimelineEntry(row: BackendComplaintStatusHistory): ComplaintTimelineEntry {
  return {
    id: String(row.id),
    status: STATUS_LABELS[row.status] ?? "Pending",
    note: row.note || "",
    changedByName: row.changed_by?.name || "System",
    changedByType: row.changed_by?.type || "system",
    createdAt: formatDateTime(row.created_at),
  };
}
