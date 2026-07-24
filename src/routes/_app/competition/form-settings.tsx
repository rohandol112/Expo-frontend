import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Eye, GripVertical, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { SectionCard } from "@/components/admin/SectionCard";
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
  useCreateFormField,
  useDeleteFormField,
  useFormFields,
  useReorderFormFields,
  useUpdateFormField,
} from "@/hooks/api/useCompetition";
import type { FormField, FormFieldType } from "@/types/competitionAdmin";
import { ROUTES } from "@/constants/routes.constants";

export const Route = createFileRoute("/_app/competition/form-settings")({ component: FormSettingsPage });

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

function FormSettingsPage() {
  const navigate = useNavigate();
  const fieldsQuery = useFormFields();
  const createField = useCreateFormField();
  const updateField = useUpdateFormField();
  const deleteField = useDeleteFormField();
  const reorder = useReorderFormFields();

  const [rows, setRows] = useState<FormField[]>([]);
  const [dragId, setDragId] = useState<number | null>(null);
  const [newLabel, setNewLabel] = useState("");
  const [newType, setNewType] = useState<FormFieldType>("text");

  useEffect(() => {
    if (fieldsQuery.data) setRows(fieldsQuery.data);
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
    reorder.mutate(next.map((r) => r.id), {
      onError: (err) => toast.error(err instanceof Error ? err.message : "Reorder failed"),
    });
  };

  const toggle = (id: number, patch: { is_enabled?: boolean; is_required?: boolean }) => {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    updateField.mutate({ id, patch }, { onError: (err) => toast.error(err instanceof Error ? err.message : "Update failed") });
  };

  const addField = () => {
    if (!newLabel.trim()) return toast.info("Enter a field label");
    createField.mutate(
      { label: newLabel.trim(), field_type: newType, is_required: false, is_enabled: true },
      {
        onSuccess: () => {
          toast.success("Field added");
          setNewLabel("");
          setNewType("text");
        },
        onError: (err) => toast.error(err instanceof Error ? err.message : "Could not add field"),
      },
    );
  };

  const remove = (f: FormField) => {
    if (f.is_system) return toast.info("System fields can't be deleted");
    deleteField.mutate(f.id, {
      onSuccess: () => toast.success("Field removed"),
      onError: (err) => toast.error(err instanceof Error ? err.message : "Delete failed"),
    });
  };

  return (
    <div>
      <PageHeader
        title="Participation Form Settings"
        breadcrumbs={[
          { label: "Dashboard", to: ROUTES.DASHBOARD },
          { label: "Competition", to: ROUTES.COMPETITION },
          { label: "Settings", to: ROUTES.COMPETITION_SETTINGS },
          { label: "Participation Form Settings" },
        ]}
        actions={
          <Button variant="outline" onClick={() => navigate({ to: ROUTES.COMPETITION_SETTINGS })}>
            <Eye className="mr-2 h-4 w-4" />
            Back to Settings
          </Button>
        }
      />

      {fieldsQuery.error && (
        <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          Unable to load form fields from backend.
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard className="lg:col-span-2" title="Form Fields" description="Manage which fields are visible in the participation form. Drag to reorder.">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="w-8 pb-2" />
                  <th className="pb-2">Field Label</th>
                  <th className="pb-2">Field Type</th>
                  <th className="pb-2">Required</th>
                  <th className="pb-2 text-right">Status</th>
                  <th className="w-10 pb-2" />
                </tr>
              </thead>
              <tbody>
                {rows.map((f) => (
                  <tr
                    key={f.id}
                    draggable
                    onDragStart={() => setDragId(f.id)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => onDrop(f.id)}
                    className="border-b last:border-0 hover:bg-muted/40"
                  >
                    <td className="cursor-grab py-3 text-muted-foreground"><GripVertical className="h-4 w-4" /></td>
                    <td className="py-3 font-medium">{f.label}</td>
                    <td className="py-3 text-muted-foreground">{TYPE_LABELS[f.field_type]}</td>
                    <td className="py-3">
                      <button
                        onClick={() => toggle(f.id, { is_required: !f.is_required })}
                        className={f.is_required ? "rounded bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700" : "rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600"}
                      >
                        {f.is_required ? "Yes" : "No"}
                      </button>
                    </td>
                    <td className="py-3 text-right">
                      <Switch checked={f.is_enabled} onCheckedChange={(v) => toggle(f.id, { is_enabled: v })} />
                    </td>
                    <td className="py-3 text-right">
                      {!f.is_system && (
                        <Button variant="ghost" size="icon" onClick={() => remove(f)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 border-t pt-3 text-xs text-muted-foreground">
            Drag to reorder. Fields with status OFF won't be visible in the participation form. Toggle Required to make a field mandatory.
          </p>
        </SectionCard>

        <div className="space-y-4">
          <SectionCard title="Add New Field" description="Create a custom field for the participation form.">
            <div className="space-y-3">
              <div>
                <Label>Field Label</Label>
                <Input className="mt-1" value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="e.g. Website" />
              </div>
              <div>
                <Label>Field Type</Label>
                <Select value={newType} onValueChange={(v) => setNewType(v as FormFieldType)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(Object.keys(TYPE_LABELS) as FormFieldType[]).map((t) => (
                      <SelectItem key={t} value={t}>{TYPE_LABELS[t]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full" onClick={addField} disabled={createField.isPending}>
                <Plus className="mr-2 h-4 w-4" />
                Add Field
              </Button>
            </div>
          </SectionCard>

          <SectionCard title="How it works">
            <p className="text-sm text-muted-foreground">
              Enable the fields you want participants to fill. Fields with status OFF will not be shown in the participation form.
              Changes save automatically.
            </p>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
