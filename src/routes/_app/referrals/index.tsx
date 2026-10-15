import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Area, AreaChart, Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Users, Coins, Gift, UserCheck } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { FilterBar } from "@/components/common/FilterBar";
import { StatsGrid } from "@/components/admin/StatsGrid";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ROUTES } from "@/constants/routes.constants";

export const Route = createFileRoute("/_app/referrals/")({ component: ReferralsOverviewPage });

function quizParticipantsData() {
  return Array.from({ length: 30 }, (_, i) => ({
    date: `${String(i + 1).padStart(2, "0")} May`,
    participants: Math.round(280 + Math.sin(i / 2.3) * 180 + (i % 5 === 0 ? 60 : 0)),
  }));
}

function referralUsersData() {
  return Array.from({ length: 30 }, (_, i) => ({
    date: `${String(i + 1).padStart(2, "0")} May`,
    referrals: Math.round(140 + Math.cos(i / 2.1) * 90 + (i % 7 === 0 ? 50 : 0)),
  }));
}

function streakByDayData() {
  return Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    users: Math.round(8200 * Math.pow(0.88, i)),
  }));
}

function totalPointsData() {
  return Array.from({ length: 30 }, (_, i) => ({
    date: `${String(i + 1).padStart(2, "0")} May`,
    points: Math.round(1200000 + i * 60000 + Math.sin(i / 3) * 200000),
  }));
}

function ChartCard({
  title,
  description,
  children,
  periodOptions = ["Last 30 Days", "Last 7 Days", "Last 90 Days"],
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  periodOptions?: string[];
}) {
  const [period, setPeriod] = useState(periodOptions[0]);
  return (
    <Card className="p-5">
      <div className="mb-4 flex items-start justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[150px] shrink-0"><SelectValue /></SelectTrigger>
          <SelectContent>
            {periodOptions.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="h-64">{children}</div>
    </Card>
  );
}

function ReferralsOverviewPage() {
  const [search, setSearch] = useState("");
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [area, setArea] = useState("");
  const [language, setLanguage] = useState("");

  return (
    <div>
      <PageHeader
        title="Referrals & Points Overview"
        description="Get an overview of user points, quiz participation, referral growth and user streaks."
        breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "Referrals & Points", to: ROUTES.REFERRALS }, { label: "Overview" }]}
      />
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search..."
        showDateRange
        dropdowns={[
          { key: "state", placeholder: "State", value: state || undefined, options: [{ label: "Maharashtra", value: "Maharashtra" }, { label: "Gujarat", value: "Gujarat" }, { label: "Delhi", value: "Delhi" }], onChange: setState },
          { key: "district", placeholder: "District", value: district || undefined, options: [{ label: "Mumbai", value: "Mumbai" }, { label: "Thane", value: "Thane" }, { label: "Pune", value: "Pune" }], onChange: setDistrict },
          { key: "area", placeholder: "Area", value: area || undefined, options: [{ label: "Andheri West", value: "Andheri West" }, { label: "Ghodbunder", value: "Ghodbunder" }], onChange: setArea },
          { key: "language", placeholder: "Language", value: language || undefined, options: [{ label: "Hindi", value: "Hindi" }, { label: "English", value: "English" }, { label: "Marathi", value: "Marathi" }], onChange: setLanguage },
        ]}
      />
      <StatsGrid
        items={[
          { title: "Total Users Earning Points", value: "24,580", subtitle: "↑12% · Users who earned points", icon: UserCheck, variant: "rose" },
          { title: "Total Points Earned", value: "12,54,80,000", subtitle: "↑8% · Total points earned by users", icon: Coins, variant: "blue" },
          { title: "Total Points Redeemed", value: "3,28,40,000", subtitle: "↑14% · Points converted to rewards", icon: Gift, variant: "green" },
          { title: "Total Registered Users", value: "1,45,200", subtitle: "↑10% · All app users", icon: Users, variant: "amber" },
        ]}
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Quiz Participants" description="Number of users who participated in daily quiz">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={quizParticipantsData()}>
              <defs>
                <linearGradient id="quizGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#dc2626" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tickLine={false} axisLine={false} interval={4} />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip />
              <Area type="monotone" dataKey="participants" stroke="#dc2626" fill="url(#quizGradient)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Referral Users" description="New users joined through referrals">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={referralUsersData()}>
              <XAxis dataKey="date" tickLine={false} axisLine={false} interval={4} />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip />
              <Bar dataKey="referrals" fill="#f97316" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Streak Users (Day Wise)" description="Number of users with consecutive day streak">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={streakByDayData()}>
              <XAxis dataKey="day" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip />
              <Bar dataKey="users" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Total User Points" description="Total points balance of all users (day wise)" periodOptions={["All Point Sources", "Last 30 Days"]}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={totalPointsData()}>
              <defs>
                <linearGradient id="pointsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tickLine={false} axisLine={false} interval={4} />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip />
              <Area type="monotone" dataKey="points" stroke="#7c3aed" fill="url(#pointsGradient)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
