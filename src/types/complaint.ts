export type ComplaintStatus = "Pending" | "In Review" | "In Progress" | "Awaiting Action" | "Resolved" | "Rejected";

export interface Complaint {
  id: string;
  number: string;
  title: string;
  category: string;
  categoryId?: number;
  subCategory: string;
  subCategoryId?: number;
  priority: "Low" | "Medium" | "High" | "Critical";
  status: ComplaintStatus;
  reportedBy: string;
  reportedByPhone: string;
  language: string;
  location: string;
  state: string;
  district: string;
  area: string;
  assignedTo: string;
  registeredOn: string;
  updatedOn: string;
  resolvedOn: string;
  adminResponse: string;
  description: string;
  images: string[];
}
