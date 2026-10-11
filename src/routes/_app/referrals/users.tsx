import { createFileRoute } from "@tanstack/react-router";
import { Download, Medal, UserPlus, Users, UserCheck, UserX, Coins } from "lucide-react";
import { AdminListPage } from "@/components/admin/AdminListPage";
import { Button } from "@/components/ui/button";
import { useReferralUsers } from "@/hooks/api/useReferralUsers";
import type { ReferralUser } from "@/types/referrals";
import type { Column } from "@/components/tables/DataTable";
import { ROUTES } from "@/constants/routes.constants";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/referrals/users")({ component: ReferralUsersPage });

const MEDAL_COLORS = ["text-amber-500", "text-slate-400", "text-amber-700"];

function RankCell({ rank }: { rank: number }) {
  if (rank <= 3) {
    return (
      <span className="flex items-center gap-1 font-semibold">
        <Medal className={`h-4 w-4 ${MEDAL_COLORS[rank - 1]}`} /> {rank}
      </span>
    );
  }
  return <span>{rank}</span>;
}

function LanguagePill({ language }: { language: string }) {
  const styles: Record<string, string> = {
    Hindi: "bg-amber-50 text-amber-700 border-amber-200",
    English: "bg-blue-50 text-blue-700 border-blue-200",
    Marathi: "bg-violet-50 text-violet-700 border-violet-200",
    Gujarati: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Tamil: "bg-rose-50 text-rose-700 border-rose-200",
  };
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles[language] ?? ""}`}>{language}</span>;
}

function columns(): Column<ReferralUser>[] {
  return [
    {
      key: "user",
      header: "User Name & Phone Number",
      cell: (r) => (
        <div>
          <p className="text-sm font-medium">{r.name}</p>
          <p className="text-xs text-muted-foreground">{r.phone}</p>
        </div>
      ),
    },
    { key: "rank", header: "Rank", cell: (r) => <RankCell rank={r.rank} /> },
    { key: "state", header: "State", cell: (r) => r.state },
    { key: "district", header: "District", cell: (r) => r.district },
    { key: "area", header: "Area", cell: (r) => r.area },
    { key: "language", header: "Language", cell: (r) => <LanguagePill language={r.language} /> },
    { key: "code", header: "Referral Code", cell: (r) => <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/5 px-2.5 py-0.5 text-xs font-medium text-primary">{r.referralCode}</span> },
    { key: "total", header: "Total Referred Users", cell: (r) => r.totalReferredUsers },
    { key: "successful", header: "Successful Referrals", cell: (r) => r.successfulReferrals },
    { key: "active", header: "Active Users", cell: (r) => r.activeUsers },
    { key: "uninstalled", header: "Uninstalled Users", cell: (r) => r.uninstalledUsers },
    { key: "points", header: "Total Referred Points", cell: (r) => <span className="font-medium">{r.totalReferredPoints.toLocaleString()}</span> },
  ];
}

function ReferralUsersPage() {
  const usersQuery = useReferralUsers();
  const users = usersQuery.data?.items ?? [];

  return (
    <AdminListPage
      title="Referral Users"
      breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "Referrals & Points", to: ROUTES.REFERRALS }, { label: "Referral Users" }]}
      actions={<Button variant="outline" onClick={() => toast.info("Export coming soon")}><Download className="mr-2 h-4 w-4" />Export CSV</Button>}
      stats={[
        { title: "Total Referrer Users", value: "4,860", subtitle: "↑20% · Users who referred at least 1 user", icon: UserPlus, variant: "blue" },
        { title: "Total Referred Users", value: "12,450", subtitle: "↑18% · Referred by all referrers", icon: Users, variant: "green" },
        { title: "Successful Referrals", value: "8,720", subtitle: "↑22% · Completed & verified users", icon: UserCheck, variant: "violet" },
        { title: "Active Referred Users", value: "6,240", subtitle: "↑16% · Currently active users", icon: UserCheck, variant: "amber" },
        { title: "Uninstalled Users", value: "3,730", subtitle: "↑8% · Referred users uninstalled", icon: UserX, variant: "rose" },
        { title: "Total Referred Points", value: "2,45,800", subtitle: "↑25% · Points earned from referrals", icon: Coins, variant: "pink" },
      ]}
      data={users}
      columns={columns()}
      loading={usersQuery.isLoading}
      rowKey={(r) => r.id}
      searchPlaceholder="Search by name, phone number, referral code..."
      showDateRange
      dropdowns={[
        { key: "state", placeholder: "State", options: [...new Set(users.map((u) => u.state))].map((s) => ({ label: s, value: s })) },
        { key: "district", placeholder: "District", options: [...new Set(users.map((u) => u.district))].map((d) => ({ label: d, value: d })) },
        { key: "language", placeholder: "Language", options: [...new Set(users.map((u) => u.language))].map((l) => ({ label: l, value: l })) },
      ]}
      filter={(row, search, dropdowns) =>
        (!dropdowns.state || row.state === dropdowns.state) &&
        (!dropdowns.district || row.district === dropdowns.district) &&
        (!dropdowns.language || row.language === dropdowns.language) &&
        (!search || [row.name, row.phone, row.referralCode].some((v) => v.toLowerCase().includes(search.toLowerCase())))
      }
    />
  );
}
