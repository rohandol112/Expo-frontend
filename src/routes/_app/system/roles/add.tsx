import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState, type Dispatch, type SetStateAction } from "react";
import { ArrowLeft, ArrowRight, Check, Save, Search } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { Stepper } from "@/components/forms/Stepper";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ROUTES } from "@/constants/routes.constants";

export const Route = createFileRoute("/_app/system/roles/add")({ component: AddRolePage });

const steps = [
  { title: "Select Scope", description: "Choose role access boundary" },
  { title: "Role Details", description: "Add role identity" },
  { title: "Permissions", description: "Configure module access" },
  { title: "Review", description: "Confirm and create" },
];

const modules = ["Dashboard", "News Management", "User News Management", "Categories", "Channels", "Complaint", "Users", "Reports", "Notification", "Referrals & Points", "Offers", "Listings", "Monetization", "Language", "Location", "Role & Permission", "Settings"];
const permissionColumns = ["List/View", "Add", "Update/Edit", "Status Change", "Delete", "Draft", "Publish", "Notification", "Translation"];
const contentTypes = ["Article", "Video", "Story", "Shorts"];

function AddRolePage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [moduleSearch, setModuleSearch] = useState("");
  const filteredModules = modules.filter((module) => module.toLowerCase().includes(moduleSearch.toLowerCase()));
  const selectedCount = Object.values(selected).filter(Boolean).length;
  const selectedModules = useMemo(() => modules.filter((module) => permissionColumns.some((permission) => selected[`${module}-${permission}`])), [selected]);

  const toggleAll = (checked: boolean) => {
    const next: Record<string, boolean> = {};
    modules.forEach((module) => {
      permissionColumns.forEach((permission) => { next[`${module}-${permission}`] = checked; });
      contentTypes.forEach((type) => { next[`${module}-type-${type}`] = checked; });
    });
    setSelected(next);
  };

  const createRole = () => {
    toast.success("Role created locally");
    navigate({ to: ROUTES.SYS_ROLES });
  };

  return (
    <div>
      <PageHeader title="Create Role" breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "Roles", to: ROUTES.SYS_ROLES }, { label: "Create Role" }]} />
      <div className="mb-6 rounded-lg border bg-card p-5"><Stepper steps={steps} current={step} /></div>

      {step === 0 && <ScopeStep />}
      {step === 1 && <DetailsStep />}
      {step === 2 && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 rounded-lg border bg-card p-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={moduleSearch} onChange={(event) => setModuleSearch(event.target.value)} className="pl-9" placeholder="Search module" />
            </div>
            <Button variant="outline" onClick={() => toggleAll(true)}>Select All</Button>
            <Button variant="outline" onClick={() => toggleAll(false)}>Deselect All</Button>
          </div>
          <div className="overflow-x-auto rounded-lg border bg-card">
            <table className="w-full min-w-[1180px] text-sm">
              <thead className="bg-muted/40 text-xs text-muted-foreground">
                <tr>
                  <th className="sticky left-0 bg-muted/40 px-3 py-3 text-left">Module</th>
                  {permissionColumns.map((permission) => <th key={permission} className="px-3 py-3 text-center">{permission}</th>)}
                  {contentTypes.map((type) => <th key={type} className="px-3 py-3 text-center">{type}</th>)}
                </tr>
              </thead>
              <tbody>
                {filteredModules.map((module) => (
                  <tr key={module} className="border-t">
                    <td className="sticky left-0 bg-card px-3 py-3 font-medium">{module}</td>
                    {permissionColumns.map((permission) => <CheckCell key={permission} id={`${module}-${permission}`} selected={selected} setSelected={setSelected} />)}
                    {contentTypes.map((type) => <CheckCell key={type} id={`${module}-type-${type}`} selected={selected} setSelected={setSelected} />)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {step === 3 && <ReviewStep selectedCount={selectedCount} selectedModules={selectedModules} />}

      <div className="mt-6 flex justify-between">
        <Button variant="outline" onClick={() => (step === 0 ? navigate({ to: ROUTES.SYS_ROLES }) : setStep((value) => value - 1))}>
          <ArrowLeft className="mr-2 h-4 w-4" />{step === 0 ? "Cancel" : "Previous"}
        </Button>
        {step < 3 ? (
          <Button onClick={() => setStep((value) => value + 1)}>Next Step<ArrowRight className="ml-2 h-4 w-4" /></Button>
        ) : (
          <Button onClick={createRole}><Save className="mr-2 h-4 w-4" />Create Role</Button>
        )}
      </div>
    </div>
  );
}

function ScopeStep() {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <ScopeCard title="Language & Location">
        <SelectField label="Language" placeholder="Select language" items={["Hindi", "English", "Gujarati", "Marathi"]} />
        <SelectField label="State" placeholder="Select state" items={["Madhya Pradesh", "Uttar Pradesh", "Delhi", "Maharashtra"]} />
        <SelectField label="District" placeholder="Select district" items={["Bhopal", "Lucknow", "New Delhi", "Mumbai"]} />
        <SelectField label="Area" placeholder="Select area" items={["MP Nagar", "Hazratganj", "Connaught Place", "Andheri"]} />
      </ScopeCard>
      <ScopeCard title="Channel">
        <SelectField label="Channel" placeholder="Select channel" items={["Pehli Baat", "City Updates", "Sports Desk", "Business Wire"]} />
      </ScopeCard>
      <p className="rounded-lg border bg-amber-50 px-4 py-3 text-sm text-amber-800 xl:col-span-2">Users will only see/manage content based on selected scope.</p>
    </div>
  );
}

function DetailsStep() {
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
      <div className="rounded-lg border bg-card p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Role Name"><Input placeholder="Enter role name" /></Field>
          <Field label="Email Address"><Input placeholder="role.user@example.com" /></Field>
          <Field label="Password"><Input type="password" placeholder="Create password" /></Field>
          <SelectField label="Role Icon" placeholder="Select icon" items={["Shield", "Editor", "User", "Support"]} />
          <SelectField label="Role Color" placeholder="Select color" items={["Red", "Blue", "Green", "Violet"]} />
        </div>
        <Field label="Description"><Textarea placeholder="Describe this role" className="min-h-28" /></Field>
        <Field label="Role Type">
          <RadioGroup defaultValue="custom" className="grid gap-3 md:grid-cols-2">
            {["System Role", "Custom Role"].map((label) => <label key={label} className="flex items-center gap-2 rounded-md border p-3"><RadioGroupItem value={label.toLowerCase().replace(" ", "-")} />{label}</label>)}
          </RadioGroup>
        </Field>
      </div>
      <div className="rounded-lg border bg-card p-5">
        <h2 className="mb-4 font-semibold">Role Summary</h2>
        <div className="space-y-3 text-sm">
          <Summary label="Scope" value="Language & Location" />
          <Summary label="Language" value="Hindi" />
          <Summary label="Location" value="Madhya Pradesh / Bhopal" />
          <Summary label="Users with this role" value="0" />
          <Summary label="Created on" value="Today" />
          <Summary label="Last updated" value="Not saved" />
        </div>
      </div>
    </div>
  );
}

function ReviewStep({ selectedCount, selectedModules }: { selectedCount: number; selectedModules: string[] }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <ReviewCard title="Scope" rows={[["Scope", "Language & Location"], ["Language", "Hindi"], ["Location", "Madhya Pradesh / Bhopal / MP Nagar"], ["Channel", "Not selected"]]} />
      <ReviewCard title="Role Details" rows={[["Role Name", "Custom Admin Role"], ["Role Type", "Custom Role"], ["Email", "role.user@example.com"], ["Status", "Active"]]} />
      <ReviewCard title="Permissions" rows={[["Selected permissions", String(selectedCount)], ["Selected modules", selectedModules.length ? selectedModules.join(", ") : "No modules selected"]]} />
      <ReviewCard title="Content Types" rows={[["Article", "Enabled"], ["Video", "Enabled"], ["Story", "Enabled"], ["Shorts", "Enabled"]]} />
    </div>
  );
}

