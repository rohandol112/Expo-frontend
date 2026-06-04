import { DataTable, type Column } from "@/components/tables/DataTable";
import type { DayWiseReport } from "@/types/report";

const columns: Column<DayWiseReport>[] = [
  { key: "date", header: "Date", cell: (r) => <span className="font-medium">{r.date}</span> },
  { key: "news", header: "News", cell: (r) => r.news },
  { key: "users", header: "New Users", cell: (r) => r.users.toLocaleString() },
  { key: "notifications", header: "Notifications", cell: (r) => r.notifications.toLocaleString() },
  { key: "views", header: "Views", cell: (r) => r.views.toLocaleString() },
];

export function DayWiseReportTable({ data }: { data: DayWiseReport[] }) {
  return <DataTable columns={columns} data={data} rowKey={(r) => r.id} showIndex={false} pageSize={5} />;
}
