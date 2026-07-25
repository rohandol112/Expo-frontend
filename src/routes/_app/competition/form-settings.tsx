import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Eye,
  GripVertical,
  Plus,
  Save,
  Trash2,
  Type,
  AlignLeft,
  ListFilter,
  CheckSquare,
  Calendar,
  Phone,
  Mail,
  ImageIcon,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  useCreateFormField,
  useDeleteFormField,
  useFormFields,
  useReorderFormFields,
  useUpdateFormField,
} from "@/hooks/api/useCompetition";
import type { FormField, FormFieldType } from "@/types/competitionAdmin";
import { ROUTES } from "@/constants/routes.constants";

export const Route = createFileRoute("/_app/competition/form-settings")({
  component: FormSettingsPage,
});

const TYPE_LABELS: Record<FormFieldType, string> = {
  text: "Text Input",
  textarea: "Textarea",
  select: "Select",
  multiselect: "Multi Select",
  date: "Date",
  phone: "Phone Number",
  email: "Email",
  image: "Image Upload",
};

const LEGEND_ITEMS = [
  { label: "Text Input", icon: Type },
  { label: "Textarea", icon: AlignLeft },
  { label: "Select", icon: ListFilter },
  { label: "Multi Select", icon: CheckSquare },
  { label: "Date", icon: Calendar },
  { label: "Phone", icon: Phone },
  { label: "Email", icon: Mail },
  { label: "Image Upload", icon: ImageIcon },
];

