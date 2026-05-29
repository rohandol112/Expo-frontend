import { createFileRoute } from "@tanstack/react-router";
import { Newspaper, Eye, Users, Tv, TrendingUp, MessageSquareWarning } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatsCard } from "@/components/common/StatsCard";
import { Card } from "@/components/ui/card";
import { CategoryBadge, StatusBadge } from "@/components/common/StatusBadge";
import { mockNews } from "@/mock/news.mock";

export const Route = createFileRoute("/_app/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  return (
    <div>
      <PageHeader title="Dashboard" breadcrumbs={[{ label: "Dashboard" }]} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard title="Total News" value="1,482" subtitle="+12% this month" icon={Newspaper} variant="red" />
        <StatsCard title="Total Views" value="1.25M" subtitle="+8.4% this week" icon={Eye} variant="blue" />
        <StatsCard title="Active Users" value="24,892" subtitle="+340 today" icon={Users} variant="green" />
        <StatsCard title="Channels" value="148" subtitle="6 pending review" icon={Tv} variant="violet" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold">News Performance</h3>
              <p className="text-sm text-muted-foreground">Views in the last 30 days</p>
            </div>
            <TrendingUp className="h-5 w-5 text-emerald-500" />
          </div>
          <div className="h-56 flex items-end gap-2">
            {[40, 65, 50, 80, 55, 72, 90, 68, 78, 95, 60, 88].map((h, i) => (
              <div key={i} className="flex-1 bg-primary/20 rounded-t" style={{ height: `${h}%` }}>
                <div className="w-full bg-primary rounded-t" style={{ height: "30%" }} />
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-6">
          <h3 className="text-base font-semibold mb-4">Recent Complaints</h3>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-start gap-3 pb-3 border-b last:border-0 last:pb-0">
                <div className="h-8 w-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
                  <MessageSquareWarning className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">Misleading headline reported</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-base font-semibold mb-4">Recent News</h3>
        <div className="space-y-3">
          {mockNews.slice(0, 5).map((n) => (
            <div key={n.id} className="flex items-center gap-3 py-2 border-b last:border-0">
              <img src={n.thumbnail} alt="" className="h-12 w-16 rounded object-cover" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{n.title}</p>
                <p className="text-xs text-muted-foreground">{n.channel?.name} • {n.publishedOn ?? "—"}</p>
              </div>
              <CategoryBadge category={n.category} />
              <StatusBadge status={n.status} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}