import { Suspense, lazy } from 'react';
import Layout from './components/Layout';
import LoadingSpinner from './components/ui/LoadingSpinner';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import { PaymentProvider } from './contexts/PaymentContext';
import { PaymentPage } from './pages/PaymentPage';
import { createBrowserRouter } from 'react-router-dom';

const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const FindParkingPage = lazy(() => import('./pages/FindParkingPage'));
const MyBookingsPage = lazy(() => import('./pages/MyBookingsPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const TestAuthPage = lazy(() => import('./pages/TestAuthPage'));
const DebugAuthPage = lazy(() => import('./pages/DebugAuthPage'));



export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <PaymentProvider>
          <Layout />
        </PaymentProvider>
      </Suspense>
    ),
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'register',
        element: <RegisterPage />,
      },
      {
        path: 'find-parking',
        element: (
          <ProtectedRoute>
            <FindParkingPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'my-bookings',
        element: (
          <ProtectedRoute>
            <MyBookingsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'contact',
        element: <ContactPage />,
      },
      {
        path: 'test-auth',
        element: <TestAuthPage />,
      },
      {
        path: 'debug-auth',
        element: <DebugAuthPage />,
      },
      {
        path: 'payment/:bookingId',
        element: <PaymentPage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);