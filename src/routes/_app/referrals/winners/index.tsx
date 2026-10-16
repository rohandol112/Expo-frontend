import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { BarChart3, Camera, Check, Download, FileText, Gift, X } from "lucide-react";
import { AdminListPage } from "@/components/admin/AdminListPage";
import { ActionMenu } from "@/components/common/ActionMenu";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ImageUploadGrid } from "@/components/forms/ImageUploadGrid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useMonthlyWinners, useQuizWinners, useSubmitDeliveryPhoto } from "@/hooks/api/useWinners";
import { useCompetitionLocations } from "@/hooks/api/useRewardsSettings";
import { useLanguages } from "@/hooks/api/useLanguages";
import { useReportListState } from "@/hooks/useReportListState";
import { winnerService } from "@/services/winner.service";
import { placeLabel } from "@/services/adapters/rewards.adapter";
import { downloadCsv, EXPORT_LIMIT, type CsvColumn } from "@/lib/csv";
import { handleError } from "@/lib/errorHandler";
import { istMonth, istToday } from "@/lib/format";
import { isStoredImage, type ImageValue } from "@/lib/mediaUpload";
import type { Winner } from "@/types/referrals";
import type { Column } from "@/components/tables/DataTable";
import { ROUTES } from "@/constants/routes.constants";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/referrals/winners/")({ component: WinnersPage });

type Tab = "monthly" | "quiz";

const PAGE_SIZE = 20;

function PointsCell({ value }: { value: number }) {
  return <span className="text-sm">{value.toLocaleString()}</span>;
}

