import { Outlet, createFileRoute, useLocation, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Download, Filter, Info, Plus, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { ActionMenu } from "@/components/common/ActionMenu";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdBanners, useDeleteAdBanner } from "@/hooks/api/useAdvertisement";
import { useRegions } from "@/hooks/api/useRegions";
import { BANNER_TYPE_LABELS, type AdBanner, type BannerType } from "@/types/advertisement";
import { ROUTES } from "@/constants/routes.constants";
import { cn } from "@/lib/utils";
import { TableFooter, exportRowsToExcel, formatDateTime } from "@/components/competition/bannerReview";

export const Route = createFileRoute("/_app/advertisement/banners")({ component: BannersPage });

const STATUS_LABELS: Record<string, string> = { active: "Active", inactive: "Inactive" };

const TYPE_BADGES: Record<BannerType, string> = {
  main_slider: "bg-blue-50 text-blue-700 border-blue-200",
  in_list: "bg-violet-50 text-violet-700 border-violet-200",
  in_detail: "bg-teal-50 text-teal-700 border-teal-200",
};

interface Filters {
  bannerType: string;
  stateId: string;
  districtId: string;
  areaId: string;
  status: string;
}

const EMPTY_FILTERS: Filters = { bannerType: "all", stateId: "all", districtId: "all", areaId: "all", status: "all" };

