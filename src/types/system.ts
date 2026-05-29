export type AdminStatus = "Active" | "Inactive" | "Pending" | "Scheduled" | "Failed" | "Paused";

export interface Language {
  id: string;
  name: string;
  nativeName: string;
  code: string;
  direction: "LTR" | "RTL";
  status: AdminStatus;
  contentCount: number;
  addedOn: string;
  icon?: string;
}
