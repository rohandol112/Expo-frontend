import { createFileRoute } from "@tanstack/react-router";
import { FileText, Headphones, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionCard } from "@/components/admin/SectionCard";
import { ROUTES } from "@/constants/routes.constants";

export const Route = createFileRoute("/_app/cms")({ component: CmsPage });

function CmsPage() {
  return (
    <div>
      <PageHeader title="CMS" breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "CMS" }]} />
      <div className="grid gap-5 lg:grid-cols-3">
        <SectionCard title="Privacy Policy" description="Manage privacy policy copy shown in the app."><ShieldCheck className="h-8 w-8 text-primary" /></SectionCard>
        <SectionCard title="Terms & Condition" description="Maintain platform terms and user agreements."><FileText className="h-8 w-8 text-primary" /></SectionCard>
        <SectionCard title="Support & Contact Page" description="Configure helpdesk, contact, and support content."><Headphones className="h-8 w-8 text-primary" /></SectionCard>
      </div>
    </div>
  );
}
