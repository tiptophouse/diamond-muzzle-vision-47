import { Suspense, lazy } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TelegramAuthProvider } from '@/context/TelegramAuthContext';
import { TutorialProvider } from '@/contexts/TutorialContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { TelegramLayout } from '@/components/layout/TelegramLayout';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { TelegramOnlyGuard } from '@/components/auth/TelegramOnlyGuard';
import { AdminGuard } from '@/components/admin/AdminGuard';

// Lazy load pages
const Index = lazy(() => import('@/pages/Index'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const InventoryPage = lazy(() => import('@/pages/InventoryPage'));
const UploadPage = lazy(() => import('@/pages/UploadPage'));
const BulkUploadPage = lazy(() => import('@/pages/BulkUploadPage'));
const StorePage = lazy(() => import('@/pages/StorePage'));
const ScheduleMeetingPage = lazy(() => import('@/pages/ScheduleMeetingPage'));
const ChatPage = lazy(() => import('@/pages/ChatPage'));
const InsightsPage = lazy(() => import('@/pages/InsightsPage'));
const WishlistPage = lazy(() => import('@/pages/WishlistPage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
const Admin = lazy(() => import('@/pages/Admin'));
const NotFound = lazy(() => import('@/pages/NotFound'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <TelegramAuthProvider>
            <TutorialProvider>
              <Router>
                <TelegramLayout>
                  <Suspense fallback={<div>Loading...</div>}>
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/dashboard" element={
                        <AuthGuard>
                          <Dashboard />
                        </AuthGuard>
                      } />
                      <Route path="/inventory" element={
                        <AuthGuard>
                          <InventoryPage />
                        </AuthGuard>
                      } />
                      <Route path="/upload" element={
                        <AuthGuard>
                          <UploadPage />
                        </AuthGuard>
                      } />
                      <Route path="/bulk-upload" element={
                        <AuthGuard>
                          <BulkUploadPage />
                        </AuthGuard>
                      } />
                      <Route path="/store" element={<StorePage />} />
                      <Route path="/schedule-meeting" element={
                        <AuthGuard>
                          <ScheduleMeetingPage />
                        </AuthGuard>
                      } />
                      <Route path="/chat" element={
                        <AuthGuard>
                          <ChatPage />
                        </AuthGuard>
                      } />
                      <Route path="/insights" element={
                        <AuthGuard>
                          <InsightsPage />
                        </AuthGuard>
                      } />
                      <Route path="/wishlist" element={
                        <AuthGuard>
                          <WishlistPage />
                        </AuthGuard>
                      } />
                      <Route path="/settings" element={
                        <AuthGuard>
                          <SettingsPage />
                        </AuthGuard>
                      } />
                      <Route path="/admin" element={
                        <TelegramOnlyGuard>
                          <AdminGuard>
                            <Admin />
                          </AdminGuard>
                        </TelegramOnlyGuard>
                      } />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                </TelegramLayout>
                <Toaster />
              </Router>
            </TutorialProvider>
          </TelegramAuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
