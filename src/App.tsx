
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TelegramAuthProvider } from '@/context/TelegramAuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { TutorialProvider } from '@/contexts/TutorialContext';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as SonnerToaster } from '@/components/ui/sonner';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { TelegramOnlyGuard } from '@/components/auth/TelegramOnlyGuard';
import { TelegramLayout } from '@/components/layout/TelegramLayout';
import { useTelegramInit } from '@/hooks/useTelegramInit';
import { useEffect } from 'react';
import Index from '@/pages/Index';
import Dashboard from '@/pages/Dashboard';
import InventoryPage from '@/pages/InventoryPage';
import UploadPage from '@/pages/UploadPage';
import BulkUploadPage from '@/pages/BulkUploadPage';
import UploadSingleStonePage from '@/pages/UploadSingleStonePage';
import StandardizeCsvPage from '@/pages/StandardizeCsvPage';
import NotificationsPage from '@/pages/NotificationsPage';
import InsightsPage from '@/pages/InsightsPage';
import SettingsPage from '@/pages/SettingsPage';
import ProfilePage from '@/pages/ProfilePage';
import StorePage from '@/pages/StorePage';
import WishlistPage from '@/pages/WishlistPage';
import DiamondDetailPage from '@/pages/DiamondDetailPage';
import SecureDiamondPage from '@/pages/SecureDiamondPage';
import DiamondSwipe from '@/pages/DiamondSwipe';
import ChatPage from '@/pages/ChatPage';
import Admin from '@/pages/Admin';
import AdminAnalytics from '@/pages/AdminAnalytics';
import NotFound from '@/pages/NotFound';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function TelegramInitializer() {
  useTelegramInit();
  
  useEffect(() => {
    // Initialize Telegram WebApp if available
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
    }
  }, []);
  
  return null;
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <TutorialProvider>
            <TelegramAuthProvider>
              <TelegramInitializer />
              <Router>
                <TelegramOnlyGuard>
                  <TelegramLayout>
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/inventory" element={<InventoryPage />} />
                      <Route path="/upload" element={<UploadPage />} />
                      <Route path="/bulk-upload" element={<BulkUploadPage />} />
                      <Route path="/upload-single-stone" element={<UploadSingleStonePage />} />
                      <Route path="/standardize-csv" element={<StandardizeCsvPage />} />
                      <Route path="/notifications" element={<NotificationsPage />} />
                      <Route path="/insights" element={<InsightsPage />} />
                      <Route path="/settings" element={<SettingsPage />} />
                      <Route path="/profile" element={<ProfilePage />} />
                      <Route path="/store" element={<StorePage />} />
                      <Route path="/wishlist" element={<WishlistPage />} />
                      <Route path="/diamond/:stockNumber" element={<DiamondDetailPage />} />
                      <Route path="/secure-diamond/:shareId" element={<SecureDiamondPage />} />
                      <Route path="/diamond-swipe" element={<DiamondSwipe />} />
                      <Route path="/chat" element={<ChatPage />} />
                      <Route path="/admin" element={<Admin />} />
                      <Route path="/admin/analytics" element={<AdminAnalytics />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </TelegramLayout>
                </TelegramOnlyGuard>
              </Router>
              <Toaster />
              <SonnerToaster />
            </TelegramAuthProvider>
          </TutorialProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
