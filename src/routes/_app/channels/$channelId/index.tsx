import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Edit, Globe, Radio, Users } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatsCard } from "@/components/common/StatsCard";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes.constants";
import { useChannel } from "@/hooks/api/useChannels";

export const Route = createFileRoute("/_app/channels/$channelId/")({ component: ChannelDetailPage });

function ChannelDetailPage() {
  const { channelId } = Route.useParams();
  const navigate = useNavigate();
  const channelQuery = useChannel(channelId);
  const channel = channelQuery.data;

  return (
    <div>
      <PageHeader
        title={channel?.name ?? "Channel Details"}
        breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "Channels", to: ROUTES.CHANNELS }, { label: "Details" }]}
        actions={<Button onClick={() => navigate({ to: "/channels/$channelId/edit", params: { channelId } })}><Edit className="mr-2 h-4 w-4" />Edit Channel</Button>}
      />
      {channelQuery.error && <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">Unable to load channel from backend.</div>}
      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard title="Posts" value={(channel?.posts ?? 0).toLocaleString()} icon={Radio} variant="blue" />
        <StatsCard title="Subscribers" value={(channel?.subscribers ?? 0).toLocaleString()} icon={Users} variant="green" />
        <StatsCard title="Status" value={channel?.status ?? "—"} icon={Globe} variant="amber" />
      </div>
      <div className="mt-6 rounded-lg border bg-card p-6">
        <dl className="grid gap-4 md:grid-cols-2">
          <Detail label="Channel Name" value={channel?.name} />
          <Detail label="Language" value={channel?.language} />
          <Detail label="Website" value={channel?.website} />
          <Detail label="State" value={channel?.state} />
          <Detail label="District" value={channel?.district} />
          <Detail label="Areas" value={channel?.areas?.join(", ")} />
          <Detail label="Added On" value={channel?.addedOn} />
          <Detail label="Description" value={channel?.description} />
        </dl>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value?: string | number }) {
  return <div><dt className="text-xs font-medium uppercase text-muted-foreground">{label}</dt><dd className="mt-1 text-sm font-medium">{value || "—"}</dd></div>;
}
