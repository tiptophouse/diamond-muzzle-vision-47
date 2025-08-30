
import { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TelegramAuthProvider } from '@/context/TelegramAuthContext';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Layout } from '@/components/layout/Layout';
import { Toaster } from '@/components/ui/sonner';
import { TutorialProvider } from '@/contexts/TutorialContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Pages
import Index from '@/pages/Index';
import Dashboard from '@/pages/Dashboard';
import InventoryPage from '@/pages/InventoryPage';
import UploadPage from '@/pages/UploadPage';
import UploadSingleStonePage from '@/pages/UploadSingleStonePage';
import BulkUploadPage from '@/pages/BulkUploadPage';
import StandardizeCsvPage from '@/pages/StandardizeCsvPage';
import CatalogPage from '@/pages/CatalogPage';
import DiamondDetailPage from '@/pages/DiamondDetailPage';
import SecureDiamondPage from '@/pages/SecureDiamondPage';
import ChatPage from '@/pages/ChatPage';
import InsightsPage from '@/pages/InsightsPage';
import NotificationsPage from '@/pages/NotificationsPage';
import WishlistPage from '@/pages/WishlistPage';
import ProfilePage from '@/pages/ProfilePage';
import SettingsPage from '@/pages/SettingsPage';
import Admin from '@/pages/Admin';
import AdminAnalytics from '@/pages/AdminAnalytics';
import AnalyticsPage from '@/pages/AnalyticsPage';
import NotFound from '@/pages/NotFound';

import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TelegramAuthProvider>
          <TutorialProvider>
            <Router>
              <div className="min-h-screen bg-background">
                <Routes>
                  <Route path="/" element={
                    <AuthGuard>
                      <Layout>
                        <Index />
                      </Layout>
                    </AuthGuard>
                  } />
                  
                  <Route path="/dashboard" element={
                    <AuthGuard>
                      <Layout>
                        <Dashboard />
                      </Layout>
                    </AuthGuard>
                  } />
                  
                  <Route path="/inventory" element={
                    <AuthGuard>
                      <Layout>
                        <InventoryPage />
                      </Layout>
                    </AuthGuard>
                  } />
                  
                  <Route path="/upload" element={
                    <AuthGuard>
                      <Layout>
                        <UploadPage />
                      </Layout>
                    </AuthGuard>
                  } />
                  
                  <Route path="/upload-single-stone" element={
                    <AuthGuard>
                      <Layout>
                        <UploadSingleStonePage />
                      </Layout>
                    </AuthGuard>
                  } />
                  
                  <Route path="/bulk-upload" element={
                    <AuthGuard>
                      <Layout>
                        <BulkUploadPage />
                      </Layout>
                    </AuthGuard>
                  } />
                  
                  <Route path="/standardize-csv" element={
                    <AuthGuard>
                      <Layout>
                        <StandardizeCsvPage />
                      </Layout>
                    </AuthGuard>
                  } />
                  
                  <Route path="/store" element={
                    <AuthGuard>
                      <Layout>
                        <CatalogPage />
                      </Layout>
                    </AuthGuard>
                  } />
                  
                  <Route path="/diamond/:id" element={
                    <AuthGuard>
                      <Layout>
                        <DiamondDetailPage />
                      </Layout>
                    </AuthGuard>
                  } />
                  
                  <Route path="/secure-diamond/:shareId" element={
                    <Suspense fallback={<div>Loading...</div>}>
                      <SecureDiamondPage />
                    </Suspense>
                  } />
                  
                  <Route path="/chat" element={
                    <AuthGuard>
                      <Layout>
                        <ChatPage />
                      </Layout>
                    </AuthGuard>
                  } />
                  
                  <Route path="/insights" element={
                    <AuthGuard>
                      <Layout>
                        <InsightsPage />
                      </Layout>
                    </AuthGuard>
                  } />
                  
                  <Route path="/notifications" element={
                    <AuthGuard>
                      <Layout>
                        <NotificationsPage />
                      </Layout>
                    </AuthGuard>
                  } />
                  
                  <Route path="/wishlist" element={
                    <AuthGuard>
                      <Layout>
                        <WishlistPage />
                      </Layout>
                    </AuthGuard>
                  } />
                  
                  <Route path="/profile" element={
                    <AuthGuard>
                      <Layout>
                        <ProfilePage />
                      </Layout>
                    </AuthGuard>
                  } />
                  
                  <Route path="/settings" element={
                    <AuthGuard>
                      <Layout>
                        <SettingsPage />
                      </Layout>
                    </AuthGuard>
                  } />
                  
                  <Route path="/admin" element={
                    <AuthGuard>
                      <Layout>
                        <Admin />
                      </Layout>
                    </AuthGuard>
                  } />
                  
                  <Route path="/admin/analytics" element={
                    <AuthGuard>
                      <Layout>
                        <AdminAnalytics />
                      </Layout>
                    </AuthGuard>
                  } />
                  
                  <Route path="/analytics" element={
                    <AuthGuard>
                      <Layout>
                        <AnalyticsPage />
                      </Layout>
                    </AuthGuard>
                  } />
                  
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
              <Toaster />
            </Router>
          </TutorialProvider>
        </TelegramAuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
