import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
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
import Index from './pages/Index';
// Lazy load heavy components to improve initial loading speed
import { LazyInventory, LazyUpload, LazySettings } from './components/performance/LazyRoute';
import SimpleDashboard from './pages/SimpleDashboard';
import CatalogPage from './pages/CatalogPage';
import UploadSingleStonePage from './pages/UploadSingleStonePage';
import InsightsPage from './pages/InsightsPage';
import DiamondAgentsPage from './pages/DiamondAgentsPage';
import ExecutiveAgentsPage from './pages/ExecutiveAgentsPage';
import NotificationsPage from './pages/NotificationsPage';
import NotificationPageFeatureTesting from './pages/NotificationPageFeatureTesting';
import ProfilePage from './pages/ProfilePage';
import WishlistPage from './pages/WishlistPage';
import PublicDiamondPage from './pages/PublicDiamondPage';
import Admin from './pages/Admin';
import AdminAnalytics from './pages/AdminAnalytics';
import DiamondDetailPage from './pages/DiamondDetailPage';
import ChatPage from './pages/ChatPage';
import SecureDiamondPage from './pages/SecureDiamondPage';
import DiamondSwipe from './pages/DiamondSwipe';
import SecureDiamondViewerPage from './pages/SecureDiamondViewerPage';
import NotFound from './pages/NotFound';
import StandardizeCsvPage from './pages/StandardizeCsvPage';
import BulkUploadPage from './pages/BulkUploadPage';
import AnalyticsPage from "./pages/AnalyticsPage";
import TelegramNotificationsDemo from "./pages/TelegramNotificationsDemo";
import AdminStatsPage from './pages/AdminStatsPage';
import ImmersiveDiamondPage from './pages/ImmersiveDiamondPage';
import DiamondShareAnalytics from './pages/DiamondShareAnalytics';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TestInlineButtons from './pages/TestInlineButtons';
import PublicAuctionPage from './pages/PublicAuctionPage';
import AuctionsListPage from './pages/AuctionsListPage';
import Diagnostic from './pages/Diagnostic';
import WebhookSetup from './pages/WebhookSetup';
import { StartParamInitializer } from './components/layout/StartParamInitializer';
import { FloatingUploadButton } from './components/upload/FloatingUploadButton';

// Register service worker for offline support in Telegram Mini App
registerServiceWorker();

function App() {
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
                  <FloatingUploadButton />
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
                       <LazyInventory />
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
                  
                  <Route path="/auctions" element={
                    <PublicRoute>
                      <AuctionsListPage />
                    </PublicRoute>
                  } />
                  
                  {/* Public diamond sharing - no JWT required */}
                  <Route path="/public/diamond/:stockNumber" element={<PublicDiamondPage />} />
                  
                  {/* Public auction page - no JWT required */}
                  <Route path="/public/auction/:auctionId" element={<PublicAuctionPage />} />
                  
                  {/* Privacy Policy - public page for BotFather */}
                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                  
                   <Route path="/chat" element={
                     <AuthenticatedRoute>
                       <ChatPage />
                     </AuthenticatedRoute>
                   } />
                   <Route path="/upload" element={
                     <AuthenticatedRoute>
                       <LazyUpload />
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
                   <Route path="/executive-agents" element={
                     <AuthenticatedRoute>
                       <EnhancedTelegramAdminGuard>
                         <ExecutiveAgentsPage />
                       </EnhancedTelegramAdminGuard>
                     </AuthenticatedRoute>
                   } />
          <Route path="/notifications" element={
            <AuthenticatedRoute>
              <NotificationsPage />
            </AuthenticatedRoute>
          } />
          <Route path="/notifications-test" element={
            <AuthenticatedRoute>
              <NotificationPageFeatureTesting />
            </AuthenticatedRoute>
          } />
          <Route path="/test-inline-buttons" element={
            <AuthenticatedRoute>
              <TestInlineButtons />
            </AuthenticatedRoute>
          } />
                  <Route path="/profile" element={
                    <AuthenticatedRoute>
                      <ProfilePage />
                    </AuthenticatedRoute>
                  } />
                   <Route path="/settings" element={
                     <AuthenticatedRoute>
                       <LazySettings />
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
                   <Route path="/webhook-setup" element={
                     <AuthenticatedRoute>
                       <EnhancedTelegramAdminGuard>
                         <WebhookSetup />
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

                  {/* Diagnostic Page - Public route for debugging */}
                  <Route path="/diagnostic" element={<Diagnostic />} />

                  <Route path="*" element={<NotFound />} />
                </Routes>
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