function FormSettingsPage() {
  const navigate = useNavigate();
  const fieldsQuery = useFormFields();
  const createField = useCreateFormField();
  const updateField = useUpdateFormField();
  const deleteField = useDeleteFormField();
  const reorder = useReorderFormFields();

  const [activeTab, setActiveTab] = useState<"fields" | "settings">("fields");
  const [rows, setRows] = useState<FormField[]>([]);
  const [dragId, setDragId] = useState<number | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newType, setNewType] = useState<FormFieldType>("text");

  useEffect(() => {
    if (fieldsQuery.data && fieldsQuery.data.length > 0) {
      setRows(fieldsQuery.data);
    }
  }, [fieldsQuery.data]);

  const onDrop = (targetId: number) => {
    if (dragId == null || dragId === targetId) return;
    const from = rows.findIndex((r) => r.id === dragId);
    const to = rows.findIndex((r) => r.id === targetId);
    const next = [...rows];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setRows(next);
    setDragId(null);
    reorder.mutate(
      next.map((r) => r.id),
      { onError: (err) => toast.error(err instanceof Error ? err.message : "Reorder failed") }
    );
  };

  const toggle = (id: number, patch: { is_enabled?: boolean; is_required?: boolean }) => {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    updateField.mutate(
      { id, patch },
      { onError: (err) => toast.error(err instanceof Error ? err.message : "Update failed") }
    );
  };

  const addField = () => {
    if (!newLabel.trim()) return toast.info("Enter a field label");
    createField.mutate(
      { label: newLabel.trim(), field_type: newType, is_required: true, is_enabled: true },
      {
        onSuccess: () => {
          toast.success("Field added successfully");
          setNewLabel("");
          setNewType("text");
          setIsAddOpen(false);
        },
        onError: (err) => toast.error(err instanceof Error ? err.message : "Could not add field"),
      }
    );
  };

  const remove = (f: FormField) => {
    if (f.is_system) return toast.info("System fields cannot be deleted");
    deleteField.mutate(f.id, {
      onSuccess: () => toast.success("Field removed"),
      onError: (err) => toast.error(err instanceof Error ? err.message : "Delete failed"),
    });
  };

  const saveAll = () => {
    toast.success("Form settings saved successfully");
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <PageHeader
        title="Participation Form Settings"
        breadcrumbs={[
          { label: "Dashboard", to: ROUTES.DASHBOARD },
          { label: "Competitions", to: ROUTES.COMPETITION },
          { label: "Ganesh Competition" },
          { label: "Settings", to: ROUTES.COMPETITION_SETTINGS },
          { label: "Participation Form Settings" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs border-blue-200 text-blue-600 hover:bg-blue-50"
              onClick={() => toast.info("Previewing Participation Form...")}
            >
              <Eye className="mr-1.5 h-3.5 w-3.5" /> Preview Form
            </Button>
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold">
                  <Plus className="mr-1.5 h-4 w-4" /> Add New Field
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-sm font-bold">Add New Form Field</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-2 text-xs">
                  <div>
                    <Label className="text-xs font-semibold">Field Label</Label>
                    <Input
                      className="mt-1 text-xs"
                      value={newLabel}
                      onChange={(e) => setNewLabel(e.target.value)}
                      placeholder="e.g. Committee Name, Instagram Handle"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Field Type</Label>
                    <Select value={newType} onValueChange={(v) => setNewType(v as FormFieldType)}>
                      <SelectTrigger className="mt-1 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {(Object.keys(TYPE_LABELS) as FormFieldType[]).map((t) => (
                          <SelectItem key={t} value={t} className="text-xs">
                            {TYPE_LABELS[t]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-xs mt-2" onClick={addField} disabled={createField.isPending}>
                    Add Field
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      {/* Tabs Bar */}
      <div className="flex items-center gap-6 border-b pb-2">
        <button
          onClick={() => setActiveTab("fields")}
          className={`pb-2 text-xs font-bold transition-all border-b-2 ${
            activeTab === "fields"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          Form Fields
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`pb-2 text-xs font-bold transition-all border-b-2 ${
            activeTab === "settings"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          Form Settings
        </button>
      </div>

      {activeTab === "fields" && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Table Section */}
          <div className="lg:col-span-2 rounded-xl border bg-card p-5 shadow-sm space-y-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Form Fields</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Manage which fields are visible in the participation form.
              </p>
            </div>

            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/40 text-[11px] font-semibold text-muted-foreground uppercase border-b">
                  <tr>
                    <th className="p-3 w-8"></th>
                    <th className="p-3">Field Label</th>
                    <th className="p-3">Field Type</th>
                    <th className="p-3">Required</th>
                    <th className="p-3 text-right">Status</th>
                    <th className="p-3 w-8"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {rows.map((f) => (
                    <tr
                      key={f.id}
                      draggable
                      onDragStart={() => setDragId(f.id)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => onDrop(f.id)}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="p-3 cursor-grab text-muted-foreground">
                        <GripVertical className="h-4 w-4" />
                      </td>
                      <td className="p-3 font-semibold text-slate-900">{f.label}</td>
                      <td className="p-3 text-slate-600 font-medium">{TYPE_LABELS[f.field_type]}</td>
                      <td className="p-3">
                        <button
                          onClick={() => toggle(f.id, { is_required: !f.is_required })}
                          className={`rounded px-2.5 py-0.5 text-[10px] font-bold transition-all ${
                            f.is_required
                              ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          {f.is_required ? "Yes" : "No"}
                        </button>
                      </td>
                      <td className="p-3 text-right">
                        <Switch
                          checked={f.is_enabled}
                          onCheckedChange={(v) => toggle(f.id, { is_enabled: v })}
                        />
                      </td>
                      <td className="p-3 text-right">
                        {!f.is_system && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={() => remove(f)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Field Type Legend Bar */}
            <div className="pt-2 border-t flex flex-wrap items-center gap-3 text-[11px] text-slate-600">
              <span className="font-bold text-slate-700">Field Type:</span>
              {LEGEND_ITEMS.map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <div key={idx} className="flex items-center gap-1 font-medium">
                    <IconComponent className="h-3.5 w-3.5 text-slate-500" />
                    <span>{item.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Section - Field Settings Explanation Card */}
          <div className="rounded-xl border bg-card p-5 shadow-sm space-y-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Field Settings</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Toggle status to show/hide fields in the participation form.
              </p>
            </div>

            {/* Info Box */}
            <div className="rounded-xl bg-blue-50/70 border border-blue-100 p-4 space-y-2">
              <div className="flex items-center gap-2 text-blue-700 font-bold text-xs">
                <Info className="h-4 w-4" />
                <span>How it works</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Enable the fields you want participants to fill. Fields with status OFF will not be visible in the participation form.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === "settings" && (
        <div className="rounded-xl border bg-card p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900">Form General Settings</h3>
          <p className="text-xs text-muted-foreground">Configure submission limits and notifications for the participation form.</p>
        </div>
      )}

      {/* Bottom Section - Note & Save Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t">
        <div className="rounded-xl bg-blue-50/70 border border-blue-100 p-4 space-y-1.5 flex-1">
          <div className="flex items-center gap-2 text-blue-700 font-bold text-xs">
            <Info className="h-4 w-4" />
            <span>Note:</span>
          </div>
          <ul className="list-disc pl-5 text-xs text-slate-600 space-y-0.5">
            <li>Drag and drop fields to change the order in the form.</li>
            <li>Only fields with status ON will be visible to participants.</li>
            <li>You can make a field required or optional as per your requirement.</li>
          </ul>
        </div>

        <Button
          onClick={saveAll}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-6 py-2.5 h-auto self-end sm:self-center shadow-sm"
        >
          <Save className="mr-2 h-4 w-4" /> Save Form Settings
        </Button>
      </div>
    </div>
  );
}
