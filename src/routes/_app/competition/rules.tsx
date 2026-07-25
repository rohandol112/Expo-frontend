import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  Calendar,
  CalendarCheck,
  Gift,
  Image as ImageIcon,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
  Trophy,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCompetitionRules, useCreateRule, useDeleteRule, useUpdateRule } from "@/hooks/api/useCompetition";
import type { CompetitionRule } from "@/types/competitionAdmin";
import { ROUTES } from "@/constants/routes.constants";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/competition/rules")({ component: RulesPage });

const ICONS: Record<string, { icon: LucideIcon; bg: string; fg: string }> = {
  user: { icon: User, bg: "bg-emerald-50", fg: "text-emerald-600" },
  calendar: { icon: Calendar, bg: "bg-blue-50", fg: "text-blue-600" },
  "calendar-check": { icon: CalendarCheck, bg: "bg-emerald-50", fg: "text-emerald-600" },
  image: { icon: ImageIcon, bg: "bg-orange-50", fg: "text-orange-600" },
  gift: { icon: Gift, bg: "bg-pink-50", fg: "text-pink-600" },
  "alert-triangle": { icon: AlertTriangle, bg: "bg-rose-50", fg: "text-rose-600" },
  trophy: { icon: Trophy, bg: "bg-violet-50", fg: "text-violet-600" },
  "shield-check": { icon: ShieldCheck, bg: "bg-indigo-50", fg: "text-indigo-600" },
};

interface RuleFormState {
  title: string;
  icon: string;
  short_note: string;
  details: string;
  is_important: boolean;
  is_active: boolean;
}

const EMPTY_FORM: RuleFormState = {
  title: "",
  icon: "user",
  short_note: "",
  details: "",
  is_important: false,
  is_active: true,
};

