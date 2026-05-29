import type { Role } from "@/types/role";

export const permissionGroups = ["Dashboard", "News Management", "Categories", "Users", "Monetization Management", "System Management"];
export const permissionActions = ["View", "Create", "Edit", "Delete", "Export", "Approve"];

export const roles: Role[] = [
  { id: "role-admin", name: "Super Admin", users: 3, description: "Full administrative access", permissions: {} },
  { id: "role-editor", name: "Editor", users: 12, description: "Manages news, categories, and notifications", permissions: {} },
  { id: "role-support", name: "Support Agent", users: 8, description: "Handles users and complaints", permissions: {} },
];
