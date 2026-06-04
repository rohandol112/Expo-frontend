import { createFileRoute } from "@tanstack/react-router";
import { Save } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { FormSection } from "@/components/forms/FormSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ROUTES } from "@/constants/routes.constants";

export const Route = createFileRoute("/_app/offers/add")({ component: AddOfferPage });

function AddOfferPage() {
  return (
    <div>
      <PageHeader title="Add Offer" breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "Offers", to: ROUTES.OFFERS }, { label: "Add Offer" }]} actions={<Button><Save className="mr-2 h-4 w-4" />Save Offer</Button>} />
      <FormSection title="Offer Details" description="Static setup page until offer management APIs are added.">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Category"><Input placeholder="Electronics" /></Field>
          <Field label="Type"><Select><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger><SelectContent><SelectItem value="Product">Product</SelectItem><SelectItem value="Service">Service</SelectItem><SelectItem value="Shop">Shop</SelectItem></SelectContent></Select></Field>
          <Field label="Subcategories"><Input placeholder="Mobiles, Accessories" /></Field>
          <Field label="Status"><Select><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger><SelectContent><SelectItem value="Active">Active</SelectItem><SelectItem value="Inactive">Inactive</SelectItem></SelectContent></Select></Field>
        </div>
      </FormSection>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label>{label}</Label>{children}</div>;
}
