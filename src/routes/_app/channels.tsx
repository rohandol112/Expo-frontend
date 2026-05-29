import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { AdminListPage } from "@/components/admin/AdminListPage";
import { ActionMenu } from "@/components/common/ActionMenu";
import { Button } from "@/components/ui/button";
import { channels } from "@/mock/channels.mock";
import { languages } from "@/mock/system.mock";
import { areas, districts, states } from "@/mock/location.mock";
import type { Channel } from "@/types/channel";
import type { Column } from "@/components/tables/DataTable";
import { ROUTES } from "@/constants/routes.constants";

export const Route = createFileRoute("/_app/channels")({ component: ChannelsPage });

function ChannelsPage() {
  const navigate = useNavigate();
  const columns: Column<Channel>[] = [
    { key: "name", header: "Channel Name", cell: (r) => <div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded bg-primary/10 text-xs font-semibold text-primary">{r.logo}</div><span className="font-medium">{r.name}</span></div> },
    { key: "language", header: "Language", cell: (r) => r.language },
    { key: "state", header: "State", cell: (r) => r.state },
    { key: "district", header: "District", cell: (r) => r.district },
    { key: "areas", header: "Area/Cities", cell: (r) => r.areas.join(", ") },
    { key: "posts", header: "No. of Posts", cell: (r) => r.posts.toLocaleString() },
    { key: "added", header: "Added On", cell: (r) => r.addedOn },
    { key: "actions", header: "Actions", cell: () => <ActionMenu /> },
  ];
  return <AdminListPage title="Channels" breadcrumbs={[{ label: "Dashboard", to: ROUTES.DASHBOARD }, { label: "Channels" }]} actions={<Button onClick={() => navigate({ to: ROUTES.CHANNELS_ADD })}><Plus className="mr-2 h-4 w-4" />Add Channel</Button>} data={channels} columns={columns} rowKey={(r) => r.id} searchPlaceholder="Search channel..." dropdowns={[{ key: "language", placeholder: "Language", options: languages.map((l) => ({ label: l.name, value: l.name })) }, { key: "state", placeholder: "State", options: states.map((s) => ({ label: s.name, value: s.name })) }, { key: "district", placeholder: "District", options: districts.map((d) => ({ label: d.name, value: d.name })) }, { key: "area", placeholder: "Area/City", options: areas.map((a) => ({ label: a.name, value: a.name })) }]} filter={(row, search) => row.name.toLowerCase().includes(search.toLowerCase()) || row.language.toLowerCase().includes(search.toLowerCase())} />;
}
