import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Suspense } from 'react';
import { router } from '@/router';
import { PageLoader } from '@/components/Loaders';

export default function App() {
  return (
    <>
      <Suspense fallback={<PageLoader />}>
        <RouterProvider router={router} />
      </Suspense>
      <Toaster position="top-right" richColors closeButton />
    </>
  );
}
