import { Skeleton } from "@/components/ui/skeleton";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

function AuthPageSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
      <div className="w-full max-w-md rounded-2xl border bg-white p-8 shadow-xl">
        <div className="mb-6 flex flex-col items-center">
          <Skeleton className="mb-3 h-12 w-12 rounded-full" />
          <Skeleton className="h-7 w-40" />
          <Skeleton className="mt-2 h-4 w-52" />
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-11 w-full rounded-md" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-11 w-full rounded-md" />
          </div>
          <Skeleton className="h-11 w-full rounded-md" />
        </div>
      </div>
    </div>
  );
}

function DashboardShellSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <div className="flex min-h-screen min-w-0 flex-col lg:ml-64 max-lg:ml-20">
        <Topbar />

        <main className="flex-1 bg-muted/30 p-4 lg:p-6">
          <div className="space-y-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-3">
                <Skeleton className="h-8 w-56" />
                <Skeleton className="h-4 w-72" />
              </div>
              <Skeleton className="h-10 w-36 rounded-md" />
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="rounded-lg border bg-card p-5">
                  <div className="flex items-start justify-between">
                    <div className="space-y-3">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-8 w-20" />
                    </div>
                    <Skeleton className="h-12 w-12 rounded-xl" />
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-lg border bg-card p-5">
              <div className="mb-4 flex flex-wrap gap-3">
                <Skeleton className="h-10 w-72 rounded-md" />
                <Skeleton className="h-10 w-40 rounded-md" />
                <Skeleton className="h-10 w-40 rounded-md" />
              </div>
              <div className="space-y-3">
                <Skeleton className="h-12 w-full rounded-md" />
                {Array.from({ length: 6 }).map((_, index) => (
                  <Skeleton key={index} className="h-14 w-full rounded-md" />
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export function GlobalPageSkeleton() {
  const pathname = typeof window !== "undefined" ? window.location.pathname : "/";
  const isAuthRoute = pathname === "/login";

  return isAuthRoute ? <AuthPageSkeleton /> : <DashboardShellSkeleton />;
}
