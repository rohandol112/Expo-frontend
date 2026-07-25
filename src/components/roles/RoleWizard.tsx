import { useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  Clock,
  Eye,
  Globe,
  Landmark,
  MapPin,
  Pencil,
  Shield,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MultiSelect } from "@/components/common/MultiSelect";
import { RolePermissionMatrix } from "@/components/roles/RolePermissionMatrix";
import { useLanguages } from "@/hooks/api/useLanguages";
import { useRegions } from "@/hooks/api/useRegions";
import type { AdminRole, AdminRoleInput } from "@/types/adminRole";
import { cn } from "@/lib/utils";

const STEPS = [
  { n: 1, title: "Select Scope", sub: "Language & Location" },
  { n: 2, title: "Role Details", sub: "Add role information" },
  { n: 3, title: "Permissions", sub: "Configure role permissions" },
  { n: 4, title: "Review & Create", sub: "Review and create role" },
];

export const ROLE_ICONS: { key: string; icon: LucideIcon }[] = [
  { key: "pencil", icon: Pencil },
  { key: "shield", icon: Shield },
  { key: "users", icon: Users },
  { key: "clipboard", icon: Landmark },
  { key: "person", icon: MapPin },
  { key: "eye", icon: Eye },
];

export const ROLE_COLORS = ["violet", "blue", "teal", "green", "orange", "yellow", "pink", "red", "slate"];

const COLOR_DOTS: Record<string, string> = {
  violet: "bg-violet-600",
  blue: "bg-blue-600",
  teal: "bg-teal-500",
  green: "bg-green-600",
  orange: "bg-orange-500",
  yellow: "bg-yellow-400",
  pink: "bg-pink-500",
  red: "bg-red-600",
  slate: "bg-slate-400",
};

