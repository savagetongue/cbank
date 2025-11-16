import '@/lib/errorReporter';
import { enableMapSet } from "immer";
enableMapSet();
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary';
import '@/index.css'
import { HomePage } from '@/pages/HomePage'
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { CreateOfferPage } from '@/pages/CreateOfferPage';
import { OfferDetailsPage } from '@/pages/OfferDetailsPage';
import { MyOffersPage } from '@/pages/MyOffersPage';
import { MyRequestsPage } from '@/pages/MyRequestsPage';
import { MyProfilePage } from '@/pages/MyProfilePage';
import { AdminDashboardPage } from '@/pages/AdminDashboardPage';
import { SettingsPage } from '@/pages/SettingsPage';
const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <HomePage />
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/create-offer",
    element: (
      <ProtectedRoute>
        <CreateOfferPage />
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/offer/:offerId",
    element: (
      <ProtectedRoute>
        <OfferDetailsPage />
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/my-offers",
    element: (
      <ProtectedRoute>
        <MyOffersPage />
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/my-requests",
    element: (
      <ProtectedRoute>
        <MyRequestsPage />
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/profile",
    element: (
      <ProtectedRoute>
        <MyProfilePage />
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/settings",
    element: (
      <ProtectedRoute>
        <SettingsPage />
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/admin",
    element: (
      <ProtectedRoute>
        <AdminDashboardPage />
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/login",
    element: <LoginPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
    errorElement: <RouteErrorBoundary />,
  },
]);
// Do not touch this code
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  </StrictMode>,
)