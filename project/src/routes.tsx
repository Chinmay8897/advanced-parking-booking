import { Suspense, lazy, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import Layout from './components/Layout';
import LoadingSpinner from './components/ui/LoadingSpinner';
import { useAuth } from './contexts/AuthContext';
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

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, session, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('ProtectedRoute state:', { user, session, loading });
  }, [user, session, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user || !session) {
    console.log('No user or session, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

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