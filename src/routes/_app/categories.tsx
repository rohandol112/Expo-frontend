import { Outlet, createFileRoute, useLocation, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, FolderTree, ImageIcon, Plus, Star, ToggleLeft, ToggleRight } from "lucide-react";
import { useState } from "react";
import { AdminListPage } from "@/components/admin/AdminListPage";
import { ActionMenu } from "@/components/common/ActionMenu";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { languages } from "@/mock/system.mock";
import type { Category } from "@/types/category";
import type { Column } from "@/components/tables/DataTable";
import { ROUTES } from "@/constants/routes.constants";
import { useCategories, useDeleteCategory, useUpdateCategoryStatus } from "@/hooks/api/useCategories";
import { isAuthApiError } from "@/lib/apiError";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/categories")({ component: CategoriesPage });

function CategoriesPage() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  if (pathname !== ROUTES.CATEGORIES) return <Outlet />;
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const categoriesQuery = useCategories();
  const deleteCategory = useDeleteCategory();
  const updateStatus = useUpdateCategoryStatus();
  const rows = categoriesQuery.data?.items ?? [];
  const error = categoriesQuery.error ? "Unable to load categories from backend." : undefined;
  const columns: Column<Category>[] = [
    {
      key: "name",
      header: "Category Name",
      cell: (r) => (
        <div className="flex items-center gap-3">
          {r.imageUrl ? (
            <img src={r.imageUrl} alt="" className="h-10 w-10 rounded-md object-cover" />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted text-muted-foreground">
              <ImageIcon className="h-4 w-4" />
            </div>
          )}
          <span className="font-medium">{r.name}</span>
        </div>
      ),
    },
    { key: "slug", header: "Slug", cell: (r) => <span className="text-muted-foreground">{r.slug}</span> },
    { key: "language", header: "Language", cell: (r) => r.language },
    { key: "posts", header: "Posts", cell: (r) => r.posts.toLocaleString() },
    { key: "featured", header: "Featured", cell: (r) => <Switch defaultChecked={r.featured} /> },
    {
      key: "status",
      header: "Status",
      cell: (r) => (
        <div className="flex items-center gap-2">
          <StatusBadge status={r.status} />
          <Switch
            checked={r.status === "Active"}
            disabled={updateStatus.isPending}
            onCheckedChange={async (checked) => {
              try {
                await updateStatus.mutateAsync({ id: r.id, isActive: checked });
                toast.success("Category status updated");
              } catch (err) {
                toast.error(isAuthApiError(err) ? "Backend admin auth is required to update category status." : "Unable to update category status");
              }
            }}
          />
        </div>
      ),
    },
    { key: "preferred", header: "Preferred User", cell: (r) => <span className="font-medium">{Number(r.preferredUser || 0).toLocaleString()}</span> },
    { key: "order", header: "Display Order", cell: (r) => r.displayOrder },
    { key: "created", header: "Created On", cell: (r) => r.createdOn },
    { key: "updated", header: "Updated On", cell: (r) => r.updatedOn },
    {
      key: "actions",
      header: "Actions",
      cell: (r) => (
        <ActionMenu
          onView={() => navigate({ to: "/categories/$categoryId", params: { categoryId: r.id } })}
          onEdit={() => navigate({ to: "/categories/$categoryId/edit", params: { categoryId: r.id } })}
          onDelete={() => setDeleteTarget(r)}
        />
      ),
    },
  ];
  return <>
    <AdminListPage title="Categories" breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "Categories" }]} actions={<Button onClick={() => navigate({ to: ROUTES.CATEGORIES_ADD })}><Plus className="mr-2 h-4 w-4" />Add Category</Button>} stats={[{ title: "Total Categories", value: rows.length, icon: FolderTree, variant: "blue" }, { title: "Total Posts", value: rows.reduce((a, c) => a + c.posts, 0).toLocaleString(), icon: CheckCircle2, variant: "green" }, { title: "Featured Categories", value: rows.filter((c) => c.featured).length, icon: Star, variant: "amber" }, { title: "Active Categories", value: rows.filter((c) => c.status === "Active").length, icon: ToggleRight, variant: "violet" }, { title: "Inactive Categories", value: rows.filter((c) => c.status === "Inactive").length, icon: ToggleLeft, variant: "rose" }]} data={rows} columns={columns} rowKey={(r) => r.id} loading={categoriesQuery.isLoading} error={error} searchPlaceholder="Search category..." dropdowns={[{ key: "status", placeholder: "Status", options: ["Active", "Inactive"].map((s) => ({ label: s, value: s })) }, { key: "featured", placeholder: "Featured", options: ["Featured", "Not Featured"].map((s) => ({ label: s, value: s })) }, { key: "language", placeholder: "Language", options: languages.map((l) => ({ label: l.name, value: l.name })) }]} filter={(row, search) => row.name.toLowerCase().includes(search.toLowerCase()) || row.slug.toLowerCase().includes(search.toLowerCase())} />
    <ConfirmDialog
      open={Boolean(deleteTarget)}
      onOpenChange={(open) => !open && setDeleteTarget(null)}
      title="Delete category?"
      description={`This will delete ${deleteTarget?.name ?? "this category"} if the backend allows it.`}
      confirmLabel={deleteCategory.isPending ? "Deleting..." : "Delete"}
      destructive
      onConfirm={async () => {
        if (!deleteTarget) return;
        try {
          await deleteCategory.mutateAsync(deleteTarget.id);
          toast.success("Category deleted");
          setDeleteTarget(null);
        } catch (err) {
            toast.error(isAuthApiError(err) ? "Backend admin auth is required to delete category." : "Unable to delete category");
        }
      }}
    />
  </>;
}
