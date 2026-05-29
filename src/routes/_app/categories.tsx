import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, FolderTree, Star, ToggleLeft, ToggleRight } from "lucide-react";
import { AdminListPage } from "@/components/admin/AdminListPage";
import { ActionMenu } from "@/components/common/ActionMenu";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Switch } from "@/components/ui/switch";
import { categories } from "@/mock/categories.mock";
import { languages } from "@/mock/system.mock";
import type { Category } from "@/types/category";
import type { Column } from "@/components/tables/DataTable";
import { ROUTES } from "@/constants/routes.constants";

export const Route = createFileRoute("/_app/categories")({ component: CategoriesPage });

function CategoriesPage() {
  const columns: Column<Category>[] = [
    { key: "name", header: "Category Name", cell: (r) => <span className="font-medium">{r.name}</span> },
    { key: "slug", header: "Slug", cell: (r) => <span className="text-muted-foreground">{r.slug}</span> },
    { key: "language", header: "Language", cell: (r) => r.language },
    { key: "posts", header: "Posts", cell: (r) => r.posts.toLocaleString() },
    { key: "featured", header: "Featured", cell: (r) => <Switch defaultChecked={r.featured} /> },
    { key: "status", header: "Status", cell: (r) => <StatusBadge status={r.status} /> },
    { key: "preferred", header: "Preferred User", cell: (r) => r.preferredUser },
    { key: "order", header: "Display Order", cell: (r) => r.displayOrder },
    { key: "created", header: "Created On", cell: (r) => r.createdOn },
    { key: "updated", header: "Updated On", cell: (r) => r.updatedOn },
    { key: "actions", header: "Actions", cell: () => <ActionMenu /> },
  ];
  return <AdminListPage title="Categories" breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "Categories" }]} stats={[{ title: "Total Categories", value: categories.length, icon: FolderTree, variant: "blue" }, { title: "Total Posts", value: categories.reduce((a, c) => a + c.posts, 0).toLocaleString(), icon: CheckCircle2, variant: "green" }, { title: "Featured Categories", value: categories.filter((c) => c.featured).length, icon: Star, variant: "amber" }, { title: "Active Categories", value: categories.filter((c) => c.status === "Active").length, icon: ToggleRight, variant: "violet" }, { title: "Inactive Categories", value: categories.filter((c) => c.status === "Inactive").length, icon: ToggleLeft, variant: "rose" }]} data={categories} columns={columns} rowKey={(r) => r.id} searchPlaceholder="Search category..." dropdowns={[{ key: "status", placeholder: "Status", options: ["Active", "Inactive"].map((s) => ({ label: s, value: s })) }, { key: "featured", placeholder: "Featured", options: ["Featured", "Not Featured"].map((s) => ({ label: s, value: s })) }, { key: "language", placeholder: "Language", options: languages.map((l) => ({ label: l.name, value: l.name })) }]} filter={(row, search) => row.name.toLowerCase().includes(search.toLowerCase()) || row.slug.toLowerCase().includes(search.toLowerCase())} />;
}
