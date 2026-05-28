import { Outlet } from "@tanstack/react-router";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

export function RootLayout() {
  return (
    <div className="flex h-screen min-w-[900px] bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto bg-muted/30 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}