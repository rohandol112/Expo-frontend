import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { ROUTES } from "@/constants/routes.constants";
import { useListingCategory } from "@/hooks/api/useListingCategories";
import { CategoryForm } from "@/routes/_app/listings/categories/add";

export const Route = createFileRoute("/_app/listings/categories/$categoryId/edit")({ component: EditCategoryPage });

function EditCategoryPage() {
  const { categoryId } = Route.useParams();
  const navigate = useNavigate();
  const categoryQuery = useListingCategory(categoryId);
  const category = categoryQuery.data;

  return (
    <div>
      <PageHeader
        title="Edit Category"
        description="Update the listing category details below."
        breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "Listing Categories", to: ROUTES.LISTINGS_CATEGORIES }, { label: "Edit" }]}
      />
      {!categoryQuery.isLoading && !category && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">Category not found.</div>
      )}
      {category && <CategoryForm initial={category} onDone={() => navigate({ to: ROUTES.LISTINGS_CATEGORIES })} />}
    </div>
  );
}
