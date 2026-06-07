import { Outlet, createFileRoute, useLocation, useNavigate } from "@tanstack/react-router";
import { Download, Plus, Store, Wrench, ListChecks, ToggleLeft, ToggleRight } from "lucide-react";
import { AdminListPage } from "@/components/admin/AdminListPage";
import { ActionMenu } from "@/components/common/ActionMenu";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { listings } from "@/mock/listings.mock";
import type { Listing } from "@/types/listing";
import type { Column } from "@/components/tables/DataTable";
import { ROUTES } from "@/constants/routes.constants";

export const Route = createFileRoute("/_app/listings")({ component: ListingsPage });

function ListingsPage() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  if (pathname !== ROUTES.LISTINGS) return <Outlet />;
  const columns: Column<Listing>[] = [
    { key: "listing", header: "Listing", cell: (r) => <span className="font-medium">{r.name}</span> },
    { key: "type", header: "Type", cell: (r) => r.type },
    { key: "category", header: "Category", cell: (r) => r.category },
    { key: "sub", header: "Subcategory", cell: (r) => r.subcategory },
    { key: "city", header: "City", cell: (r) => r.city },
    { key: "contact", header: "Contact", cell: (r) => r.contact },
    { key: "created", header: "Created On", cell: (r) => r.createdOn },
    { key: "views", header: "Views", cell: (r) => r.views.toLocaleString() },
    { key: "status", header: "Status", cell: (r) => <StatusBadge status={r.status} /> },
    { key: "actions", header: "Actions", cell: () => <ActionMenu /> },
  ];
  return <AdminListPage title="Listings" breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "Listings" }]} actions={<><Button variant="outline"><Download className="mr-2 h-4 w-4" />Export</Button><Button onClick={() => navigate({ to: ROUTES.LISTINGS_ADD })}><Plus className="mr-2 h-4 w-4" />Add Listing</Button></>} stats={[{ title: "Total Listings", value: listings.length, icon: ListChecks, variant: "blue" }, { title: "Shops", value: listings.filter((l) => l.type === "Shop").length, icon: Store, variant: "green" }, { title: "Services", value: listings.filter((l) => l.type === "Service").length, icon: Wrench, variant: "amber" }, { title: "Active Listings", value: listings.filter((l) => l.status === "Active").length, icon: ToggleRight, variant: "violet" }, { title: "Inactive Listings", value: listings.filter((l) => l.status === "Inactive").length, icon: ToggleLeft, variant: "rose" }]} data={listings} columns={columns} rowKey={(r) => r.id} searchPlaceholder="Search listings..." showDateRange dropdowns={[{ key: "type", placeholder: "Type", options: ["Shop", "Service"].map((s) => ({ label: s, value: s })) }, { key: "category", placeholder: "Category", options: ["Electronics", "Home Repair", "Retail"].map((s) => ({ label: s, value: s })) }, { key: "sub", placeholder: "Subcategory", options: ["Mobiles", "Plumbing", "Fashion"].map((s) => ({ label: s, value: s })) }, { key: "city", placeholder: "City", options: ["Pune", "Mumbai", "Lucknow"].map((s) => ({ label: s, value: s })) }, { key: "status", placeholder: "Status", options: ["Active", "Inactive"].map((s) => ({ label: s, value: s })) }]} filter={(row, search) => [row.name, row.category, row.city].some((v) => v.toLowerCase().includes(search.toLowerCase()))} />;
}
