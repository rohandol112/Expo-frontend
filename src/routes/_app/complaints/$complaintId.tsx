import { createFileRoute } from "@tanstack/react-router";
import { MapPin, Save } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionCard } from "@/components/admin/SectionCard";
import { ChatBox } from "@/components/admin/ChatBox";
import { Timeline } from "@/components/admin/Timeline";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { complaints } from "@/mock/complaints.mock";
import { ROUTES } from "@/constants/routes.constants";

export const Route = createFileRoute("/_app/complaints/$complaintId")({ component: ComplaintDetailPage });

function ComplaintDetailPage() {
  const { complaintId } = Route.useParams();
  const complaint = complaints.find((item) => item.id === complaintId) ?? complaints[0];
  return (
    <div>
      <PageHeader title="Complaint Detail" breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "Complaints", to: ROUTES.COMPLAINTS }, { label: complaint.id }]} actions={<Button><Save className="mr-2 h-4 w-4" />Update Status</Button>} />
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <SectionCard title={complaint.title} description={complaint.description}>
            <div className="grid gap-3 text-sm md:grid-cols-3"><Meta label="Category" value={complaint.category} /><Meta label="Priority" value={complaint.priority} /><Meta label="Location" value={complaint.location} /></div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">{complaint.images.length ? complaint.images.map((image) => <img key={image} src={image} alt="" className="h-32 w-full rounded-lg object-cover" />) : <div className="rounded-lg border bg-muted/30 p-6 text-sm text-muted-foreground">No images attached</div>}</div>
          </SectionCard>
          <SectionCard title="Conversation"><ChatBox messages={[{ id: "m1", sender: complaint.reportedBy, message: complaint.description, time: "20 May 2026, 10:30 AM" }, { id: "m2", sender: "Support", message: "Thanks, we are reviewing the complaint details.", time: "20 May 2026, 11:10 AM", own: true }]} /></SectionCard>
        </div>
        <div className="space-y-6">
          <SectionCard title="Submitted By"><Meta label="Name" value={complaint.reportedBy} /><Meta label="Language" value={complaint.language} /><Meta label="Registered On" value={complaint.registeredOn} /></SectionCard>
          <SectionCard title="Workflow">
            <div className="space-y-3">
              <Select defaultValue={complaint.status}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["Pending", "Active", "Resolved"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
              <Select defaultValue={complaint.assignedTo}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["Priya Admin", "Rohit Support", "Unassigned"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
              <Button variant="outline" className="w-full"><MapPin className="mr-2 h-4 w-4" />Map Placeholder</Button>
            </div>
          </SectionCard>
          <SectionCard title="Status Timeline"><Timeline items={[{ id: "t1", title: "Complaint registered", description: "Submitted by user", time: complaint.registeredOn }, { id: "t2", title: "Assigned", description: `Assigned to ${complaint.assignedTo}`, time: "21 May 2026" }, { id: "t3", title: "Current status", description: String(complaint.status), time: "Today" }]} /></SectionCard>
        </div>
      </div>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return <div className="mb-3"><p className="text-xs text-muted-foreground">{label}</p><p className="text-sm font-medium">{value}</p></div>;
}
