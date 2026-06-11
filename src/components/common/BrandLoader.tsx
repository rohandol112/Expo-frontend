import brandIcon from "@/assets/icon.jpeg";

export function BrandLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl border bg-card shadow-sm">
          <img src={brandIcon} alt="Pehli Baat" className="h-14 w-14 rounded-xl object-cover" />
        </div>
        <div className="h-1.5 w-36 overflow-hidden rounded-full bg-muted">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-primary" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">Loading Pehli Baat Admin...</p>
      </div>
    </div>
  );
}
