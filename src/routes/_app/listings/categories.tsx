import { Outlet, createFileRoute, useLocation, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { FilterBar } from "@/components/common/FilterBar";
import { SortableList, type SortableColumn } from "@/components/admin/SortableList";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { useListingCategories, useDeleteListingCategory, useReorderListingCategories } from "@/hooks/api/useListingCategories";
import type { ListingCategory } from "@/types/listingCategory";
import { ROUTES } from "@/constants/routes.constants";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/listings/categories")({ component: CategoriesPage });

function CategoriesPage() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const categoriesQuery = useListingCategories();
  const deleteCategory = useDeleteListingCategory();
  const reorder = useReorderListingCategories();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<ListingCategory | null>(null);
  if (pathname !== ROUTES.LISTINGS_CATEGORIES) return <Outlet />;

  const categories = categoriesQuery.data?.items ?? [];
  const filtered = categories.filter((c) => !search || c.name.toLowerCase().includes(search.toLowerCase()));

  const columns: SortableColumn<ListingCategory>[] = [
    { key: "icon", header: "Icon", cell: (r) => (r.icon ? <img src={r.icon.url} alt="" className="h-8 w-8 rounded object-contain" /> : <span className="text-muted-foreground">—</span>) },
    { key: "name", header: "Category Name", cell: (r) => <span className="font-medium">{r.name}</span> },
    { key: "subs", header: "Sub Categories", cell: (r) => r.subCategoryCount },
    { key: "listings", header: "Listings", cell: (r) => r.listingCount },
    { key: "status", header: "Status", cell: (r) => <StatusBadge status={r.status} /> },
    { key: "sort", header: "Sort Order", cell: (r) => <span className="text-sm">{r.sortOrder}</span> },
    { key: "created", header: "Created At", cell: (r) => <span className="whitespace-nowrap text-sm text-muted-foreground">{r.createdOn}</span> },
    {
      key: "actions",
      header: "Actions",
      cell: (r) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => navigate({ to: "/listings/categories/$categoryId/edit", params: { categoryId: r.id } })}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive"
            onClick={() => setDeleteTarget(r)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Listing Categories"
        description="Manage all listing categories. You can add, edit, delete and reorder categories."
        breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "Listings", to: ROUTES.LISTINGS }, { label: "Listing Categories" }]}
        actions={<Button onClick={() => navigate({ to: ROUTES.LISTINGS_CATEGORIES_ADD })}><Plus className="mr-2 h-4 w-4" />Add New Category</Button>}
      />
      <p className="mb-3 text-sm text-muted-foreground">All Categories ({categories.length}) — these categories will be used for Shops, Products and Services listings.</p>
      <FilterBar search={search} onSearchChange={setSearch} searchPlaceholder="Search categories..." showDateRange={false} />
      <SortableList
        columns={columns}
        data={filtered}
        rowKey={(r) => r.id}
        loading={categoriesQuery.isLoading}
        page={page}
        pageSize={10}
        onPageChange={setPage}
        onReorder={(pageRows) => {
          const otherIds = filtered.filter((_, idx) => idx < (page - 1) * 10 || idx >= page * 10).map((c) => c.id);
          const before = otherIds.filter((id) => filtered.findIndex((c) => c.id === id) < (page - 1) * 10);
          const after = otherIds.filter((id) => filtered.findIndex((c) => c.id === id) >= page * 10);
          reorder.mutate([...before, ...pageRows.map((c) => c.id), ...after]);
        }}
        emptyTitle="No categories found"
      />
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete category?"
        description={`This will permanently remove "${deleteTarget?.name}". This action cannot be undone.`}
        confirmLabel="Delete"
        destructive
        onConfirm={async () => {
          if (!deleteTarget) return;
          await deleteCategory.mutateAsync(deleteTarget.id);
          toast.success("Category deleted");
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
