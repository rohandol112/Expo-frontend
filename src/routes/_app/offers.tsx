import { Outlet, createFileRoute, useLocation, useNavigate } from "@tanstack/react-router";
import { Plus, ShoppingBag, Store, Wrench } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatsGrid } from "@/components/admin/StatsGrid";
import { DataTable, type Column } from "@/components/tables/DataTable";
import { ActionMenu } from "@/components/common/ActionMenu";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { offers } from "@/mock/offers.mock";
import type { Offer } from "@/types/offer";
import { ROUTES } from "@/constants/routes.constants";

export const Route = createFileRoute("/_app/offers")({ component: OffersPage });

function OffersPage() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  if (pathname !== ROUTES.OFFERS) return <Outlet />;
  const columns: Column<Offer>[] = [
    { key: "category", header: "Category", cell: (r) => <span className="font-medium">{r.category}</span> },
    { key: "type", header: "Type", cell: (r) => r.type },
    { key: "sub", header: "Subcategories", cell: (r) => r.subcategories.join(", ") },
    { key: "created", header: "Created On", cell: (r) => r.createdOn },
    { key: "actions", header: "Actions", cell: () => <ActionMenu /> },
  ];
  return (
    <div>
      <PageHeader title="Offers" breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "Offers" }]} actions={<Button onClick={() => navigate({ to: ROUTES.OFFERS_ADD })}><Plus className="mr-2 h-4 w-4" />Add Offer</Button>} />
      <StatsGrid items={[{ title: "Product Offers", value: offers.filter((o) => o.type === "Product").length, icon: ShoppingBag, variant: "blue" }, { title: "Service Offers", value: offers.filter((o) => o.type === "Service").length, icon: Wrench, variant: "green" }, { title: "Shop Offers", value: offers.filter((o) => o.type === "Shop").length, icon: Store, variant: "amber" }]} />
      <Tabs defaultValue="Product">
        <TabsList className="mb-4"><TabsTrigger value="Product">Product</TabsTrigger><TabsTrigger value="Service">Service</TabsTrigger><TabsTrigger value="Shop">Shop</TabsTrigger></TabsList>
        {["Product", "Service", "Shop"].map((type) => <TabsContent key={type} value={type}><DataTable columns={columns} data={offers.filter((o) => o.type === type)} rowKey={(r) => r.id} /></TabsContent>)}
      </Tabs>
    </div>
  );
}
