import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Bot, CheckCircle2, HelpCircle, Image, UserCheck, XCircle } from "lucide-react";
import { toast } from "sonner";
import { AdminListPage, type AdminListQuery } from "@/components/admin/AdminListPage";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  useAiReviewBanner,
  useAiReviewPending,
  useCompetitionBanners,
  useReviewBanner,
} from "@/hooks/api/useCompetition";
import type { AdminBannerListItem } from "@/types/competitionAdmin";
import type { Column } from "@/components/tables/DataTable";
import { ROUTES } from "@/constants/routes.constants";

export const Route = createFileRoute("/_app/competition/banner-review")({ component: BannerReviewPage });

const PAGE_SIZE = 10;

const AI_LABELS: Record<string, string> = {
  pending: "Pending",
  approved: "AI Approved",
  rejected: "AI Rejected",
  uncertain: "AI Uncertain",
  failed: "Failed",
};

const STATUS_LABELS: Record<string, string> = {
  in_review: "In Review",
  approved: "Published",
  rejected: "Rejected",
};

function BannerReviewPage() {
  const [query, setQuery] = useState<AdminListQuery>({ search: "", page: 1, dropdownValues: {} });
  const params = useMemo(
    () => ({
      page: query.page,
      per_page: PAGE_SIZE,
      search: query.search || undefined,
      status: query.dropdownValues.status || undefined,
      ai_status: query.dropdownValues.ai_status || undefined,
    }),
    [query],
  );
  const bannersQuery = useCompetitionBanners(params);
  const reviewBanner = useReviewBanner();
  const aiReview = useAiReviewBanner();
  const aiReviewAll = useAiReviewPending();
  const data = bannersQuery.data;
  const counts = data?.counts;

  const columns: Column<AdminBannerListItem>[] = [
    {
      key: "banner",
      header: "Banner",
      cell: (r) => (
        <div className="flex items-center gap-3">
          {r.image_url ? (
            <a href={r.image_url} target="_blank" rel="noreferrer">
              <img src={r.image_url} alt="" className="h-12 w-20 rounded object-cover" />
            </a>
          ) : (
            <div className="h-12 w-20 rounded bg-muted" />
          )}
          <div>
            <p className="text-sm font-medium">Banner {r.slot}</p>
            <p className="max-w-[140px] truncate text-xs text-muted-foreground">{r.file_name ?? "—"}</p>
          </div>
        </div>
      ),
    },
    {
      key: "pandal",
      header: "Mandal / Participant",
      cell: (r) => (
        <div>
          <p className="font-medium">{r.pandal_name}</p>
          <p className="text-xs text-muted-foreground">{[r.area_name, r.district_name].filter(Boolean).join(", ")}</p>
        </div>
      ),
    },
    {
      key: "ai",
      header: "AI Result",
      cell: (r) => (
        <div>
          <StatusBadge
            status={AI_LABELS[r.ai_status] ?? r.ai_status}
          />
          {r.ai_confidence != null && (
            <p className="mt-1 text-xs text-muted-foreground">Confidence: {r.ai_confidence}%</p>
          )}
          {r.ai_reasons.length > 0 && (
            <ul className="mt-1 max-w-[220px] list-disc pl-4 text-xs text-muted-foreground">
              {r.ai_reasons.slice(0, 3).map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          )}
        </div>
      ),
    },
    { key: "status", header: "Status", cell: (r) => <StatusBadge status={STATUS_LABELS[r.status] ?? r.status} /> },
    {
      key: "uploaded",
      header: "Uploaded On",
      cell: (r) => new Date(r.uploaded_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }),
    },
    {
      key: "actions",
      header: "Action",
      cell: (r) => (
        <div className="flex flex-wrap gap-1.5">
          {r.status === "in_review" && (
            <>
              <Button
                size="sm"
                variant="outline"
                disabled={reviewBanner.isPending}
                onClick={() =>
                  reviewBanner.mutate(
                    { id: r.id, status: "approved" },
                    {
                      onSuccess: () => toast.success("Banner approved (+points credited)"),
                      onError: (err) => toast.error(err instanceof Error ? err.message : "Failed"),
                    },
                  )
                }
              >
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-destructive"
                disabled={reviewBanner.isPending}
                onClick={() =>
                  reviewBanner.mutate(
                    { id: r.id, status: "rejected", reason: "Rejected in manual review" },
                    {
                      onSuccess: () => toast.success("Banner rejected"),
                      onError: (err) => toast.error(err instanceof Error ? err.message : "Failed"),
                    },
                  )
                }
              >
                Reject
              </Button>
            </>
          )}
          <Button
            size="sm"
            variant="ghost"
            disabled={aiReview.isPending}
            onClick={() =>
              aiReview.mutate(r.id, {
                onSuccess: (res) => toast.success(`AI verdict: ${res.ai_status} (${res.ai_confidence ?? "?"}%)`),
                onError: (err) => toast.error(err instanceof Error ? err.message : "AI review failed"),
              })
            }
          >
            <Bot className="mr-1 h-3.5 w-3.5" />
            Run AI
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AdminListPage
      title="Banner Review Dashboard"
      breadcrumbs={[
        { label: "Dashboard", to: ROUTES.DASHBOARD },
        { label: "Competition", to: ROUTES.COMPETITION },
        { label: "Banner Review" },
      ]}
      actions={
        <Button
          disabled={aiReviewAll.isPending}
          onClick={() =>
            aiReviewAll.mutate(undefined, {
              onSuccess: (res) => toast.success(`AI reviewed ${res.reviewed} pending banner(s)`),
              onError: (err) => toast.error(err instanceof Error ? err.message : "AI review failed"),
            })
          }
        >
          <Bot className="mr-2 h-4 w-4" />
          {aiReviewAll.isPending ? "Reviewing…" : "Run AI on Pending"}
        </Button>
      }
      loading={bannersQuery.isLoading}
      error={bannersQuery.error ? "Unable to load banners from backend." : undefined}
      stats={[
        { title: "Total Uploads", value: counts?.total ?? 0, icon: Image, variant: "blue" },
        { title: "AI Approved", value: counts?.ai_approved ?? 0, icon: CheckCircle2, variant: "green" },
        { title: "AI Uncertain", value: counts?.ai_uncertain ?? 0, subtitle: "Needs manual review", icon: HelpCircle, variant: "amber" },
        { title: "AI Rejected", value: counts?.ai_rejected ?? 0, icon: XCircle, variant: "rose" },
        { title: "Manually Reviewed", value: counts?.manually_reviewed ?? 0, icon: UserCheck, variant: "violet" },
      ]}
      data={data?.items ?? []}
      columns={columns}
      rowKey={(r) => String(r.id)}
      searchPlaceholder="Search by mandal name or phone..."
      dropdowns={[
        {
          key: "status",
          placeholder: "Status",
          options: [
            { label: "In Review", value: "in_review" },
            { label: "Approved", value: "approved" },
            { label: "Rejected", value: "rejected" },
          ],
        },
        {
          key: "ai_status",
          placeholder: "AI Result",
          options: [
            { label: "Pending", value: "pending" },
            { label: "AI Approved", value: "approved" },
            { label: "AI Uncertain", value: "uncertain" },
            { label: "AI Rejected", value: "rejected" },
            { label: "Failed", value: "failed" },
          ],
        },
      ]}
      serverSide
      total={data?.total ?? 0}
      pageSize={PAGE_SIZE}
      page={query.page}
      onPageChange={(page) => setQuery((q) => ({ ...q, page }))}
      onQueryChange={setQuery}
    />
  );
}
