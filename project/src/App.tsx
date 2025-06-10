import { Suspense, lazy } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import LoadingSpinner from './components/ui/LoadingSpinner';
import { useAuth } from './contexts/AuthContext';
import HomePage from './pages/HomePage';
import { PaymentProvider } from './contexts/PaymentContext';
import { PaymentPage } from './pages/PaymentPage';

const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const FindParkingPage = lazy(() => import('./pages/FindParkingPage'));
const MyBookingsPage = lazy(() => import('./pages/MyBookingsPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <PaymentProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route
              path="find-parking"
              element={
                <ProtectedRoute>
                  <FindParkingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="my-bookings"
              element={
                <ProtectedRoute>
                  <MyBookingsPage />
                </ProtectedRoute>
              }
            />
            <Route path="contact" element={<ContactPage />} />
            <Route path="payment/:bookingId" element={<PaymentPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </PaymentProvider>
    </Suspense>
  );
}

export default App;