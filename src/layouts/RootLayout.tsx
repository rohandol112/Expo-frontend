import { Outlet } from "@tanstack/react-router";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { useAuthGuard } from "@/hooks/useAuthGuard";

export function RootLayout() {
  useAuthGuard();

  return (
    <div className="flex h-dvh min-w-0 bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="min-h-0 flex-1 overflow-y-auto bg-muted/30 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
