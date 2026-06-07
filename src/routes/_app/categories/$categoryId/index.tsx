import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Edit, FileText, ImageIcon, ListOrdered } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatsCard } from "@/components/common/StatsCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes.constants";
import { useCategory, useCategorySubcategories } from "@/hooks/api/useCategories";

export const Route = createFileRoute("/_app/categories/$categoryId/")({ component: CategoryDetailPage });

function CategoryDetailPage() {
  const { categoryId } = Route.useParams();
  const navigate = useNavigate();
  const categoryQuery = useCategory(categoryId);
  const subcategoriesQuery = useCategorySubcategories(categoryId, { page: 1, per_page: 100 });
  const category = categoryQuery.data;

  return (
    <div>
      <PageHeader
        title={category?.name ?? "Category Details"}
        breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "Categories", to: ROUTES.CATEGORIES }, { label: "Details" }]}
        actions={<Button onClick={() => navigate({ to: "/categories/$categoryId/edit", params: { categoryId } })}><Edit className="mr-2 h-4 w-4" />Edit Category</Button>}
      />
      {categoryQuery.error && <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">Unable to load category from backend.</div>}
      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard title="Posts" value={(category?.posts ?? 0).toLocaleString()} icon={FileText} variant="green" />
        <StatsCard title="Display Order" value={category?.displayOrder ?? 0} icon={ListOrdered} variant="blue" />
        <StatsCard title="Subcategories" value={subcategoriesQuery.data?.items.length ?? 0} icon={ImageIcon} variant="amber" />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="rounded-lg border bg-card p-4">
          {category?.imageUrl ? <img src={category.imageUrl} alt="" className="aspect-square w-full rounded-md object-cover" /> : <div className="flex aspect-square items-center justify-center rounded-md bg-muted"><ImageIcon className="h-8 w-8 text-muted-foreground" /></div>}
        </div>
        <div className="rounded-lg border bg-card p-6">
          <dl className="grid gap-4 md:grid-cols-2">
            <Detail label="Category Name" value={category?.name} />
            <Detail label="Slug" value={category?.slug} />
            <Detail label="Language" value={category?.language} />
            <div><dt className="text-xs font-medium uppercase text-muted-foreground">Status</dt><dd className="mt-1">{category && <StatusBadge status={category.status} />}</dd></div>
            <Detail label="Featured" value={category?.featured ? "Yes" : "No"} />
            <Detail label="Created On" value={category?.createdOn} />
            <Detail label="Updated On" value={category?.updatedOn} />
          </dl>
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value?: string | number }) {
  return <div><dt className="text-xs font-medium uppercase text-muted-foreground">{label}</dt><dd className="mt-1 text-sm font-medium">{value || "—"}</dd></div>;
}
