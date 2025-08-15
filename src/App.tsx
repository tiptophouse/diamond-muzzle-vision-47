
import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';
import { TelegramAuthProvider } from '@/context/TelegramAuthContext';
import { TutorialProvider } from '@/contexts/TutorialContext';
import { InteractiveWizardProvider } from '@/contexts/InteractiveWizardContext';
import { TelegramOnlyGuard } from '@/components/auth/TelegramOnlyGuard';
import { EnhancedErrorBoundary } from '@/components/ErrorBoundary/EnhancedErrorBoundary';
import { MobilePullToRefresh } from '@/components/mobile/MobilePullToRefresh';
import { useEnhancedTelegramSDK } from '@/hooks/useEnhancedTelegramSDK';

// Lazy load pages for better performance
const Index = lazy(() => import('@/pages/Index'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const InventoryPage = lazy(() => import('@/pages/InventoryPage'));
const StorePage = lazy(() => import('@/pages/StorePage'));
const DiamondDetailPage = lazy(() => import('@/pages/DiamondDetailPage'));
const UploadPage = lazy(() => import('@/pages/UploadPage'));
const UploadSingleStonePage = lazy(() => import('@/pages/UploadSingleStonePage'));
const BulkUploadPage = lazy(() => import('@/pages/BulkUploadPage'));
const ChatPage = lazy(() => import('@/pages/ChatPage'));
const InsightsPage = lazy(() => import('@/pages/InsightsPage'));
const NotificationsPage = lazy(() => import('@/pages/NotificationsPage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
const Admin = lazy(() => import('@/pages/Admin'));
const AdminAnalytics = lazy(() => import('@/pages/AdminAnalytics'));
const SecureDiamondPage = lazy(() => import('@/pages/SecureDiamondPage'));
const WishlistPage = lazy(() => import('@/pages/WishlistPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const CatalogPage = lazy(() => import('@/pages/CatalogPage'));
const StandardizeCsvPage = lazy(() => import('@/pages/StandardizeCsvPage'));
const DiamondSwipe = lazy(() => import('@/pages/DiamondSwipe'));
const NotFound = lazy(() => import('@/pages/NotFound'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        return failureCount < 2;
      },
    },
  },
});

// Loading component optimized for mobile
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto"></div>
      <p className="text-muted-foreground text-sm">Loading...</p>
    </div>
  </div>
);

function AppContent() {
  // Initialize enhanced Telegram SDK
  useEnhancedTelegramSDK();

  return (
    <Router>
      <MobilePullToRefresh>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/store" element={<StorePage />} />
            <Route path="/diamond/:id" element={<DiamondDetailPage />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/upload-single-stone" element={<UploadSingleStonePage />} />
            <Route path="/bulk-upload" element={<BulkUploadPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/insights" element={<InsightsPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />
            <Route path="/secure-diamond/:shareId" element={<SecureDiamondPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/catalog" element={<CatalogPage />} />
            <Route path="/standardize-csv" element={<StandardizeCsvPage />} />
            <Route path="/swipe" element={<DiamondSwipe />} />
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </Suspense>
      </MobilePullToRefresh>
    </Router>
  );
}

function App() {
  return (
    <EnhancedErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <TelegramAuthProvider>
            <TutorialProvider>
              <InteractiveWizardProvider>
                <TelegramOnlyGuard>
                  <AppContent />
                </TelegramOnlyGuard>
                <Toaster 
                  position="top-center"
                  expand={false}
                  richColors
                  closeButton
                  toastOptions={{
                    style: {
                      background: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      color: 'hsl(var(--foreground))',
                    },
                  }}
                />
              </InteractiveWizardProvider>
            </TutorialProvider>
          </TelegramAuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </EnhancedErrorBoundary>
  );
}

export default App;
