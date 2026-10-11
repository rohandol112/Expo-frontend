import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { BarChart3, Camera, Check, Download, FileText, X } from "lucide-react";
import { AdminListPage } from "@/components/admin/AdminListPage";
import { ActionMenu } from "@/components/common/ActionMenu";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ImageUploadGrid } from "@/components/forms/ImageUploadGrid";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useWinners, useSubmitWinnerPhoto } from "@/hooks/api/useWinners";
import { useGiftRequests } from "@/hooks/api/useGiftRequests";
import type { Winner } from "@/types/referrals";
import type { Column } from "@/components/tables/DataTable";
import { ROUTES } from "@/constants/routes.constants";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/referrals/winners/")({ component: WinnersPage });

type Tab = "monthly" | "quiz";

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

function WinnersPage() {
  const navigate = useNavigate();
  const winnersQuery = useWinners();
  const submitPhoto = useSubmitWinnerPhoto();
  const giftRequestsQuery = useGiftRequests();
  const giftRequests = giftRequestsQuery.data?.items ?? [];
  const [tab, setTab] = useState<Tab>("monthly");
  const [photoTarget, setPhotoTarget] = useState<Winner | null>(null);
  const [photo, setPhoto] = useState<File[]>([]);

  const items = winnersQuery.data?.items ?? [];

  const locationCell = (r: Winner) => <span className="whitespace-nowrap text-sm">{`${r.area}, ${r.district}, ${r.state}`}</span>;
  const userCell = (r: Winner) => (
    <div>
      <p className="text-sm font-medium">{r.name}</p>
      <p className="text-xs text-muted-foreground">{r.phone}</p>
    </div>
  );

  const actionsCell = (r: Winner) => (
    <ActionMenu
      extraItems={[
        { label: "Photo Submit", icon: Camera, onClick: () => { setPhotoTarget(r); setPhoto([]); } },
        {
          label: "Request Details",
          icon: FileText,
          onClick: () => {
            const request = giftRequests.find((g) => g.userId === r.userId);
            if (!request) return toast.info("No gift request found for this winner");
            navigate({ to: "/referrals/gift-requests/$id", params: { id: request.id } });
          },
        },
        { label: "Analytics", icon: BarChart3, onClick: () => navigate({ to: "/referrals/winners/$userId/analytics", params: { userId: r.userId } }) },
      ]}
    />
  );

  const monthlyColumns: Column<Winner>[] = [
    { key: "user", header: "User Name & Phone", cell: userCell },
    { key: "location", header: "Location (Area, District, State)", cell: locationCell },
    { key: "language", header: "Language", cell: (r) => r.language },
    { key: "total", header: "Total Points", cell: (r) => <span className="font-semibold">{r.totalPoints.toLocaleString()}</span> },
    { key: "reading", header: "Reading Points", cell: (r) => <PointsCell value={r.readingPoints} /> },
    { key: "quiz", header: "Quiz Points", cell: (r) => <PointsCell value={r.quizPoints} /> },
    { key: "bonus", header: "Bonus Points", cell: (r) => <PointsCell value={r.bonusPoints} /> },
    { key: "referral", header: "Referral Points", cell: (r) => <PointsCell value={r.referralPoints} /> },
    { key: "streak", header: "Streak", cell: (r) => <span className="rounded-full bg-orange-50 px-2 py-0.5 text-xs font-medium text-orange-700">{r.streakDays} Days</span> },
    { key: "gift", header: "Gift Request", cell: (r) => <GiftRequestPill status={r.giftRequestStatus} at={r.giftRequestedAt} /> },
    { key: "rewards", header: "Rewards", cell: (r) => <RewardsPill status={r.rewardsStatus} /> },
    { key: "actions", header: "Actions", cell: actionsCell },
  ];

  const quizColumns: Column<Winner>[] = [
    { key: "user", header: "User Name & Phone", cell: userCell },
    { key: "location", header: "Location (Area, District, State)", cell: locationCell },
    { key: "language", header: "Language", cell: (r) => r.language },
    { key: "q1", header: "Quiz 1 Answers (5 Rounds)", cell: (r) => <AnswerStrip results={r.quiz1Results} /> },
    { key: "q1time", header: "Quiz 1 Attempt Time", cell: (r) => <span className="whitespace-nowrap text-sm text-muted-foreground">{r.quiz1AttemptTime ?? "—"}</span> },
    { key: "q2", header: "Quiz 2 Answers (5 Rounds)", cell: (r) => <AnswerStrip results={r.quiz2Results} /> },
    { key: "q2time", header: "Quiz 2 Attempt Time", cell: (r) => <span className="whitespace-nowrap text-sm text-muted-foreground">{r.quiz2AttemptTime ?? "—"}</span> },
    { key: "quizPoints", header: "Quiz Points", cell: (r) => <PointsCell value={r.quizPoints} /> },
    { key: "gift", header: "Gift Request", cell: (r) => <GiftRequestPill status={r.giftRequestStatus} at={r.giftRequestedAt} /> },
    { key: "rewards", header: "Rewards", cell: (r) => <RewardsPill status={r.rewardsStatus} /> },
    { key: "actions", header: "Actions", cell: actionsCell },
  ];

  return (
    <div>
      <AdminListPage
        title="Winners"
        breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "Referrals & Points", to: ROUTES.REFERRALS }, { label: "Winners" }]}
        actions={
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-md border p-0.5">
              {(["monthly", "quiz"] as Tab[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={cn(
                    "rounded px-3 py-1.5 text-sm font-medium transition-colors",
                    tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t === "monthly" ? "Monthly Winners" : "Quiz Winners"}
                </button>
              ))}
            </div>
            <Button variant="outline" onClick={() => toast.info("Export coming soon")}><Download className="mr-2 h-4 w-4" />Export CSV</Button>
          </div>
        }
        key={tab}
        data={items}
        columns={tab === "monthly" ? monthlyColumns : quizColumns}
        loading={winnersQuery.isLoading}
        rowKey={(r) => r.id}
        searchPlaceholder="Search by name, phone number..."
        showDateRange={false}
        dropdowns={[
          { key: "language", placeholder: "Languages", options: [...new Set(items.map((w) => w.language))].map((l) => ({ label: l, value: l })) },
        ]}
        filter={(row, search, dropdowns) =>
          (!dropdowns.language || row.language === dropdowns.language) &&
          (!search || [row.name, row.phone].some((v) => v.toLowerCase().includes(search.toLowerCase())))
        }
      />

      <Dialog open={Boolean(photoTarget)} onOpenChange={(open) => !open && setPhotoTarget(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Submit Photo</DialogTitle>
            <DialogDescription>Upload Photo for Gift Request{photoTarget ? ` — ${photoTarget.name}` : ""}</DialogDescription>
          </DialogHeader>
          <div className="rounded-md border border-sky-200 bg-sky-50 px-3 py-2 text-xs text-sky-800">
            Please upload a clear photo of the gift item you received. Accepted formats: JPG, PNG | Maximum size: 5 MB
          </div>
          <ImageUploadGrid label="Photo" hint="JPG, PNG (Max 5MB)" value={photo} onChange={setPhoto} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setPhotoTarget(null)}>Cancel</Button>
            <Button
              disabled={photo.length === 0 || submitPhoto.isPending}
              onClick={async () => {
                if (!photoTarget) return;
                await submitPhoto.mutateAsync(photoTarget.id);
                toast.success("Photo submitted");
                setPhotoTarget(null);
              }}
            >
              Submit Photo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