export function RoleWizard({
  initial,
  saving,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial?: AdminRole;
  saving?: boolean;
  submitLabel: string;
  onSubmit: (data: AdminRoleInput) => void;
  onCancel: () => void;
}) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<AdminRoleInput>({
    name: initial?.name ?? "",
    description: initial?.description ?? "",
    icon: initial?.icon ?? "pencil",
    color: initial?.color ?? "violet",
    is_active: initial?.is_active ?? true,
    scope: initial?.scope ?? {},
    permissions: initial?.permissions ?? {},
  });

  const languagesQuery = useLanguages();
  const regionsQuery = useRegions();
  const states = regionsQuery.data ?? [];

  const languageOpts = useMemo(
    () => (languagesQuery.data?.items ?? []).map((l) => ({ label: l.name, value: l.code })),
    [languagesQuery.data],
  );
  const stateOpts = useMemo(() => states.map((s) => ({ label: s.name, value: s.id })), [states]);
  const districtOpts = useMemo(() => {
    const scoped = form.scope?.state_ids?.length
      ? states.filter((s) => form.scope!.state_ids!.includes(s.id))
      : states;
    return scoped.flatMap((s) => s.districts).map((d) => ({ label: d.name, value: d.id }));
  }, [states, form.scope]);
  const areaOpts = useMemo(() => {
    const districts = states.flatMap((s) => s.districts);
    const scoped = form.scope?.district_ids?.length
      ? districts.filter((d) => form.scope!.district_ids!.includes(d.id))
      : districts;
    return scoped.flatMap((d) => d.areas).map((a) => ({ label: a.name, value: a.id }));
  }, [states, form.scope]);

  const scopeSummary = useMemo(() => {
    const langs = (form.scope?.language_codes ?? [])
      .map((c) => languageOpts.find((o) => o.value === c)?.label ?? c)
      .join(", ");
    const stateNames = (form.scope?.state_ids ?? []).map((id) => stateOpts.find((o) => o.value === id)?.label).filter(Boolean).join(", ");
    return {
      language: langs || "All Languages",
      location: stateNames || "All Locations",
    };
  }, [form.scope, languageOpts, stateOpts]);

  const totalPermissions = useMemo(() => {
    let n = 0;
    for (const perms of Object.values(form.permissions ?? {})) {
      for (const [k, v] of Object.entries(perms)) {
        if (k !== "content_types" && v === true) n += 1;
      }
    }
    return n;
  }, [form.permissions]);

  const next = () => {
    if (step === 2 && !form.name.trim()) return toast.info("Enter a role name");
    setStep((s) => Math.min(4, s + 1));
  };

  return (
    <div className="space-y-5">
      {/* Stepper */}
      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {STEPS.map((s) => {
            const done = step > s.n;
            const active = step === s.n;
            return (
              <button key={s.n} onClick={() => s.n < step && setStep(s.n)} className="flex items-center gap-3 text-left">
                <span
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                    done
                      ? "bg-emerald-500 text-white"
                      : active
                        ? "bg-blue-600 text-white"
                        : "bg-muted text-muted-foreground",
                  )}
                >
                  {done ? <Check className="h-4 w-4" /> : s.n}
                </span>
                <span>
                  <p className={cn("text-xs font-bold", active ? "text-foreground" : "text-muted-foreground")}>{s.title}</p>
                  <p className="text-[11px] text-muted-foreground">{s.n === 1 && step > 1 ? `${scopeSummary.language}, ${scopeSummary.location}` : s.sub}</p>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 1 — Scope */}
      {step === 1 && (
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <h3 className="text-sm font-bold text-foreground">Step 1: Select Scope</h3>
          <p className="mb-4 text-xs text-muted-foreground">Choose the languages and locations this role can work in. Leave empty for full access.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Language(s)</Label>
              <MultiSelect<string>
                className="mt-1"
                options={languageOpts}
                value={form.scope?.language_codes ?? []}
                onChange={(v) => setForm((f) => ({ ...f, scope: { ...f.scope, language_codes: v } }))}
                placeholder="All Languages"
              />
            </div>
            <div>
              <Label>State(s)</Label>
              <MultiSelect
                className="mt-1"
                options={stateOpts}
                value={form.scope?.state_ids ?? []}
                onChange={(v) => setForm((f) => ({ ...f, scope: { ...f.scope, state_ids: v, district_ids: [], area_ids: [] } }))}
                placeholder="All States"
              />
            </div>
            <div>
              <Label>District(s)</Label>
              <MultiSelect
                className="mt-1"
                options={districtOpts}
                value={form.scope?.district_ids ?? []}
                onChange={(v) => setForm((f) => ({ ...f, scope: { ...f.scope, district_ids: v, area_ids: [] } }))}
                placeholder="All Districts"
              />
            </div>
            <div>
              <Label>Area(s)</Label>
              <MultiSelect
                className="mt-1"
                options={areaOpts}
                value={form.scope?.area_ids ?? []}
                onChange={(v) => setForm((f) => ({ ...f, scope: { ...f.scope, area_ids: v } }))}
                placeholder="All Areas"
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 2 — Details */}
      {step === 2 && (
        <div className="grid items-start gap-4 lg:grid-cols-[1fr_320px]">
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <h3 className="mb-4 text-sm font-bold text-foreground">Step 2: Role Details</h3>
            <div className="space-y-4">
              <div>
                <Label>Role Name *</Label>
                <Input className="mt-1" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Editor" />
              </div>
              <div>
                <Label>Description *</Label>
                <Textarea
                  className="mt-1 h-20"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value.slice(0, 300) }))}
                  placeholder="Can create, edit and manage news content."
                />
                <p className="mt-1 text-[11px] text-muted-foreground">Characters: {form.description?.length ?? 0}/300</p>
              </div>
              
              {!initial && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Email Address</Label>
                    <Input 
                      type="email" 
                      className="mt-1" 
                      value={form.email ?? ""} 
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} 
                      placeholder="editor@newsplatform.com" 
                    />
                  </div>
                  <div>
                    <Label>Password</Label>
                    <Input 
                      type="password" 
                      className="mt-1" 
                      value={form.password ?? ""} 
                      onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} 
                      placeholder="Minimum 8 characters" 
                    />
                  </div>
                </div>
              )}

              <div>
                <Label>Role Icon</Label>
                <div className="mt-1.5 flex gap-2">
                  {ROLE_ICONS.map(({ key, icon: Icon }) => (
                    <button
                      key={key}
                      onClick={() => setForm((f) => ({ ...f, icon: key }))}
                      className={cn(
                        "flex h-9 w-11 items-center justify-center rounded-lg border transition-colors",
                        form.icon === key ? "border-blue-500 bg-blue-50 text-blue-600" : "text-muted-foreground hover:bg-muted",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label>Role Color</Label>
                <div className="mt-1.5 flex gap-2.5">
                  {ROLE_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setForm((f) => ({ ...f, color }))}
                      className={cn(
                        "flex h-7 w-7 items-center justify-center rounded-full",
                        COLOR_DOTS[color],
                        form.color === color && "ring-2 ring-offset-2 ring-blue-500",
                      )}
                      aria-label={color}
                    >
                      {form.color === color && <Check className="h-3.5 w-3.5 text-white" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <RoleSummaryCard form={form} scopeSummary={scopeSummary} totalPermissions={totalPermissions} initial={initial} />
        </div>
      )}

      {/* Step 3 — Permissions */}
      {step === 3 && (
        <RolePermissionMatrix
          value={form.permissions ?? {}}
          onChange={(permissions) => setForm((f) => ({ ...f, permissions }))}
        />
      )}

      {/* Step 4 — Review */}
      {step === 4 && (
        <div className="grid items-start gap-4 lg:grid-cols-[1fr_320px]">
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <h3 className="mb-1 text-sm font-bold text-foreground">Step 4: Review &amp; {initial ? "Save" : "Create"}</h3>
            <p className="mb-4 text-xs text-muted-foreground">Confirm the role configuration before saving.</p>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between border-b pb-2">
                <dt className="text-muted-foreground">Role Name</dt>
                <dd className="font-semibold">{form.name || "—"}</dd>
              </div>
              <div className="flex justify-between border-b pb-2">
                <dt className="text-muted-foreground">Language Scope</dt>
                <dd className="font-semibold">{scopeSummary.language}</dd>
              </div>
              <div className="flex justify-between border-b pb-2">
                <dt className="text-muted-foreground">Location Scope</dt>
                <dd className="font-semibold">{scopeSummary.location}</dd>
              </div>
              <div className="flex justify-between border-b pb-2">
                <dt className="text-muted-foreground">Modules configured</dt>
                <dd className="font-semibold">{Object.keys(form.permissions ?? {}).length}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Total permissions granted</dt>
                <dd className="font-semibold">{totalPermissions}</dd>
              </div>
            </dl>
          </div>
          <RoleSummaryCard form={form} scopeSummary={scopeSummary} totalPermissions={totalPermissions} initial={initial} />
        </div>
      )}

      {/* Footer nav */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <div className="flex items-center gap-2">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep((s) => Math.max(1, s - 1))}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Previous
            </Button>
          )}
          {step < 4 ? (
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={next}>
              Next Step <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              disabled={saving}
              onClick={() => {
                if (!form.name.trim()) return toast.info("Enter a role name");
                onSubmit(form);
              }}
            >
              {saving ? "Saving…" : submitLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function RoleSummaryCard({
  form,
  scopeSummary,
  totalPermissions,
  initial,
}: {
  form: AdminRoleInput;
  scopeSummary: { language: string; location: string };
  totalPermissions: number;
  initial?: AdminRole;
}) {
  const rows = [
    { icon: Globe, label: "Scope", value: "Language & Location" },
    { icon: Landmark, label: "Language", value: scopeSummary.language },
    { icon: MapPin, label: "Location", value: scopeSummary.location },
    { icon: Users, label: "Users with this role", value: `${initial?.users_count ?? 0} Users` },
    { icon: Calendar, label: "Created on", value: initial ? new Date(initial.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—" },
    { icon: Clock, label: "Permissions granted", value: String(totalPermissions) },
  ];
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <h3 className="mb-3 text-sm font-bold text-foreground">Role Summary</h3>
      <dl className="space-y-3">
        {rows.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center justify-between gap-3 border-b pb-2.5 text-xs last:border-b-0 last:pb-0">
            <dt className="flex items-center gap-2 text-muted-foreground">
              <Icon className="h-3.5 w-3.5" /> {label}
            </dt>
            <dd className="text-right font-semibold text-foreground">{value}</dd>
          </div>
        ))}
      </dl>
      {form.name && (
        <p className="mt-3 rounded-lg bg-muted/50 px-3 py-2 text-xs">
          <span className="font-semibold">{form.name}</span>
          {form.description ? ` — ${form.description}` : ""}
        </p>
      )}
    </div>
  );
}
