import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';

import RootLayout from '@/layouts/RootLayout';
import { Lazy } from '@/components/Loaders';

const HomePage = lazy(() => import('@/pages/HomePage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Lazy page={<LoginPage />} />,
  },
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <Lazy page={<HomePage />} /> },
      { path: '*', element: <Lazy page={<NotFoundPage />} /> },
    ],
  },
]);