function CheckCell({ id, selected, setSelected }: { id: string; selected: Record<string, boolean>; setSelected: Dispatch<SetStateAction<Record<string, boolean>>> }) {
  return <td className="px-3 py-3 text-center"><Checkbox checked={selected[id] === true} onCheckedChange={(checked) => setSelected((value) => ({ ...value, [id]: checked === true }))} /></td>;
}

function ScopeCard({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-lg border bg-card p-5"><h2 className="mb-4 text-base font-semibold">{title}</h2><div className="space-y-4">{children}</div></section>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="mb-4 space-y-2"><Label>{label}</Label>{children}</div>;
}

function SelectField({ label, placeholder, items }: { label: string; placeholder: string; items: string[] }) {
  return <Field label={label}><Select><SelectTrigger><SelectValue placeholder={placeholder} /></SelectTrigger><SelectContent>{items.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></Field>;
}

function Summary({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between gap-4 border-b pb-2"><span className="text-muted-foreground">{label}</span><span className="font-medium">{value}</span></div>;
}

function ReviewCard({ title, rows }: { title: string; rows: Array<[string, string]> }) {
  return <section className="rounded-lg border bg-card p-5"><h2 className="mb-4 flex items-center gap-2 text-base font-semibold"><Check className="h-4 w-4 text-emerald-600" />{title}</h2><div className="space-y-3">{rows.map(([label, value]) => <Summary key={label} label={label} value={value} />)}</div></section>;
}
