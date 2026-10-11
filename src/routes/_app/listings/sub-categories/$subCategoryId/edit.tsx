import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { ROUTES } from "@/constants/routes.constants";
import { useListingSubCategory } from "@/hooks/api/useListingSubCategories";
import { SubCategoryForm } from "@/routes/_app/listings/sub-categories/add";

export const Route = createFileRoute("/_app/listings/sub-categories/$subCategoryId/edit")({ component: EditSubCategoryPage });

function EditSubCategoryPage() {
  const { subCategoryId } = Route.useParams();
  const navigate = useNavigate();
  const subCategoryQuery = useListingSubCategory(subCategoryId);
  const subCategory = subCategoryQuery.data;

  return (
    <div>
      <PageHeader
        title="Edit Sub Category"
        description="Update the sub category details below."
        breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "Listing Categories", to: ROUTES.LISTINGS_CATEGORIES }, { label: "Sub Categories", to: ROUTES.LISTINGS_SUB_CATEGORIES }, { label: "Edit" }]}
      />
      {!subCategoryQuery.isLoading && !subCategory && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">Sub category not found.</div>
      )}
      {subCategory && <SubCategoryForm initial={subCategory} onDone={() => navigate({ to: ROUTES.LISTINGS_SUB_CATEGORIES })} />}
    </div>
  );
}