function RulesPage() {
  const [tab, setTab] = useState<"all" | "important">("all");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<CompetitionRule | null>(null);
  const [form, setForm] = useState<RuleFormState>(EMPTY_FORM);
  const [toDelete, setToDelete] = useState<CompetitionRule | null>(null);

  const rulesQuery = useCompetitionRules();
  const createRule = useCreateRule();
  const updateRule = useUpdateRule();
  const deleteRule = useDeleteRule();

  const allRules = rulesQuery.data ?? [];
  const rules = useMemo(
    () => allRules.filter((r) => (tab === "important" ? r.is_important : !r.is_important)),
    [allRules, tab],
  );

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM, is_important: tab === "important" });
    setEditorOpen(true);
  };

  const openEdit = (rule: CompetitionRule) => {
    setEditing(rule);
    setForm({
      title: rule.title,
      icon: rule.icon ?? "user",
      short_note: rule.short_note,
      details: rule.details.join("\n"),
      is_important: rule.is_important,
      is_active: rule.is_active,
    });
    setEditorOpen(true);
  };

  const save = () => {
    if (!form.title.trim()) return toast.info("Enter a rule title");
    const payload = {
      title: form.title.trim(),
      icon: form.icon,
      short_note: form.short_note.trim(),
      details: form.details
        .split("\n")
        .map((l) => l.replace(/^[•\-\s]+/, "").trim())
        .filter(Boolean),
      is_important: form.is_important,
      is_active: form.is_active,
    };
    const opts = {
      onSuccess: () => {
        toast.success(editing ? "Rule updated" : "Rule added");
        setEditorOpen(false);
      },
      onError: (err: unknown) => toast.error(err instanceof Error ? err.message : "Save failed"),
    };
    if (editing) updateRule.mutate({ id: editing.id, patch: payload }, opts);
    else createRule.mutate(payload, opts);
  };

  return (
    <div>
      <PageHeader
        title="Competition Rules"
        breadcrumbs={[
          { label: "Dashboard", to: ROUTES.DASHBOARD },
          { label: "Competition", to: ROUTES.COMPETITION },
          { label: "Competition Rules" },
        ]}
        actions={
          <Button className="bg-rose-600 hover:bg-rose-700" onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" /> Add New Rule
          </Button>
        }
      />
      <p className="-mt-4 mb-5 text-xs font-medium text-muted-foreground">
        Manage all competition rules and guidelines.
      </p>

      {/* Notice card */}
      <div className="mb-5 flex items-center gap-4 rounded-xl border border-rose-100 bg-rose-50/50 px-5 py-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-100">
          <Trophy className="h-6 w-6 text-amber-600" />
        </div>
        <div>
          <p className="text-sm font-bold text-foreground">Please read all the rules carefully</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            By participating in the Pehli Baat Ganpati Competition, you agree to follow all the rules and decisions made by
            the organizer.
          </p>
        </div>
      </div>

      <div className="rounded-xl border bg-card shadow-sm">
        {/* Tabs */}
        <div className="flex items-center border-b px-4 pt-2">
          {(
            [
              { key: "all", label: "All Rules" },
              { key: "important", label: "Important Note" },
            ] as const
          ).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "-mb-px border-b-2 px-3.5 py-2.5 text-xs font-semibold transition-colors",
                tab === t.key ? "border-rose-600 text-rose-600" : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 text-[11px] font-semibold uppercase text-muted-foreground">
              <tr>
                <th className="w-12 p-3">#</th>
                <th className="w-[22%] p-3">Rule Section</th>
                <th className="w-[26%] p-3">Short Note</th>
                <th className="p-3">Full Note (Details)</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rulesQuery.isLoading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">
                    Loading rules…
                  </td>
                </tr>
              ) : rules.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">
                    {tab === "important" ? "No important note added yet." : "No rules added yet."}
                  </td>
                </tr>
              ) : (
                rules.map((rule, idx) => {
                  const iconDef = ICONS[rule.icon ?? ""] ?? ICONS.user;
                  const Icon = iconDef.icon;
                  return (
                    <tr key={rule.id} className={cn("align-top transition-colors hover:bg-muted/30", !rule.is_active && "opacity-50")}>
                      <td className="p-3 text-muted-foreground">{idx + 1}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2.5">
                          <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full", iconDef.bg)}>
                            <Icon className={cn("h-4 w-4", iconDef.fg)} />
                          </div>
                          <p className="font-bold text-foreground">
                            {rule.is_important ? rule.title : `${idx + 1}. ${rule.title}`}
                          </p>
                        </div>
                      </td>
                      <td className="p-3 leading-relaxed text-slate-600">{rule.short_note || "—"}</td>
                      <td className="p-3">
                        {rule.details.length > 0 ? (
                          <ul className="list-disc space-y-1 pl-4 leading-relaxed text-slate-600">
                            {rule.details.map((d, i) => (
                              <li key={i}>{d}</li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => openEdit(rule)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 border-rose-200 text-rose-600 hover:bg-rose-50"
                            onClick={() => setToDelete(rule)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t px-4 py-3 text-sm text-muted-foreground">
          Showing 1 to {rules.length} of {rules.length} rules
        </div>
      </div>

      {/* Create / edit dialog */}
      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Rule" : "Add New Rule"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <Label>Rule Title *</Label>
                <Input className="mt-1" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. Eligibility" />
              </div>
              <div>
                <Label>Icon</Label>
                <Select value={form.icon} onValueChange={(v) => setForm((f) => ({ ...f, icon: v }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(ICONS).map((k) => (
                      <SelectItem key={k} value={k}>
                        {k}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Short Note</Label>
              <Input
                className="mt-1"
                value={form.short_note}
                onChange={(e) => setForm((f) => ({ ...f, short_note: e.target.value }))}
                placeholder="One-line summary shown in the list"
              />
            </div>
            <div>
              <Label>Full Note (Details)</Label>
              <Textarea
                className="mt-1 h-32"
                value={form.details}
                onChange={(e) => setForm((f) => ({ ...f, details: e.target.value }))}
                placeholder={"One bullet point per line, e.g.\nOnly registered Ganesh Mandals can participate.\nOne entry per mandal is allowed."}
              />
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm">
                <Switch checked={form.is_important} onCheckedChange={(v) => setForm((f) => ({ ...f, is_important: v }))} />
                Important Note
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Switch checked={form.is_active} onCheckedChange={(v) => setForm((f) => ({ ...f, is_active: v }))} />
                Active
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditorOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-rose-600 hover:bg-rose-700"
              disabled={createRule.isPending || updateRule.isPending}
              onClick={save}
            >
              {createRule.isPending || updateRule.isPending ? "Saving…" : editing ? "Save Changes" : "Add Rule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={Boolean(toDelete)} onOpenChange={(open) => !open && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this rule?</AlertDialogTitle>
            <AlertDialogDescription>
              “{toDelete?.title}” will be removed from the competition rules shown in the app.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-rose-600 hover:bg-rose-700"
              onClick={() =>
                toDelete &&
                deleteRule.mutate(toDelete.id, {
                  onSuccess: () => {
                    toast.success("Rule deleted");
                    setToDelete(null);
                  },
                  onError: (err) => toast.error(err instanceof Error ? err.message : "Delete failed"),
                })
              }
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
