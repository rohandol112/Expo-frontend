import { createFileRoute } from "@tanstack/react-router";
import { Save } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { FormSection } from "@/components/forms/FormSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ROUTES } from "@/constants/routes.constants";

export const Route = createFileRoute("/_app/listings/add")({ component: AddListingPage });

function AddListingPage() {
  return (
    <div>
      <PageHeader title="Add Listing" breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "Listings", to: ROUTES.LISTINGS }, { label: "Add Listing" }]} actions={<Button><Save className="mr-2 h-4 w-4" />Save Listing</Button>} />
      <FormSection title="Listing Details" description="Static listing form until listing APIs are available.">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Listing Name"><Input placeholder="Gupta Electronics" /></Field>
          <Field label="Type"><Select><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger><SelectContent><SelectItem value="Shop">Shop</SelectItem><SelectItem value="Service">Service</SelectItem></SelectContent></Select></Field>
          <Field label="Category"><Input placeholder="Electronics" /></Field>
          <Field label="Subcategory"><Input placeholder="Mobiles" /></Field>
          <Field label="City"><Input placeholder="Pune" /></Field>
          <Field label="Contact"><Input placeholder="+91 98765 43210" /></Field>
        </div>
      </FormSection>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label>{label}</Label>{children}</div>;
}
