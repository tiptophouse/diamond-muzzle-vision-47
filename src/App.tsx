import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TelegramAuthProvider } from './context/TelegramAuthContext';
import { TutorialProvider } from './contexts/TutorialContext';
import { InteractiveWizardProvider } from './contexts/InteractiveWizardContext';
import { RTLProvider } from './contexts/RTLContext';
import { SecureTelegramLayout } from './components/layout/SecureTelegramLayout';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AuthenticatedRoute } from './components/auth/AuthenticatedRoute';
import { PublicRoute } from './components/auth/PublicRoute';
import { EnhancedTelegramAdminGuard } from './components/admin/EnhancedTelegramAdminGuard';
import { registerServiceWorker } from './lib/serviceWorker';
import { DashboardLoading } from './components/dashboard/DashboardLoading';
import { StartParamInitializer } from './components/layout/StartParamInitializer';

// Code splitting: Lazy load ALL pages to reduce initial bundle size from 1.5MB to ~300KB
const Index = lazy(() => import('./pages/Index'));
const SimpleDashboard = lazy(() => import('./pages/SimpleDashboard'));
const CatalogPage = lazy(() => import('./pages/CatalogPage'));
const UploadSingleStonePage = lazy(() => import('./pages/UploadSingleStonePage'));
const InsightsPage = lazy(() => import('./pages/InsightsPage'));
const DiamondAgentsPage = lazy(() => import('./pages/DiamondAgentsPage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const WishlistPage = lazy(() => import('./pages/WishlistPage'));
const PublicDiamondPage = lazy(() => import('./pages/PublicDiamondPage'));
const Admin = lazy(() => import('./pages/Admin'));
const AdminAnalytics = lazy(() => import('./pages/AdminAnalytics'));
const DiamondDetailPage = lazy(() => import('./pages/DiamondDetailPage'));
const ChatPage = lazy(() => import('./pages/ChatPage'));
const SecureDiamondPage = lazy(() => import('./pages/SecureDiamondPage'));
const DiamondSwipe = lazy(() => import('./pages/DiamondSwipe'));
const SecureDiamondViewerPage = lazy(() => import('./pages/SecureDiamondViewerPage'));
const NotFound = lazy(() => import('./pages/NotFound'));
const StandardizeCsvPage = lazy(() => import('./pages/StandardizeCsvPage'));
const BulkUploadPage = lazy(() => import('./pages/BulkUploadPage'));
const InventoryPage = lazy(() => import('./pages/InventoryPage'));
const UploadPage = lazy(() => import('./pages/UploadPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
const TelegramNotificationsDemo = lazy(() => import('./pages/TelegramNotificationsDemo'));
const AdminStatsPage = lazy(() => import('./pages/AdminStatsPage'));
const ImmersiveDiamondPage = lazy(() => import('./pages/ImmersiveDiamondPage'));
const DiamondShareAnalytics = lazy(() => import('./pages/DiamondShareAnalytics'));

// Register service worker for offline support in Telegram Mini App
registerServiceWorker();

function App() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1, // Reduce retries for faster failure
        staleTime: 10 * 60 * 1000, // 10 minutes - cache data longer
        gcTime: 15 * 60 * 1000, // 15 minutes - keep cached data longer
        refetchOnWindowFocus: false, // Don't refetch on window focus
        refetchOnMount: false, // Don't refetch on mount if data exists
      },
    },
  });
  
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <RTLProvider>
          <TelegramAuthProvider>
            <Router>
              <TutorialProvider>
                <InteractiveWizardProvider>
                  <SecureTelegramLayout>
                  <StartParamInitializer />
                  <Suspense fallback={<DashboardLoading onEmergencyMode={() => {}} />}>
                  <Routes>
                  {/* Public route - redirects to dashboard if authenticated */}
                  <Route path="/" element={
                    <PublicRoute>
                      <Index />
                    </PublicRoute>
                  } />
                  
                   {/* All protected routes require JWT authentication - OPTIMIZED: Lazy loaded */}
                   <Route path="/dashboard" element={
                     <AuthenticatedRoute>
                       <SimpleDashboard />
                     </AuthenticatedRoute>
                   } />
                   <Route path="/inventory" element={
                     <AuthenticatedRoute>
                       <InventoryPage />
                     </AuthenticatedRoute>
                   } />
                  <Route path="/catalog" element={
                    <AuthenticatedRoute>
                      <CatalogPage />
                    </AuthenticatedRoute>
                  } />
                  <Route path="/store" element={
                    <AuthenticatedRoute>
                      <CatalogPage />
                    </AuthenticatedRoute>
                  } />
                  
                  {/* Public diamond sharing - no JWT required */}
                  <Route path="/public/diamond/:stockNumber" element={<PublicDiamondPage />} />
                  
                   <Route path="/chat" element={
                     <AuthenticatedRoute>
                       <ChatPage />
                     </AuthenticatedRoute>
                   } />
                   <Route path="/upload" element={
                     <AuthenticatedRoute>
                       <UploadPage />
                     </AuthenticatedRoute>
                   } />
                  <Route path="/upload/bulk" element={
                    <AuthenticatedRoute>
                      <BulkUploadPage />
                    </AuthenticatedRoute>
                  } />
                  <Route path="/upload-single-stone" element={
                    <AuthenticatedRoute>
                      <UploadSingleStonePage />
                    </AuthenticatedRoute>
                  } />
                  <Route path="/insights" element={
                    <AuthenticatedRoute>
                      <InsightsPage />
                    </AuthenticatedRoute>
                  } />
                   <Route path="/diamond-agents" element={
                     <AuthenticatedRoute>
                       <DiamondAgentsPage />
                     </AuthenticatedRoute>
                   } />
                  <Route path="/notifications" element={
                    <AuthenticatedRoute>
                      <NotificationsPage />
                    </AuthenticatedRoute>
                  } />
                  <Route path="/profile" element={
                    <AuthenticatedRoute>
                      <ProfilePage />
                    </AuthenticatedRoute>
                  } />
                   <Route path="/settings" element={
                     <AuthenticatedRoute>
                       <SettingsPage />
                     </AuthenticatedRoute>
                   } />
                  <Route path="/wishlist" element={
                    <AuthenticatedRoute>
                      <WishlistPage />
                    </AuthenticatedRoute>
                  } />
                   <Route path="/admin" element={
                     <AuthenticatedRoute>
                       <EnhancedTelegramAdminGuard>
                         <Admin />
                       </EnhancedTelegramAdminGuard>
                     </AuthenticatedRoute>
                   } />
                   <Route path="/admin/analytics" element={
                     <AuthenticatedRoute>
                       <EnhancedTelegramAdminGuard>
                         <AdminAnalytics />
                       </EnhancedTelegramAdminGuard>
                     </AuthenticatedRoute>
                   } />
                   <Route path="/admin-stats" element={
                     <AuthenticatedRoute>
                       <EnhancedTelegramAdminGuard>
                         <AdminStatsPage />
                       </EnhancedTelegramAdminGuard>
                     </AuthenticatedRoute>
                   } />
                  <Route path="/diamond/:stockNumber" element={
                    <AuthenticatedRoute>
                      <DiamondDetailPage />
                    </AuthenticatedRoute>
                  } />
                  <Route path="/secure-diamond/:encryptedData" element={
                    <AuthenticatedRoute>
                      <SecureDiamondPage />
                    </AuthenticatedRoute>
                  } />
                  <Route path="/swipe" element={
                    <AuthenticatedRoute>
                      <DiamondSwipe />
                    </AuthenticatedRoute>
                  } />
                  <Route path="/standardize-csv" element={
                    <AuthenticatedRoute>
                      <StandardizeCsvPage />
                    </AuthenticatedRoute>
                  } />
                  <Route path="/analytics" element={
                    <AuthenticatedRoute>
                      <AnalyticsPage />
                    </AuthenticatedRoute>
                  } />
                  <Route path="/demo/notifications" element={
                    <AuthenticatedRoute>
                      <TelegramNotificationsDemo />
                    </AuthenticatedRoute>
                  } />
                  
                  <Route path="/shared-diamond/:stockNumber" element={
                    <AuthenticatedRoute>
                      <SecureDiamondViewerPage />
                    </AuthenticatedRoute>
                  } />

                  {/* Immersive Diamond Viewer with Motion Controls */}
                  <Route path="/diamond/:stockNumber/immersive" element={
                    <AuthenticatedRoute>
                      <ImmersiveDiamondPage />
                    </AuthenticatedRoute>
                  } />

                  {/* Diamond Share Analytics */}
                  <Route path="/analytics/shares" element={
                    <AuthenticatedRoute>
                      <DiamondShareAnalytics />
                    </AuthenticatedRoute>
                  } />

                   <Route path="*" element={<NotFound />} />
                 </Routes>
                 </Suspense>
                 </SecureTelegramLayout>
              </InteractiveWizardProvider>
            </TutorialProvider>
          </Router>
        </TelegramAuthProvider>
        </RTLProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
