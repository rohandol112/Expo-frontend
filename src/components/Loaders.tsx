import { Suspense, type ReactNode } from 'react';

export function PageLoader() {
  return (
    <div className="flex h-full min-h-[200px] w-full items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-foreground" />
    </div>
  );
}

export function Lazy({ page }: { page: ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{page}</Suspense>;
}
