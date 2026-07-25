import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ROLE_ACTIONS,
  ROLE_CONTENT_TYPES,
  ROLE_MODULES,
  type AdminRoleInput,
  type RoleActionKey,
  type RoleContentType,
  type RoleModulePermissions,
} from "@/types/adminRole";

type Permissions = NonNullable<AdminRoleInput["permissions"]>;

/** Modules where publishing-style actions do not apply (rendered as "—"). */
const CONTENT_MODULES = new Set(["dashboard", "news", "user_news", "reports", "notifications"]);
const NO_PUBLISH_MODULES = new Set(["users", "language", "location", "roles", "settings", "referrals", "complaints"]);

export function emptyModulePermissions(): RoleModulePermissions {
  return {
    view: false,
    add: false,
    edit: false,
    status_change: false,
    delete: false,
    draft: false,
    publish: false,
    notification: false,
    translation: false,
    content_types: [],
  };
}

export function RolePermissionMatrix({
  value,
  onChange,
  disabled,
}: {
  value: Permissions;
  onChange: (next: Permissions) => void;
  disabled?: boolean;
}) {
  const [moduleSearch, setModuleSearch] = useState("");

  const modules = useMemo(
    () => ROLE_MODULES.filter((m) => m.label.toLowerCase().includes(moduleSearch.trim().toLowerCase())),
    [moduleSearch],
  );

  const actionApplies = (moduleKey: string, action: RoleActionKey): boolean => {
    if (action === "publish" || action === "draft") return !NO_PUBLISH_MODULES.has(moduleKey);
    if (action === "translation") return ["news", "categories", "language", "notifications"].includes(moduleKey);
    if (action === "notification") return ["news", "user_news", "reports", "notifications", "monetization", "offers", "listings", "channels", "dashboard", "competition"].includes(moduleKey);
    return true;
  };

  const get = (moduleKey: string): Partial<RoleModulePermissions> => value[moduleKey] ?? {};

  const setAction = (moduleKey: string, action: RoleActionKey, checked: boolean) => {
    const current = { ...emptyModulePermissions(), ...get(moduleKey) };
    onChange({ ...value, [moduleKey]: { ...current, [action]: checked } });
  };

  const setContentType = (moduleKey: string, type: RoleContentType, checked: boolean) => {
    const current = { ...emptyModulePermissions(), ...get(moduleKey) };
    const set = new Set(current.content_types);
    if (checked) set.add(type);
    else set.delete(type);
    onChange({ ...value, [moduleKey]: { ...current, content_types: [...set] } });
  };

  const setAll = (checked: boolean) => {
    if (!checked) {
      onChange({});
      return;
    }
    const next: Permissions = {};
    for (const m of ROLE_MODULES) {
      const perms = emptyModulePermissions();
      for (const a of ROLE_ACTIONS) {
        if (actionApplies(m.key, a.key)) perms[a.key] = true;
      }
      if (CONTENT_MODULES.has(m.key)) perms.content_types = ROLE_CONTENT_TYPES.map((t) => t.key);
      next[m.key] = perms;
    }
    onChange(next);
  };

  return (
    <div className="rounded-xl border bg-card shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
        <div>
          <h3 className="text-sm font-bold text-foreground">Configure Permissions</h3>
          <p className="text-xs text-muted-foreground">Configure access for all modules and features in the system.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="text-xs text-blue-700" onClick={() => setAll(true)} disabled={disabled}>
            Select All
          </Button>
          <Button variant="outline" size="sm" className="text-xs text-rose-600" onClick={() => setAll(false)} disabled={disabled}>
            Deselect All
          </Button>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={moduleSearch}
              onChange={(e) => setModuleSearch(e.target.value)}
              placeholder="Search module…"
              className="h-8 w-[180px] pl-8 text-xs"
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-muted/40 text-[10px] font-semibold uppercase text-muted-foreground">
            <tr>
              <th className="w-10 p-2.5">#</th>
              <th className="min-w-[170px] p-2.5">Module / Feature</th>
              {ROLE_ACTIONS.map((a) => (
                <th key={a.key} className="p-2.5 text-center">
                  {a.label}
                </th>
              ))}
              {ROLE_CONTENT_TYPES.map((t) => (
                <th key={t.key} className="p-2.5 text-center">
                  {t.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {modules.map((m, idx) => {
              const perms = get(m.key);
              return (
                <tr key={m.key} className="hover:bg-muted/20">
                  <td className="p-2.5 text-muted-foreground">{idx + 1}</td>
                  <td className="p-2.5 font-semibold text-foreground">{m.label}</td>
                  {ROLE_ACTIONS.map((a) => (
                    <td key={a.key} className="p-2.5 text-center">
                      {actionApplies(m.key, a.key) ? (
                        <Checkbox
                          checked={Boolean(perms[a.key])}
                          onCheckedChange={(v) => setAction(m.key, a.key, v === true)}
                          disabled={disabled}
                          aria-label={`${m.label} — ${a.label}`}
                        />
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                  ))}
                  {ROLE_CONTENT_TYPES.map((t) => (
                    <td key={t.key} className="p-2.5 text-center">
                      {CONTENT_MODULES.has(m.key) ? (
                        <Checkbox
                          checked={Boolean(perms.content_types?.includes(t.key))}
                          onCheckedChange={(v) => setContentType(m.key, t.key, v === true)}
                          disabled={disabled}
                          aria-label={`${m.label} — ${t.label}`}
                        />
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="border-t bg-blue-50/50 px-4 py-2.5 text-xs text-blue-700">
        Note: Changes made here will apply to all users assigned with this role.
      </div>
    </div>
  );
}
