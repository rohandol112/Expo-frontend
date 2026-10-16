import { Outlet, createFileRoute, useLocation, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { FilterBar } from "@/components/common/FilterBar";
import { SortableList, type SortableColumn } from "@/components/admin/SortableList";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { useListingSubCategories, useDeleteListingSubCategory, useReorderListingSubCategories } from "@/hooks/api/useListingSubCategories";
import { useListingCategories } from "@/hooks/api/useListingCategories";
import type { ListingSubCategory } from "@/types/listingCategory";
import { ROUTES } from "@/constants/routes.constants";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/listings/sub-categories")({ component: SubCategoriesPage });

function SubCategoriesPage() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const subCategoriesQuery = useListingSubCategories();
  const categoriesQuery = useListingCategories();
  const deleteSubCategory = useDeleteListingSubCategory();
  const reorder = useReorderListingSubCategories();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<ListingSubCategory | null>(null);
  if (pathname !== ROUTES.LISTINGS_SUB_CATEGORIES) return <Outlet />;

  const subCategories = subCategoriesQuery.data?.items ?? [];
  const filtered = subCategories.filter(
    (s) => (!categoryFilter || s.categoryId === categoryFilter) && (!search || s.name.toLowerCase().includes(search.toLowerCase())),
  );

  const columns: SortableColumn<ListingSubCategory>[] = [
    {
      key: "name",
      header: "Sub Category Name",
      cell: (r) => (
        <span className="flex items-center gap-2 font-medium">
          {r.icon && <img src={r.icon.url} alt="" className="h-6 w-6 rounded object-contain" />}
          {r.name}
        </span>
      ),
    },
    { key: "category", header: "Category", cell: (r) => <span className="text-sm">{r.category}</span> },
    { key: "type", header: "Type", cell: (r) => <span className="text-sm">{r.type}</span> },
    { key: "status", header: "Status", cell: (r) => <StatusBadge status={r.status} /> },
    { key: "shops", header: "Shops", cell: (r) => r.shopsCount ?? "--" },
    { key: "products", header: "Products", cell: (r) => r.productsCount ?? "--" },
    { key: "services", header: "Services", cell: (r) => r.servicesCount ?? "--" },
    { key: "sort", header: "Sort Order", cell: (r) => r.sortOrder },
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
            onClick={() => navigate({ to: "/listings/sub-categories/$subCategoryId/edit", params: { subCategoryId: r.id } })}
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
        title="Sub Categories"
        description="Manage all sub categories. You can add, edit, delete and reorder sub categories."
        breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "Listings", to: ROUTES.LISTINGS }, { label: "Sub Categories" }]}
        actions={<Button onClick={() => navigate({ to: ROUTES.LISTINGS_SUB_CATEGORIES_ADD })}><Plus className="mr-2 h-4 w-4" />Add New Sub Category</Button>}
      />
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search sub categories..."
        showDateRange={false}
        dropdowns={[{
          key: "category",
          placeholder: "All Categories",
          value: categoryFilter || "all",
          options: [{ label: "All Categories", value: "all" }, ...(categoriesQuery.data?.items ?? []).map((c) => ({ label: c.name, value: c.id }))],
          onChange: (v) => setCategoryFilter(v === "all" ? "" : v),
        }]}
      />
      <SortableList
        columns={columns}
        data={filtered}
        rowKey={(r) => r.id}
        loading={subCategoriesQuery.isLoading}
        page={page}
        pageSize={10}
        onPageChange={setPage}
        onReorder={(pageRows) => {
          const otherIds = filtered.filter((_, idx) => idx < (page - 1) * 10 || idx >= page * 10).map((s) => s.id);
          const before = otherIds.filter((id) => filtered.findIndex((s) => s.id === id) < (page - 1) * 10);
          const after = otherIds.filter((id) => filtered.findIndex((s) => s.id === id) >= page * 10);
          reorder.mutate([...before, ...pageRows.map((s) => s.id), ...after]);
        }}
        emptyTitle="No sub categories found"
      />
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete sub category?"
        description={`This will permanently remove "${deleteTarget?.name}". This action cannot be undone.`}
        confirmLabel="Delete"
        destructive
        onConfirm={async () => {
          if (!deleteTarget) return;
          await deleteSubCategory.mutateAsync(deleteTarget.id);
          toast.success("Sub category deleted");
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
