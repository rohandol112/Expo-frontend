import { Outlet } from "@tanstack/react-router";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { useAuthGuard } from "@/hooks/useAuthGuard";

export function RootLayout() {
  useAuthGuard();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="flex min-h-screen min-w-0 flex-col lg:ml-64 max-lg:ml-20">
        <Topbar />
        <main className="flex-1 bg-muted/30 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
