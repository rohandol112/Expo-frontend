import { createFileRoute } from "@tanstack/react-router";
import { Bell, Download, Eye, FileText, Smartphone, UserPlus, Users } from "lucide-react";
import { Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageHeader } from "@/components/common/PageHeader";
import { StatsCard } from "@/components/common/StatsCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable, type Column } from "@/components/tables/DataTable";
import { CategoryBadge, StatusBadge } from "@/components/common/StatusBadge";
import { mockNews } from "@/mock/news.mock";

export const Route = createFileRoute("/_app/dashboard")({
  component: Dashboard,
});

const newUserTrend = [
  { date: "24 May", users: 180 },
  { date: "25 May", users: 240 },
  { date: "26 May", users: 215 },
  { date: "27 May", users: 310 },
  { date: "28 May", users: 365 },
  { date: "29 May", users: 330 },
  { date: "30 May", users: 410 },
];

const platformUsers = [
  { name: "Android", value: 18420, color: "#16a34a" },
  { name: "iOS", value: 6472, color: "#2563eb" },
];

function Dashboard() {
  const columns: Column<(typeof mockNews)[number]>[] = [
    {
      key: "title",
      header: "News",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <img src={row.thumbnail} alt="" className="h-11 w-16 rounded object-cover" />
          <div className="min-w-0">
            <p className="max-w-[360px] truncate text-sm font-medium">{row.title}</p>
            <p className="text-xs text-muted-foreground">{row.channel?.name ?? "Admin"} • {row.publishedOn ?? "—"}</p>
          </div>
        </div>
      ),
    },
    { key: "category", header: "Category", cell: (row) => <CategoryBadge category={row.category} /> },
    { key: "views", header: "Views", cell: (row) => row.views.toLocaleString() },
    { key: "status", header: "Status", cell: (row) => <StatusBadge status={row.status} /> },
  ];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        breadcrumbs={[{ label: "Dashboard" }]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Input type="date" className="w-[150px]" aria-label="Start date" />
            <Input type="date" className="w-[150px]" aria-label="End date" />
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" /> Download Report
            </Button>
          </div>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-4 xl:grid-cols-5">
        <StatsCard title="Total Posts" value="1,482" subtitle="+12% this month" icon={FileText} variant="red" />
        <StatsCard title="Total Users" value="24,892" subtitle="Registered + guests" icon={Users} variant="blue" />
        <StatsCard title="Opened App Today" value="3,418" subtitle="+214 since yesterday" icon={Smartphone} variant="green" />
        <StatsCard title="New Users This Month" value="1,280" subtitle="+18% growth" icon={UserPlus} variant="violet" />
        <StatsCard title="Notifications Sent" value="8,420" subtitle="Last 30 days" icon={Bell} variant="amber" />
      </div>

      <div className="mb-6 grid gap-4 xl:grid-cols-[1fr_360px]">
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold">New Users Added</h3>
              <p className="text-sm text-muted-foreground">Daily user additions in selected range</p>
            </div>
            <Eye className="h-5 w-5 text-primary" />
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={newUserTrend}>
                <XAxis dataKey="date" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="users" stroke="#dc2626" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="text-base font-semibold">Users by Platform</h3>
          <p className="mb-4 text-sm text-muted-foreground">Android and iOS split</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={platformUsers} innerRadius={62} outerRadius={92} paddingAngle={4} dataKey="value">
                  {platformUsers.map((item) => <Cell key={item.name} fill={item.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2">
            {platformUsers.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />{item.name}</span>
                <span className="font-medium">{item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <div className="mb-4">
          <h3 className="text-base font-semibold">Top Viewed News</h3>
          <p className="text-sm text-muted-foreground">Highest performing stories for the selected range</p>
        </div>
        <DataTable columns={columns} data={mockNews.slice(0, 5)} rowKey={(row) => row.id} page={1} pageSize={5} total={5} />
      </Card>
    </div>
  );
}
