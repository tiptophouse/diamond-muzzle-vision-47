import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { TelegramAuthProvider } from '@/context/TelegramAuthContext';
import { AuthorizationGuard } from '@/components/auth/AuthorizationGuard';
import { AdminGuard } from '@/components/admin/AdminGuard';
import { Layout } from '@/components/layout/Layout';

// Pages
import Index from '@/pages/Index';
import SignInPage from '@/pages/SignInPage';
import Dashboard from '@/pages/Dashboard';
import Admin from '@/pages/Admin';
import AdminAnalytics from '@/pages/AdminAnalytics';
import UploadPage from '@/pages/UploadPage';
import UploadSingleStonePage from '@/pages/UploadSingleStonePage';
import InventoryPage from '@/pages/InventoryPage';
import CatalogPage from '@/pages/CatalogPage';
import InsightsPage from '@/pages/InsightsPage';
import ChatPage from '@/pages/ChatPage';
import NotificationsPage from '@/pages/NotificationsPage';
import ProfilePage from '@/pages/ProfilePage';
import SettingsPage from '@/pages/SettingsPage';
import WishlistPage from '@/pages/WishlistPage';
import BulkUploadPage from '@/pages/BulkUploadPage';
import StandardizeCsvPage from '@/pages/StandardizeCsvPage';
import DiamondDetailPage from '@/pages/DiamondDetailPage';
import SecureDiamondPage from '@/pages/SecureDiamondPage';
import DiamondSwipe from '@/pages/DiamondSwipe';
import NotFound from '@/pages/NotFound';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <Router>
      <QueryClientProvider client={queryClient}>
        <TelegramAuthProvider>
          <AuthorizationGuard>
            <Toaster />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/signin" element={<SignInPage />} />
              
              {/* Protected routes */}
              <Route path="/dashboard" element={
                <Layout>
                  <Dashboard />
                </Layout>
              } />
              
              {/* Admin routes */}
              <Route path="/admin" element={
                <AdminGuard>
                  <Admin />
                </AdminGuard>
              } />
              
              <Route path="/admin/analytics" element={
                <AdminGuard>
                  <AdminAnalytics />
                </AdminGuard>
              } />

              {/* Other protected routes */}
              <Route path="/upload" element={
                <Layout>
                  <UploadPage />
                </Layout>
              } />
              
              <Route path="/upload-single" element={
                <Layout>
                  <UploadSingleStonePage />
                </Layout>
              } />
              
              <Route path="/inventory" element={
                <Layout>
                  <InventoryPage />
                </Layout>
              } />
              
              <Route path="/store" element={
                <Layout>
                  <CatalogPage />
                </Layout>
              } />
              
              <Route path="/insights" element={
                <Layout>
                  <InsightsPage />
                </Layout>
              } />
              
              <Route path="/chat" element={
                <Layout>
                  <ChatPage />
                </Layout>
              } />
              
              <Route path="/notifications" element={
                <Layout>
                  <NotificationsPage />
                </Layout>
              } />
              
              <Route path="/profile" element={
                <Layout>
                  <ProfilePage />
                </Layout>
              } />
              
              <Route path="/settings" element={
                <Layout>
                  <SettingsPage />
                </Layout>
              } />
              
              <Route path="/wishlist" element={
                <Layout>
                  <WishlistPage />
                </Layout>
              } />
              
              <Route path="/bulk-upload" element={
                <Layout>
                  <BulkUploadPage />
                </Layout>
              } />
              
              <Route path="/standardize-csv" element={
                <Layout>
                  <StandardizeCsvPage />
                </Layout>
              } />
              
              <Route path="/diamond/:stockNumber" element={
                <Layout>
                  <DiamondDetailPage />
                </Layout>
              } />
              
              <Route path="/secure-diamond/:token" element={<SecureDiamondPage />} />
              <Route path="/swipe" element={<DiamondSwipe />} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthorizationGuard>
        </TelegramAuthProvider>
      </QueryClientProvider>
    </Router>
  );
}

export default App;
