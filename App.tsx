import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import LandingPage from '@/components/landing-page';
import LoginPage from '@/pages/LoginPage';
import SignUpPage from '@/pages/SignUpPage';
import AdminPage from '@/pages/AdminPage';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import { AppConfigProvider } from './contexts/AppConfigContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { ThemeProvider, useTheme } from './components/theme-provider';
import { Toaster } from 'sonner';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import DemoPage from './pages/DemoPage';
import TrackOrderPage from './pages/TrackOrderPage';
import UserDashboardPage from './pages/UserDashboardPage';
import { motion, AnimatePresence } from 'framer-motion';
import LeaderboardPage from './pages/LeaderboardPage';
import AboutUsPage from './pages/AboutUsPage';
import ExchangePortalPage from './pages/ExchangePortalPage';
import { AuthModalProvider } from './contexts/AuthModalContext';
import AuthModal from './components/auth/AuthModal';
import { RateProvider } from './contexts/RateContext';
import BuySellPage from './pages/BuySellPage';
import { NotificationProvider } from './contexts/NotificationContext';

function AppRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        className="flex-grow flex flex-col"
      >
        <Routes location={location}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/about" element={<AboutUsPage />} />
          <Route path="/demo" element={<DemoPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/exchange" element={<ExchangePortalPage />} />
          <Route path="/buy-sell" element={<BuySellPage />} />
          <Route path="/track/:id" element={<TrackOrderPage />} />
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminPage />
              </ProtectedRoute>
            }
          />
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute>
                <UserDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route path="/dashboard" element={<Navigate to="/dashboard/overview" replace />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

function AppLayout() {
  const { theme } = useTheme();
  return (
    <div className="relative z-10 flex flex-col min-h-screen">
      <AppRoutes />
      <Toaster richColors theme={theme === 'dark' ? 'dark' : 'light'} position="bottom-right" />
      <AuthModal />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <CurrencyProvider>
        <RateProvider>
          <AuthProvider>
            <AppConfigProvider>
              <AuthModalProvider>
                <NotificationProvider>
                  <AppLayout />
                </NotificationProvider>
              </AuthModalProvider>
            </AppConfigProvider>
          </AuthProvider>
        </RateProvider>
      </CurrencyProvider>
    </ThemeProvider>
  );
}

export default App;
