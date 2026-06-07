import { createFileRoute } from "@tanstack/react-router";
import { Bell, Download, Eye, FileBarChart, Newspaper, Play, TrendingUp, UserPlus, Users } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageHeader } from "@/components/common/PageHeader";
import { FilterBar } from "@/components/common/FilterBar";
import { StatsGrid } from "@/components/admin/StatsGrid";
import { MetricChartCard } from "@/components/admin/MetricChartCard";
import { SectionCard } from "@/components/admin/SectionCard";
import { DayWiseReportTable } from "@/components/admin/DayWiseReportTable";
import { Button } from "@/components/ui/button";
import { dayWiseReports, languageUsage, stateUsage, topNews, userGrowth, viewsOverview } from "@/mock/reports.mock";
import { channels } from "@/mock/channels.mock";
import { areas, districts, states } from "@/mock/location.mock";
import { ROUTES } from "@/constants/routes.constants";

export const Route = createFileRoute("/_app/reports")({ component: ReportsPage });

function ReportsPage() {
  return (
    <div>
      <PageHeader title="Reports" breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "Reports" }]} actions={<><Button variant="outline"><Download className="mr-2 h-4 w-4" />Export Report</Button><Button><Play className="mr-2 h-4 w-4" />Generate Report</Button></>} />
      <FilterBar searchPlaceholder="Search report..." showDateRange dropdowns={[{ key: "language", placeholder: "Language", options: ["Hindi", "English", "Marathi"].map((s) => ({ label: s, value: s })) }, { key: "channel", placeholder: "Channel", options: channels.map((c) => ({ label: c.name, value: c.name })) }, { key: "state", placeholder: "State", options: states.map((s) => ({ label: s.name, value: s.name })) }, { key: "district", placeholder: "District", options: districts.map((d) => ({ label: d.name, value: d.name })) }, { key: "area", placeholder: "Area", options: areas.map((a) => ({ label: a.name, value: a.name })) }]} />
      <StatsGrid items={[{ title: "Number of News", value: "1,482", icon: Newspaper, variant: "blue" }, { title: "Total Notifications Sent", value: "8,420", icon: Bell, variant: "amber" }, { title: "Total Users", value: "24,892", icon: Users, variant: "green" }, { title: "Total New Users", value: "1,280", icon: UserPlus, variant: "violet" }, { title: "Total Views", value: "318K", icon: Eye, variant: "pink" }, { title: "Reports Generated", value: 124, icon: FileBarChart, variant: "red" }]} />
      <div className="grid gap-6 xl:grid-cols-2">
        <MetricChartCard title="Views Overview"><ResponsiveContainer width="100%" height="100%"><LineChart data={viewsOverview}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Line type="monotone" dataKey="views" stroke="#dc2626" strokeWidth={2} /></LineChart></ResponsiveContainer></MetricChartCard>
        <MetricChartCard title="User Growth"><ResponsiveContainer width="100%" height="100%"><BarChart data={userGrowth}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="users" fill="#2563eb" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></MetricChartCard>
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <ReportList title="Top Performing News" rows={topNews} />
        <ReportList title="Usage by State" rows={stateUsage} />
        <ReportList title="Usage by Language" rows={languageUsage} />
      </div>
      <div className="mt-6">
        <SectionCard title="Day-wise Details" description="Daily news, users, notifications, and views">
          <DayWiseReportTable data={dayWiseReports} />
        </SectionCard>
      </div>
    </div>
  );
}

function ReportList({ title, rows }: { title: string; rows: { id: string; name: string; value: number; change: string }[] }) {
  return <SectionCard title={title}>{rows.map((row) => <div key={row.id} className="flex items-center justify-between border-b py-3 last:border-0"><div><p className="text-sm font-medium">{row.name}</p><p className="text-xs text-muted-foreground">{row.value.toLocaleString()}</p></div><span className="text-sm font-medium text-emerald-600">{row.change}</span></div>)}</SectionCard>;
}
