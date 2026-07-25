export type RoleContentType = "article" | "video" | "story" | "shorts";

export interface RoleModulePermissions {
  view: boolean;
  add: boolean;
  edit: boolean;
  status_change: boolean;
  delete: boolean;
  draft: boolean;
  publish: boolean;
  notification: boolean;
  translation: boolean;
  content_types: RoleContentType[];
}

export interface RoleScope {
  language_codes?: string[];
  state_ids?: number[];
  district_ids?: number[];
  area_ids?: number[];
  channel_types?: string[];
}

export interface AdminRole {
  id: number;
  name: string;
  description: string;
  icon: string;
  color: string;
  is_system: boolean;
  is_active: boolean;
  scope: RoleScope;
  permissions: Record<string, Partial<RoleModulePermissions>>;
  users_count: number;
  total_permissions: number;
  content_types_count: number;
  created_at: string;
  updated_at: string;
}

export interface AdminRoleInput {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  is_active?: boolean;
  scope?: RoleScope;
  permissions?: Record<string, Partial<RoleModulePermissions>>;
}

export const ROLE_ACTIONS = [
  { key: "view", label: "List / View" },
  { key: "add", label: "Add" },
  { key: "edit", label: "Update / Edit" },
  { key: "status_change", label: "Status Change" },
  { key: "delete", label: "Delete" },
  { key: "draft", label: "Draft" },
  { key: "publish", label: "Publish" },
  { key: "notification", label: "Notification" },
  { key: "translation", label: "Translation" },
] as const;

export type RoleActionKey = (typeof ROLE_ACTIONS)[number]["key"];

export const ROLE_CONTENT_TYPES: { key: RoleContentType; label: string }[] = [
  { key: "article", label: "Article" },
  { key: "video", label: "Video" },
  { key: "story", label: "Story" },
  { key: "shorts", label: "Shorts" },
];

export const ROLE_MODULES: { key: string; label: string }[] = [
  { key: "dashboard", label: "Dashboard" },
  { key: "news", label: "News Management" },
  { key: "user_news", label: "User News Management" },
  { key: "categories", label: "Categories" },
  { key: "channels", label: "Channels" },
  { key: "complaints", label: "Complaint" },
  { key: "users", label: "Users" },
  { key: "reports", label: "Reports" },
  { key: "notifications", label: "Notification" },
  { key: "referrals", label: "Referrals & Points" },
  { key: "offers", label: "Offers" },
  { key: "listings", label: "Listings" },
  { key: "monetization", label: "Monetization" },
  { key: "language", label: "Language" },
  { key: "location", label: "Location" },
  { key: "competition", label: "Competition" },
  { key: "roles", label: "Role & Permission" },
  { key: "settings", label: "Settings" },
];
