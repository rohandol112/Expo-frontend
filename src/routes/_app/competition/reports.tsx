import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Calendar, CheckCircle2, Download, FileText, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useCompetitionReports, useDeleteReport, useUpdateReport } from "@/hooks/api/useCompetition";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import type { CompetitionReport } from "@/types/competitionAdmin";
import { ROUTES } from "@/constants/routes.constants";
import { TableFooter, exportRowsToExcel, formatDateTime } from "@/components/competition/bannerReview";

export const Route = createFileRoute("/_app/competition/reports")({ component: ReportsPage });

const STATUS_LABELS: Record<string, string> = { wrong: "Wrong", resolved: "Resolved" };

function ReportsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [toDelete, setToDelete] = useState<CompetitionReport | null>(null);
  const debouncedSearch = useDebouncedValue(search, 300);

  const params = useMemo(
    () => ({
      page,
      per_page: pageSize,
      search: debouncedSearch || undefined,
      status: status !== "all" ? status : undefined,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
    }),
    [page, pageSize, debouncedSearch, status, dateFrom, dateTo],
  );

  const reportsQuery = useCompetitionReports(params);
  const updateReport = useUpdateReport();
  const deleteReport = useDeleteReport();
  const data = reportsQuery.data;
  const items = data?.items ?? [];

  const resolve = (r: CompetitionReport) =>
    updateReport.mutate(
      { id: r.id, status: r.status === "resolved" ? "wrong" : "resolved" },
      {
        onSuccess: () => toast.success(r.status === "resolved" ? "Report re-opened" : "Report marked as resolved"),
        onError: (err) => toast.error(err instanceof Error ? err.message : "Update failed"),
      },
    );

  return (
    <div>
      <PageHeader
        title="Reports"
        breadcrumbs={[
          { label: "Dashboard", to: ROUTES.DASHBOARD },
          { label: "Competition", to: ROUTES.COMPETITION },
          { label: "Reports" },
        ]}
        actions={
          <div className="flex items-center gap-1.5">
            <div className="relative">
              <Calendar className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input type="date" value={dateFrom} max={dateTo || undefined} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }} className="h-9 w-[145px] pl-8 text-xs" aria-label="From date" />
            </div>
            <span className="text-xs text-muted-foreground">–</span>
            <div className="relative">
              <Calendar className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input type="date" value={dateTo} min={dateFrom || undefined} onChange={(e) => { setDateTo(e.target.value); setPage(1); }} className="h-9 w-[145px] pl-8 text-xs" aria-label="To date" />
            </div>
          </div>
        }
      />
      <p className="-mt-4 mb-5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <FileText className="h-3.5 w-3.5" /> Manage all reports submitted in competition.
      </p>

      <div className="rounded-xl border bg-card shadow-sm">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 border-b p-4">
          <div className="relative min-w-[260px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search reports by mandal name, contact number, email or description…"
              className="pl-9"
            />
          </div>
          <Select
            value={status}
            onValueChange={(v) => {
              setStatus(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="wrong">Wrong</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={() =>
              exportRowsToExcel(
                "competition-reports.xlsx",
                items.map((r) => ({
                  "Mandal Name (Title)": r.title,
                  "Contact Number": r.contact_number,
                  "Email ID": r.email,
                  Description: r.description,
                  "Submitted Date": formatDateTime(r.submitted_at),
                  Status: STATUS_LABELS[r.status],
                })),
              )
            }
          >
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 text-[11px] font-semibold uppercase text-muted-foreground">
              <tr>
                <th className="p-3">Mandal Name (Title)</th>
                <th className="p-3">Contact Number</th>
                <th className="p-3">Email ID</th>
                <th className="w-[34%] p-3">Description</th>
                <th className="p-3">Submitted Date</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {reportsQuery.isLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    Loading reports…
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    No reports found.
                  </td>
                </tr>
              ) : (
                items.map((r) => (
                  <tr key={r.id} className="align-top transition-colors hover:bg-muted/30">
                    <td className="p-3">
                      <p className="font-semibold text-foreground">{r.title}</p>
                      {r.pandal_name && <p className="mt-0.5 text-[11px] text-muted-foreground">{r.pandal_name}</p>}
                    </td>
                    <td className="whitespace-nowrap p-3 text-slate-600">{r.contact_number}</td>
                    <td className="p-3 text-slate-600">{r.email}</td>
                    <td className="p-3 leading-relaxed text-slate-600">{r.description}</td>
                    <td className="whitespace-nowrap p-3 text-slate-600">{formatDateTime(r.submitted_at)}</td>
                    <td className="p-3">
                      <StatusBadge status={STATUS_LABELS[r.status] ?? r.status} />
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 border-rose-200 text-rose-600 hover:bg-rose-50"
                          onClick={() => setToDelete(r)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                          disabled={updateReport.isPending}
                          onClick={() => resolve(r)}
                          title={r.status === "resolved" ? "Re-open report" : "Mark as resolved"}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
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
          noun="reports"
        />
      </div>

      <AlertDialog open={Boolean(toDelete)} onOpenChange={(open) => !open && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this report?</AlertDialogTitle>
            <AlertDialogDescription>
              The report “{toDelete?.title}” will be permanently removed. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-rose-600 hover:bg-rose-700"
              onClick={() =>
                toDelete &&
                deleteReport.mutate(toDelete.id, {
                  onSuccess: () => {
                    toast.success("Report deleted");
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