function AnswerStrip({ results }: { results?: boolean[] }) {
  if (!results) return <span className="text-muted-foreground">—</span>;
  return (
    <div className="flex gap-1">
      {results.map((ok, i) => (
        <span
          key={i}
          className={cn(
            "flex h-5 w-5 items-center justify-center rounded-full text-white",
            ok ? "bg-emerald-500" : "bg-rose-500",
          )}
        >
          {ok ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
        </span>
      ))}
    </div>
  );
}

function GiftRequestPill({ status, at }: { status: Winner["giftRequestStatus"]; at?: string }) {
  if (status === "Not Requested") return <StatusBadge status="Not Requested" variant="red" />;
  return (
    <div>
      <StatusBadge status="Requested" variant="green" />
      {at && <p className="mt-0.5 text-[11px] text-muted-foreground">{at}</p>}
    </div>
  );
}

function RewardsPill({ status }: { status: Winner["rewardsStatus"] }) {
  if (status === "-") return <span className="text-muted-foreground">-</span>;
  return <StatusBadge status={status === "Submitted" ? "Submitted" : "Pending"} variant={status === "Submitted" ? "emerald" : "amber"} />;
}

const BASE_CSV: CsvColumn<Winner>[] = [
  { header: "Rank", value: (r) => r.rank },
  { header: "Location Rank", value: (r) => r.locationRank },
  { header: "Rewards Location", value: (r) => r.locationTitle },
  { header: "Name", value: (r) => r.name },
  { header: "Phone", value: (r) => r.phone },
  { header: "Area, District, State", value: (r) => placeLabel(r) },
  { header: "Language", value: (r) => r.language },
];

const MONTHLY_CSV: CsvColumn<Winner>[] = [
  ...BASE_CSV,
  { header: "Total Points", value: (r) => r.totalPoints },
  { header: "Reading", value: (r) => r.readingPoints },
  { header: "Quiz", value: (r) => r.quizPoints },
  { header: "Bonus", value: (r) => r.bonusPoints },
  { header: "Referral", value: (r) => r.referralPoints },
  { header: "Streak Days", value: (r) => r.streakDays },
  { header: "Gift Won", value: (r) => r.wonGift },
  { header: "Gift Request", value: (r) => r.giftRequestStatus },
  { header: "Rewards", value: (r) => r.rewardsStatus },
];

const QUIZ_CSV: CsvColumn<Winner>[] = [
  ...BASE_CSV,
  { header: "Quiz 1 Correct", value: (r) => r.quiz1Results?.filter(Boolean).length },
  { header: "Quiz 1 Submitted", value: (r) => r.quiz1AttemptTime },
  { header: "Quiz 2 Correct", value: (r) => r.quiz2Results?.filter(Boolean).length },
  { header: "Quiz 2 Submitted", value: (r) => r.quiz2AttemptTime },
  { header: "Quiz Points", value: (r) => r.quizPoints },
  { header: "Gift Position", value: (r) => r.giftPosition },
  { header: "Winner", value: (r) => (r.isWinner ? "Yes" : "No") },
  { header: "Gift Request", value: (r) => r.giftRequestStatus },
];

function WinnersPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("monthly");
  const [month, setMonth] = useState(istMonth());
  const [date, setDate] = useState(istToday());
  const list = useReportListState();
  const locationsQuery = useCompetitionLocations();
  const languagesQuery = useLanguages();
  const submitPhoto = useSubmitDeliveryPhoto();
  const [photoTarget, setPhotoTarget] = useState<Winner | null>(null);
  const [photo, setPhoto] = useState<ImageValue[]>([]);
  const [exporting, setExporting] = useState(false);

  const filters = {
    page: list.page,
    per_page: PAGE_SIZE,
    search: list.search || undefined,
    language: list.dropdownValues.language || undefined,
    location_id: list.dropdownValues.location ? Number(list.dropdownValues.location) : undefined,
  };
  const monthlyQuery = useMonthlyWinners({ ...filters, month }, tab === "monthly");
  const quizQuery = useQuizWinners({ ...filters, date }, tab === "quiz");
  const activeQuery = tab === "monthly" ? monthlyQuery : quizQuery;
  const items = activeQuery.data?.items ?? [];

  const locationCell = (r: Winner) => (
    <div>
      <span className="whitespace-nowrap text-sm">{placeLabel(r)}</span>
      {r.locationTitle && <p className="text-[11px] text-muted-foreground">{r.locationTitle}{r.locationRank ? ` · #${r.locationRank}` : ""}</p>}
    </div>
  );
  const userCell = (r: Winner) => (
    <div>
      <p className="text-sm font-medium">{r.name}</p>
      <p className="text-xs text-muted-foreground">{r.phone}</p>
    </div>
  );
  const actionsCell = (r: Winner) => (
    <ActionMenu
      extraItems={[
        {
          label: "Photo Submit",
          icon: Camera,
          onClick: () => {
            if (!r.giftRequestId) return toast.info("This winner hasn't requested the gift yet");
            setPhotoTarget(r);
            setPhoto([]);
          },
        },
        {
          label: "Request Details",
          icon: FileText,
          onClick: () => {
            if (!r.giftRequestId) return toast.info("No gift request found for this winner");
            navigate({ to: "/referrals/gift-requests/$id", params: { id: r.giftRequestId } });
          },
        },
        { label: "Analytics", icon: BarChart3, onClick: () => navigate({ to: "/referrals/winners/$userId/analytics", params: { userId: r.userId } }) },
      ]}
    />
  );

  const rankCell = (r: Winner) => <span className="font-semibold">{r.rank}</span>;

  const monthlyColumns: Column<Winner>[] = [
    { key: "rank", header: "Rank", cell: rankCell },
    { key: "user", header: "User Name & Phone", cell: userCell },
    { key: "location", header: "Location (Area, District, State)", cell: locationCell },
    { key: "language", header: "Language", cell: (r) => r.language || "—" },
    { key: "total", header: "Total Points", cell: (r) => <span className="font-semibold">{r.totalPoints.toLocaleString()}</span> },
    { key: "reading", header: "Reading Points", cell: (r) => <PointsCell value={r.readingPoints} /> },
    { key: "quiz", header: "Quiz Points", cell: (r) => <PointsCell value={r.quizPoints} /> },
    { key: "bonus", header: "Bonus Points", cell: (r) => <PointsCell value={r.bonusPoints} /> },
    { key: "referral", header: "Referral Points", cell: (r) => <PointsCell value={r.referralPoints} /> },
    { key: "streak", header: "Streak", cell: (r) => <span className="rounded-full bg-orange-50 px-2 py-0.5 text-xs font-medium text-orange-700">{r.streakDays} Days</span> },
    { key: "won", header: "Gift Won", cell: (r) => (r.wonGift ? <span className="flex items-center gap-1 text-sm"><Gift className="h-3.5 w-3.5 text-amber-600" />{r.wonGift}</span> : <span className="text-muted-foreground">—</span>) },
    { key: "gift", header: "Gift Request", cell: (r) => <GiftRequestPill status={r.giftRequestStatus} at={r.giftRequestedAt} /> },
    { key: "rewards", header: "Rewards", cell: (r) => <RewardsPill status={r.rewardsStatus} /> },
    { key: "actions", header: "Actions", cell: actionsCell },
  ];

  const quizColumns: Column<Winner>[] = [
    { key: "rank", header: "Rank", cell: rankCell },
    { key: "user", header: "User Name & Phone", cell: userCell },
    { key: "location", header: "Location (Area, District, State)", cell: locationCell },
    { key: "language", header: "Language", cell: (r) => r.language || "—" },
    { key: "q1", header: "Quiz 1 Answers", cell: (r) => <AnswerStrip results={r.quiz1Results} /> },
    { key: "q1time", header: "Quiz 1 Attempt Time", cell: (r) => <span className="whitespace-nowrap text-sm text-muted-foreground">{r.quiz1AttemptTime ?? "—"}</span> },
    { key: "q2", header: "Quiz 2 Answers", cell: (r) => <AnswerStrip results={r.quiz2Results} /> },
    { key: "q2time", header: "Quiz 2 Attempt Time", cell: (r) => <span className="whitespace-nowrap text-sm text-muted-foreground">{r.quiz2AttemptTime ?? "—"}</span> },
    { key: "quizPoints", header: "Quiz Points", cell: (r) => <PointsCell value={r.quizPoints} /> },
    {
      key: "winner",
      header: "Quiz Gift",
      cell: (r) =>
        r.isWinner ? (
          <StatusBadge status={`Winner #${r.giftPosition}`} variant="emerald" />
        ) : r.giftPosition ? (
          <span className="text-xs text-muted-foreground">All correct · #{r.giftPosition}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    { key: "gift", header: "Gift Request", cell: (r) => <GiftRequestPill status={r.giftRequestStatus} at={r.giftRequestedAt} /> },
    { key: "rewards", header: "Rewards", cell: (r) => <RewardsPill status={r.rewardsStatus} /> },
    { key: "actions", header: "Actions", cell: actionsCell },
  ];

  const exportCsv = async () => {
    setExporting(true);
    try {
      const all =
        tab === "monthly"
          ? await winnerService.monthly({ ...filters, month, page: 1, per_page: EXPORT_LIMIT })
          : await winnerService.quiz({ ...filters, date, page: 1, per_page: EXPORT_LIMIT });
      downloadCsv(tab === "monthly" ? `monthly-winners-${month}` : `quiz-winners-${date}`, all.items, tab === "monthly" ? MONTHLY_CSV : QUIZ_CSV);
    } catch (error) {
      handleError(error, "Export failed");
    } finally {
      setExporting(false);
    }
  };

  const monthClosed = monthlyQuery.data?.monthClosed;
  const winnersPerLocation = quizQuery.data?.winnersPerLocation;

  return (
    <div>
      <AdminListPage
        title="Winners"
        breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "Referrals & Points", to: ROUTES.REFERRALS }, { label: "Winners" }]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-md border p-0.5">
              {(["monthly", "quiz"] as Tab[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setTab(t);
                    list.setPage(1);
                  }}
                  className={cn(
                    "rounded px-3 py-1.5 text-sm font-medium transition-colors",
                    tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t === "monthly" ? "Monthly Winners" : "Quiz Winners"}
                </button>
              ))}
            </div>
            {tab === "monthly" ? (
              <Input type="month" value={month} max={istMonth()} onChange={(e) => { setMonth(e.target.value || istMonth()); list.setPage(1); }} className="w-[160px]" aria-label="Month" />
            ) : (
              <Input type="date" value={date} max={istToday()} onChange={(e) => { setDate(e.target.value || istToday()); list.setPage(1); }} className="w-[160px]" aria-label="Quiz date" />
            )}
            <Button variant="outline" onClick={exportCsv} disabled={exporting}><Download className="mr-2 h-4 w-4" />{exporting ? "Exporting..." : "Export CSV"}</Button>
          </div>
        }
        data={items}
        columns={tab === "monthly" ? monthlyColumns : quizColumns}
        loading={activeQuery.isLoading}
        error={
          activeQuery.error
            ? "Unable to load winners."
            : tab === "monthly" && monthClosed === false
              ? "This month is still running: ranks can change until it ends, and claims open after that."
              : tab === "quiz" && winnersPerLocation
                ? `The first ${winnersPerLocation} players in each rewards location to get every quiz right win the day's gift.`
                : undefined
        }
        rowKey={(r) => r.id}
        searchPlaceholder="Search by name, phone number..."
        showDateRange={false}
        serverSide
        total={activeQuery.data?.total ?? 0}
        pageSize={PAGE_SIZE}
        page={list.page}
        onPageChange={list.setPage}
        onQueryChange={list.onQueryChange}
        initialDropdownValues={list.dropdownValues}
        dropdowns={[
          { key: "location", placeholder: "Rewards Locations", options: (locationsQuery.data?.items ?? []).map((l) => ({ label: l.title, value: l.id })) },
          { key: "language", placeholder: "Languages", options: (languagesQuery.data?.items ?? []).map((l) => ({ label: l.name, value: l.code })) },
        ]}
      />
      <Dialog open={Boolean(photoTarget)} onOpenChange={(open) => !open && setPhotoTarget(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Submit Photo</DialogTitle>
            <DialogDescription>Upload Photo for Gift Request{photoTarget ? ` — ${photoTarget.name}` : ""}</DialogDescription>
          </DialogHeader>
          <div className="rounded-md border border-sky-200 bg-sky-50 px-3 py-2 text-xs text-sky-800">
            Upload a clear photo of the winner with the gift. It is shown to users in Previous Winners. The gift request must be approved first. Accepted formats: JPG, PNG | Maximum size: 5 MB
          </div>
          <ImageUploadGrid label="Photo" hint="JPG, PNG (Max 5MB)" value={photo} onChange={setPhoto} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setPhotoTarget(null)}>Cancel</Button>
            <Button
              disabled={photo.length === 0 || submitPhoto.isPending}
              onClick={async () => {
                const file = photo[0];
                if (!photoTarget?.giftRequestId || !file || isStoredImage(file)) return;
                try {
                  await submitPhoto.mutateAsync({ giftRequestId: photoTarget.giftRequestId, file });
                } catch {
                  return;
                }
                toast.success("Photo submitted");
                setPhotoTarget(null);
              }}
            >
              {submitPhoto.isPending ? "Uploading..." : "Submit Photo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
