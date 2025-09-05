import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TelegramAuthProvider } from './context/TelegramAuthContext';
import { TutorialProvider } from './contexts/TutorialContext';
import { InteractiveWizardProvider } from './contexts/InteractiveWizardContext';
import { SecureTelegramLayout } from './components/layout/SecureTelegramLayout';
import { AuthenticatedRoute } from './components/auth/AuthenticatedRoute';
import { PublicRoute } from './components/auth/PublicRoute';
import { AdminGuard } from './components/admin/AdminGuard';
import Index from './pages/Index';
import Dashboard from './pages/Dashboard';
import InventoryPage from './pages/InventoryPage';
import CatalogPage from './pages/CatalogPage';
import UploadPage from './pages/UploadPage';
import UploadSingleStonePage from './pages/UploadSingleStonePage';
import InsightsPage from './pages/InsightsPage';
import ChatPage from './pages/ChatPage';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import WishlistPage from './pages/WishlistPage';
import Admin from './pages/Admin';
import AdminAnalytics from './pages/AdminAnalytics';
import DiamondDetailPage from './pages/DiamondDetailPage';
import SecureDiamondPage from './pages/SecureDiamondPage';
import DiamondSwipe from './pages/DiamondSwipe';
import SecureDiamondViewerPage from './pages/SecureDiamondViewerPage';
import NotFound from './pages/NotFound';
import StandardizeCsvPage from './pages/StandardizeCsvPage';
import BulkUploadPage from './pages/BulkUploadPage';
import AnalyticsPage from "./pages/AnalyticsPage";

function App() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 5 * 60 * 1000, // 5 minutes
      },
    },
  });
  
  return (
    <QueryClientProvider client={queryClient}>
      <TelegramAuthProvider>
        <Router>
          <TutorialProvider>
            <InteractiveWizardProvider>
              <SecureTelegramLayout>
                <Routes>
                  {/* Public route - redirects to dashboard if authenticated */}
                  <Route path="/" element={
                    <PublicRoute>
                      <Index />
                    </PublicRoute>
                  } />
                  
                  {/* All protected routes require JWT authentication */}
                  <Route path="/dashboard" element={
                    <AuthenticatedRoute>
                      <Dashboard />
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
                  <Route path="/chat" element={
                    <AuthenticatedRoute>
                      <ChatPage />
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
                      <AdminGuard>
                        <Admin />
                      </AdminGuard>
                    </AuthenticatedRoute>
                  } />
                  <Route path="/admin/analytics" element={
                    <AuthenticatedRoute>
                      <AdminGuard>
                        <AdminAnalytics />
                      </AdminGuard>
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
                  
                  <Route path="/shared-diamond/:stockNumber" element={
                    <AuthenticatedRoute>
                      <SecureDiamondViewerPage />
                    </AuthenticatedRoute>
                  } />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </SecureTelegramLayout>
            </InteractiveWizardProvider>
          </TutorialProvider>
        </Router>
      </TelegramAuthProvider>
    </QueryClientProvider>
  );
}

export default App;