function LabeledSelect({
  label,
  value,
  placeholder,
  options,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  placeholder: string;
  options: { label: string; value: string }[];
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="min-w-[150px] flex-1">
      <p className="mb-1 text-[11px] font-semibold text-muted-foreground">{label}</p>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className="h-9 text-xs">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{placeholder}</SelectItem>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function BannersPage() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const deleteBanner = useDeleteAdBanner();
  const regionsQuery = useRegions();
  const states = regionsQuery.data ?? [];

  const districts = useMemo(() => {
    const source = filters.stateId !== "all" ? states.filter((s) => String(s.id) === filters.stateId) : states;
    return source.flatMap((s) => s.districts);
  }, [states, filters.stateId]);

  // Areas are selectable only when a single district is chosen (Figma rule).
  const areaOptions = useMemo(() => {
    if (filters.districtId === "all") return [];
    return districts
      .filter((d) => String(d.id) === filters.districtId)
      .flatMap((d) => d.areas.map((a) => ({ label: a.name, value: String(a.id) })));
  }, [districts, filters.districtId]);

  const stateName = useMemo(() => new Map(states.map((s) => [s.id, s.name])), [states]);
  const districtName = useMemo(
    () => new Map(states.flatMap((s) => s.districts).map((d) => [d.id, d.name])),
    [states],
  );
  const areaName = useMemo(
    () => new Map(states.flatMap((s) => s.districts).flatMap((d) => d.areas).map((a) => [a.id, a.name])),
    [states],
  );

  const params = useMemo(
    () => ({
      page,
      per_page: pageSize,
      banner_type: filters.bannerType !== "all" ? filters.bannerType : undefined,
      status: filters.status !== "all" ? filters.status : undefined,
      state_id: filters.stateId !== "all" ? Number(filters.stateId) : undefined,
      district_id: filters.districtId !== "all" ? Number(filters.districtId) : undefined,
      area_id: filters.areaId !== "all" ? Number(filters.areaId) : undefined,
    }),
    [page, pageSize, filters],
  );
  const bannersQuery = useAdBanners(params);
  const data = bannersQuery.data;
  const items = data?.items ?? [];

  if (pathname !== ROUTES.ADS_BANNERS) return <Outlet />;

  const setFilter = (patch: Partial<Filters>) => {
    setFilters((f) => ({ ...f, ...patch }));
    setPage(1);
  };

  const names = (ids: number[], map: Map<number, string>) =>
    ids.map((id) => map.get(id)).filter(Boolean).join(", ");

  const visibilityBadge = (r: AdBanner): string => {
    if (r.district_ids.length > 1) return "Multiple Districts";
    if (r.district_ids.length === 1 && r.area_ids.length > 1) return "Single District (Multiple Areas)";
    if (r.district_ids.length === 1 && r.area_ids.length === 1) return "Single District (Single Area)";
    if (r.district_ids.length === 1) return "Single District";
    return "All Areas";
  };

  const exportList = () =>
    exportRowsToExcel(
      "banner-list.xlsx",
      items.map((r) => ({
        "Banner Name": r.name,
        "Banner Type": BANNER_TYPE_LABELS[r.banner_type],
        "External Link": r.external_link ? "Yes" : "No",
        "Link URL": r.link_url ?? "",
        State: r.state_ids.length ? names(r.state_ids, stateName) : "All States",
        District: r.district_ids.length ? names(r.district_ids, districtName) : "All Districts",
        Area: r.area_ids.length ? names(r.area_ids, areaName) : "",
        Views: r.views,
        Order: r.display_order,
        Status: STATUS_LABELS[r.status] ?? r.status,
        "Created At": formatDateTime(r.created_at),
      })),
    );

  return (
    <div>
      <PageHeader
        title="Banner List"
        breadcrumbs={[
          { label: "Dashboard", to: ROUTES.DASHBOARD },
          { label: "Banners" },
          { label: "Banner List" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" /> Filter
            </Button>
            <Button variant="outline" onClick={exportList}>
              <Download className="mr-2 h-4 w-4" /> Export
            </Button>
            <Button onClick={() => navigate({ to: ROUTES.ADS_BANNERS_ADD })}>
              <Plus className="mr-2 h-4 w-4" /> Add New Banner
            </Button>
          </div>
        }
      />
      <p className="-mt-4 mb-5 text-xs font-medium text-muted-foreground">Manage all banners and their visibility.</p>

      {/* Filters */}
      <div className="mb-4 rounded-xl border bg-card p-4 shadow-sm">
        <div className="flex flex-wrap items-end gap-3">
          <LabeledSelect
            label="Banner Type"
            value={filters.bannerType}
            placeholder="All Types"
            options={Object.entries(BANNER_TYPE_LABELS).map(([value, label]) => ({ label, value }))}
            onChange={(v) => setFilter({ bannerType: v })}
          />
          <LabeledSelect
            label="State"
            value={filters.stateId}
            placeholder="All States"
            options={states.map((s) => ({ label: s.name, value: String(s.id) }))}
            onChange={(v) => setFilter({ stateId: v, districtId: "all", areaId: "all" })}
          />
          <LabeledSelect
            label="District"
            value={filters.districtId}
            placeholder="All Districts"
            options={districts.map((d) => ({ label: d.name, value: String(d.id) }))}
            onChange={(v) => setFilter({ districtId: v, areaId: "all" })}
          />
          <LabeledSelect
            label="Area"
            value={filters.areaId}
            placeholder="All Areas"
            options={areaOptions}
            onChange={(v) => setFilter({ areaId: v })}
            disabled={filters.districtId === "all"}
          />
          <LabeledSelect
            label="Status"
            value={filters.status}
            placeholder="All Status"
            options={[
              { label: "Active", value: "active" },
              { label: "Inactive", value: "inactive" },
            ]}
            onChange={(v) => setFilter({ status: v })}
          />
          <Button variant="outline" className="h-9" onClick={() => setFilters(EMPTY_FILTERS)}>
            <RotateCcw className="mr-2 h-3.5 w-3.5" /> Reset
          </Button>
        </div>
      </div>

      {/* Area rule note */}
      <div className="mb-4 flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50/60 px-4 py-2.5 text-xs text-blue-700">
        <Info className="h-4 w-4 shrink-0" />
        Area will show only when a single district is selected. For multiple districts, area will not be applicable.
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 text-[11px] font-semibold uppercase text-muted-foreground">
              <tr>
                <th className="w-12 p-3">#</th>
                <th className="p-3">Image</th>
                <th className="p-3">Banner Name</th>
                <th className="p-3">Banner Type</th>
                <th className="p-3">External Link</th>
                <th className="w-[24%] p-3">Visibility Area</th>
                <th className="p-3">Views</th>
                <th className="p-3">Order</th>
                <th className="p-3">Status</th>
                <th className="p-3">Created At</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {bannersQuery.isLoading ? (
                <tr>
                  <td colSpan={11} className="p-8 text-center text-muted-foreground">
                    Loading banners…
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={11} className="p-8 text-center text-muted-foreground">
                    No banners found.
                  </td>
                </tr>
              ) : (
                items.map((r, idx) => (
                  <tr key={r.id} className="align-top transition-colors hover:bg-muted/30">
                    <td className="p-3 text-muted-foreground">{(page - 1) * pageSize + idx + 1}</td>
                    <td className="p-3">
                      {r.image_url ? (
                        <img src={r.image_url} alt="" className="h-10 w-16 rounded-md border object-cover" />
                      ) : (
                        <div className="h-10 w-16 rounded-md border bg-muted" />
                      )}
                    </td>
                    <td className="p-3 font-semibold text-foreground">{r.name}</td>
                    <td className="p-3">
                      <span className={cn("inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold", TYPE_BADGES[r.banner_type])}>
                        {BANNER_TYPE_LABELS[r.banner_type]}
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={cn(
                          "inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold",
                          r.external_link
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-slate-200 bg-slate-100 text-slate-600",
                        )}
                      >
                        {r.external_link ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="space-y-0.5 text-[11px] leading-relaxed">
                        <p>
                          <span className="font-semibold text-slate-700">State:</span>{" "}
                          <span className="text-slate-600">{r.state_ids.length ? names(r.state_ids, stateName) : "All States"}</span>
                        </p>
                        <p>
                          <span className="font-semibold text-slate-700">District:</span>{" "}
                          <span className="text-slate-600">
                            {r.district_ids.length ? names(r.district_ids, districtName) : "All Districts"}
                          </span>
                        </p>
                        <p>
                          <span className="font-semibold text-slate-700">Area:</span>{" "}
                          <span className="text-slate-600">{r.area_ids.length ? names(r.area_ids, areaName) : "—"}</span>
                        </p>
                        <span className="inline-flex rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700">
                          {visibilityBadge(r)}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 font-semibold text-slate-700">{r.views.toLocaleString("en-IN")}</td>
                    <td className="p-3 text-slate-600">{r.display_order}</td>
                    <td className="p-3">
                      <StatusBadge status={STATUS_LABELS[r.status] ?? r.status} />
                    </td>
                    <td className="whitespace-nowrap p-3 text-slate-600">{formatDateTime(r.created_at)}</td>
                    <td className="p-3 text-right">
                      <ActionMenu
                        onEdit={() => navigate({ to: "/advertisement/banners/$bannerId/edit", params: { bannerId: String(r.id) } })}
                        onDelete={() =>
                          deleteBanner.mutate(r.id, {
                            onSuccess: () => toast.success("Banner deleted"),
                            onError: (err) => toast.error(err instanceof Error ? err.message : "Delete failed"),
                          })
                        }
                      />
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
          noun="banners"
        />
      </div>
    </div>
  );
}
