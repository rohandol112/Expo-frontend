import { Outlet, createFileRoute, useLocation, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  CalendarClock,
  CheckCircle2,
  LayoutTemplate,
  MonitorPlay,
  PauseCircle,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AdForm } from "@/components/monetization/AdForm";
import { TableFooter } from "@/components/competition/bannerReview";
import { QueueStatCard } from "@/components/competition/bannerReview";
import {
  useDeleteManualAd,
  useManualAds,
  useMonetizationSettings,
  useReorderManualAds,
  useUpdateManualAd,
  useUpdateMonetizationSettings,
} from "@/hooks/api/useMonetization";
import { useLanguages } from "@/hooks/api/useLanguages";
import { useRegions } from "@/hooks/api/useRegions";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { PLACEMENT_LABELS, type ManualAd } from "@/types/monetization";
import { ROUTES } from "@/constants/routes.constants";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/monetization")({ component: MonetizationPage });

const STATUS_LABELS: Record<string, string> = { active: "Active", paused: "Paused", scheduled: "Scheduled" };

function MonetizationPage() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [tab, setTab] = useState<"management" | "placement">("management");
  const [search, setSearch] = useState("");
  const [language, setLanguage] = useState("all");
  const [stateId, setStateId] = useState("all");
  const [districtId, setDistrictId] = useState("all");
  const [areaId, setAreaId] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [editing, setEditing] = useState<ManualAd | null>(null);
  const [toDelete, setToDelete] = useState<ManualAd | null>(null);
  const debouncedSearch = useDebouncedValue(search, 300);

  const settingsQuery = useMonetizationSettings();
  const updateSettings = useUpdateMonetizationSettings();
  const updateAd = useUpdateManualAd();
  const deleteAd = useDeleteManualAd();
  const reorderAds = useReorderManualAds();
  const languagesQuery = useLanguages();
  const regionsQuery = useRegions();
  const states = regionsQuery.data ?? [];

  const params = useMemo(
    () => ({
      page,
      per_page: pageSize,
      search: debouncedSearch || undefined,
      language_code: language !== "all" ? language : undefined,
      state_id: stateId !== "all" ? Number(stateId) : undefined,
      district_id: districtId !== "all" ? Number(districtId) : undefined,
      area_id: areaId !== "all" ? Number(areaId) : undefined,
    }),
    [page, pageSize, debouncedSearch, language, stateId, districtId, areaId],
  );
  const adsQuery = useManualAds(params);
  const data = adsQuery.data;
  const items = data?.items ?? [];
  const counts = data?.counts;
  const settings = settingsQuery.data;

  const langName = useMemo(
    () => new Map((languagesQuery.data?.items ?? []).map((l) => [l.code, l.name])),
    [languagesQuery.data],
  );
  const stateName = useMemo(() => new Map(states.map((s) => [s.id, s.name])), [states]);
  const districtName = useMemo(() => new Map(states.flatMap((s) => s.districts).map((d) => [d.id, d.name])), [states]);
  const areaName = useMemo(
    () => new Map(states.flatMap((s) => s.districts).flatMap((d) => d.areas).map((a) => [a.id, a.name])),
    [states],
  );
  const districts = useMemo(() => {
    const source = stateId !== "all" ? states.filter((s) => String(s.id) === stateId) : states;
    return source.flatMap((s) => s.districts);
  }, [states, stateId]);
  const areas = useMemo(() => {
    const source = districtId !== "all" ? districts.filter((d) => String(d.id) === districtId) : districts;
    return source.flatMap((d) => d.areas);
  }, [districts, districtId]);

  if (pathname !== ROUTES.MONETIZATION) return <Outlet />;

  const names = (ids: number[], map: Map<number, string>, fallback: string) =>
    ids.length ? ids.map((id) => map.get(id)).filter(Boolean).join(", ") : fallback;

  const move = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= items.length) return;
    const ids = items.map((i) => i.id);
    [ids[index], ids[target]] = [ids[target], ids[index]];
    reorderAds.mutate(ids, {
      onError: (err) => toast.error(err instanceof Error ? err.message : "Reorder failed"),
    });
  };

  const toggleSetting = (key: "admob_enabled" | "manual_ads_enabled", value: boolean) =>
    updateSettings.mutate(
      { [key]: value },
      {
        onSuccess: () => toast.success("Settings updated"),
        onError: (err) => toast.error(err instanceof Error ? err.message : "Update failed"),
      },
    );

  const placementCounts = (key: string) => items.filter((a) => a.placements.includes(key as ManualAd["placements"][number])).length;

  return (
    <div>
      <PageHeader
        title="Monetization Management"
        description="Manage advertisements shown to users based on language and area."
        breadcrumbs={[
          { label: "Dashboard", to: ROUTES.DASHBOARD },
          { label: "Monetization Management" },
        ]}
        actions={
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => navigate({ to: ROUTES.MONETIZATION_ADD })}>
            <Plus className="mr-2 h-4 w-4" /> Add New Ad
          </Button>
        }
      />

      {/* Tabs */}
      <div className="mb-5 flex items-center border-b">
        {(
          [
            { key: "management", label: "Ad Management" },
            { key: "placement", label: "Ad Placement" },
          ] as const
        ).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "-mb-px border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors",
              tab === t.key ? "border-blue-600 text-blue-600" : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "management" && (
        <div className="space-y-4">
          {/* AdMob toggle row */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-slate-900 px-5 py-3.5 text-white">
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold">Google AdMob</span>
              <StatusBadge status={settings?.admob_enabled ? "Active" : "Inactive"} />
              <span className="text-xs text-slate-300">
                {settings?.admob_enabled ? "Ads are being served via Google AdMob" : "Google AdMob is turned off"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="border-slate-600 bg-transparent text-xs text-white hover:bg-slate-800 hover:text-white"
                onClick={() => navigate({ to: ROUTES.COMPETITION_SETTINGS })}
              >
                <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit AdMob Settings
              </Button>
              <Switch
                checked={settings?.admob_enabled ?? false}
                onCheckedChange={(v) => toggleSetting("admob_enabled", v)}
                disabled={updateSettings.isPending}
              />
            </div>
          </div>

          {/* Manual ads toggle row */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50/70 px-5 py-3.5">
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-foreground">Manual Ads</span>
              <StatusBadge status={settings?.manual_ads_enabled ? "Active" : "Inactive"} />
              <span className="text-xs text-muted-foreground">
                {settings?.manual_ads_enabled
                  ? "Manual ads are enabled and may be used as fallback or alternative."
                  : "Manual ads are turned off."}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                disabled={updateSettings.isPending}
                onClick={() => toggleSetting("manual_ads_enabled", !(settings?.manual_ads_enabled ?? true))}
              >
                {settings?.manual_ads_enabled ? "Turn Off Manual Ads" : "Turn On Manual Ads"}
              </Button>
              <Switch
                checked={settings?.manual_ads_enabled ?? false}
                onCheckedChange={(v) => toggleSetting("manual_ads_enabled", v)}
                disabled={updateSettings.isPending}
              />
            </div>
          </div>

          {/* Filters */}
          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <div className="flex flex-wrap items-end gap-3">
              <div className="min-w-[200px] flex-1">
                <p className="mb-1 text-[11px] font-semibold text-muted-foreground">Search</p>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Search by ad name…"
                    className="h-9 pl-9 text-xs"
                  />
                </div>
              </div>
              <FilterCol label="Language">
                <Select value={language} onValueChange={(v) => { setLanguage(v); setPage(1); }}>
                  <SelectTrigger className="h-9 w-[140px] text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Languages</SelectItem>
                    {(languagesQuery.data?.items ?? []).map((l) => (
                      <SelectItem key={l.code} value={l.code}>{l.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FilterCol>
              <FilterCol label="Location (State, District, Area)">
                <div className="flex items-center gap-2">
                  <Select value={stateId} onValueChange={(v) => { setStateId(v); setDistrictId("all"); setAreaId("all"); setPage(1); }}>
                    <SelectTrigger className="h-9 w-[130px] text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All States</SelectItem>
                      {states.map((s) => (
                        <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={districtId} onValueChange={(v) => { setDistrictId(v); setAreaId("all"); setPage(1); }}>
                    <SelectTrigger className="h-9 w-[130px] text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Districts</SelectItem>
                      {districts.map((d) => (
                        <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={areaId} onValueChange={(v) => { setAreaId(v); setPage(1); }}>
                    <SelectTrigger className="h-9 w-[130px] text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Areas</SelectItem>
                      {areas.map((a) => (
                        <SelectItem key={a.id} value={String(a.id)}>{a.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </FilterCol>
              <Button
                variant="outline"
                className="h-9"
                onClick={() => {
                  setSearch("");
                  setLanguage("all");
                  setStateId("all");
                  setDistrictId("all");
                  setAreaId("all");
                  setPage(1);
                }}
              >
                <RotateCcw className="mr-2 h-3.5 w-3.5" /> Reset
              </Button>
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <QueueStatCard title="Total Ads" value={counts?.total ?? 0} subtitle="Across all languages & areas" icon={LayoutTemplate} tone="blue" />
            <QueueStatCard
              title="Active Ads"
              value={counts?.active ?? 0}
              subtitle={counts?.total ? `${((100 * (counts?.active ?? 0)) / counts.total).toFixed(2)}% of total ads` : "—"}
              icon={CheckCircle2}
              tone="emerald"
              valueTone="text-emerald-600"
            />
            <QueueStatCard
              title="Paused Ads"
              value={counts?.paused ?? 0}
              subtitle={counts?.total ? `${((100 * (counts?.paused ?? 0)) / counts.total).toFixed(2)}% of total ads` : "—"}
              icon={PauseCircle}
              tone="amber"
              valueTone="text-amber-600"
            />
            <QueueStatCard
              title="Scheduled Ads"
              value={counts?.scheduled ?? 0}
              subtitle={counts?.total ? `${((100 * (counts?.scheduled ?? 0)) / counts.total).toFixed(2)}% of total ads` : "—"}
              icon={CalendarClock}
              tone="purple"
              valueTone="text-purple-600"
            />
          </div>

          {/* Ad List */}
          <div className="rounded-xl border bg-card shadow-sm">
            <div className="border-b p-4">
              <h3 className="text-sm font-bold text-foreground">Ad List</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/40 text-[11px] font-semibold uppercase text-muted-foreground">
                  <tr>
                    <th className="w-16 p-3">Order</th>
                    <th className="p-3">Ad Name</th>
                    <th className="p-3">Ad Preview</th>
                    <th className="p-3">Language</th>
                    <th className="w-[18%] p-3">Location (State, District, Area)</th>
                    <th className="p-3">Placement Area</th>
                    <th className="p-3">Frequency</th>
                    <th className="p-3">Link Clicks</th>
                    <th className="p-3">Impressions</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {adsQuery.isLoading ? (
                    <tr>
                      <td colSpan={11} className="p-8 text-center text-muted-foreground">Loading ads…</td>
                    </tr>
                  ) : items.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="p-8 text-center text-muted-foreground">
                        No ads yet. Click “Add New Ad” to create the first one.
                      </td>
                    </tr>
                  ) : (
                    items.map((r, idx) => (
                      <tr key={r.id} className="align-middle transition-colors hover:bg-muted/30">
                        <td className="p-3">
                          <div className="flex items-center gap-1">
                            <span className="flex h-7 w-7 items-center justify-center rounded-md border font-bold text-slate-700">
                              {(page - 1) * pageSize + idx + 1}
                            </span>
                            <span className="flex flex-col">
                              <button className="text-slate-400 hover:text-slate-700 disabled:opacity-30" disabled={idx === 0 || reorderAds.isPending} onClick={() => move(idx, -1)}>
                                <ArrowUp className="h-3.5 w-3.5" />
                              </button>
                              <button
                                className="text-slate-400 hover:text-slate-700 disabled:opacity-30"
                                disabled={idx === items.length - 1 || reorderAds.isPending}
                                onClick={() => move(idx, 1)}
                              >
                                <ArrowDown className="h-3.5 w-3.5" />
                              </button>
                            </span>
                          </div>
                        </td>
                        <td className="p-3">
                          <p className="font-bold text-foreground">{r.name}</p>
                          {r.description && <p className="text-[11px] text-muted-foreground">{r.description}</p>}
                        </td>
                        <td className="p-3">
                          {r.image_url ? (
                            <img src={r.image_url} alt="" className="h-10 w-20 rounded-md border object-cover" />
                          ) : (
                            <div className="flex h-10 w-20 items-center justify-center rounded-md border bg-muted text-muted-foreground">
                              <MonitorPlay className="h-4 w-4" />
                            </div>
                          )}
                        </td>
                        <td className="p-3 text-slate-600">{r.language_code ? langName.get(r.language_code) ?? r.language_code : "All"}</td>
                        <td className="p-3 text-[11px] leading-relaxed text-slate-600">
                          {names(r.state_ids, stateName, "All States")},{" "}
                          {names(r.district_ids, districtName, "All Districts")},{" "}
                          {names(r.area_ids, areaName, "All Areas")}
                        </td>
                        <td className="p-3 text-slate-600">{r.placements.map((p) => PLACEMENT_LABELS[p]).join(", ")}</td>
                        <td className="p-3 text-slate-600">
                          After every
                          <br />
                          {r.frequency} posts
                        </td>
                        <td className="p-3 font-semibold text-slate-700">{r.clicks.toLocaleString("en-IN")}</td>
                        <td className="p-3 font-semibold text-slate-700">{r.impressions.toLocaleString("en-IN")}</td>
                        <td className="p-3">
                          <StatusBadge status={STATUS_LABELS[r.status] ?? r.status} />
                        </td>
                        <td className="p-3">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 border-blue-200 px-3 text-[11px] font-semibold text-blue-700 hover:bg-blue-50"
                              onClick={() => setEditing(r)}
                            >
                              <Pencil className="mr-1 h-3 w-3" /> Edit
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-600">
                                  <span className="text-base leading-none">⋮</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="text-xs">
                                <DropdownMenuItem
                                  onClick={() =>
                                    updateAd.mutate(
                                      { id: r.id, patch: { status: r.status === "paused" ? "active" : "paused" } },
                                      {
                                        onSuccess: () => toast.success(r.status === "paused" ? "Ad activated" : "Ad paused"),
                                        onError: (err) => toast.error(err instanceof Error ? err.message : "Update failed"),
                                      },
                                    )
                                  }
                                >
                                  {r.status === "paused" ? "Activate" : "Pause"}
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-rose-600" onClick={() => setToDelete(r)}>
                                  <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <TableFooter
              page={page}
              pageSize={pageSize}
              total={data?.total ?? 0}
              onPageChange={setPage}
              onPageSizeChange={(n) => {
                setPageSize(n);
                setPage(1);
              }}
              pageSizeOptions={[5, 10, 25, 50]}
              noun="ads"
            />
          </div>
        </div>
      )}

      {tab === "placement" && (
        <div className="grid gap-4 sm:grid-cols-3">
          {Object.entries(PLACEMENT_LABELS).map(([key, label]) => (
            <div key={key} className="rounded-xl border bg-card p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground">{label}</h3>
                <MonitorPlay className="h-5 w-5 text-blue-600" />
              </div>
              <p className="mt-2 text-2xl font-extrabold">{placementCounts(key)}</p>
              <p className="text-xs text-muted-foreground">ad(s) on this page targeting {label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Edit dialog */}
      <Dialog open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Ad — {editing?.name}</DialogTitle>
          </DialogHeader>
          {editing && (
            <AdForm
              initial={editing}
              submitLabel="Save Changes"
              saving={updateAd.isPending}
              onCancel={() => setEditing(null)}
              onSubmit={(patch) =>
                updateAd.mutate(
                  { id: editing.id, patch },
                  {
                    onSuccess: () => {
                      toast.success("Ad updated");
                      setEditing(null);
                    },
                    onError: (err) => toast.error(err instanceof Error ? err.message : "Update failed"),
                  },
                )
              }
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={Boolean(toDelete)} onOpenChange={(open) => !open && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete ad “{toDelete?.name}”?</AlertDialogTitle>
            <AlertDialogDescription>The ad will stop showing in the app immediately. This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-rose-600 hover:bg-rose-700"
              onClick={() =>
                toDelete &&
                deleteAd.mutate(toDelete.id, {
                  onSuccess: () => {
                    toast.success("Ad deleted");
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

function FilterCol({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1 text-[11px] font-semibold text-muted-foreground">{label}</p>
      {children}
    </div>
  );
}
