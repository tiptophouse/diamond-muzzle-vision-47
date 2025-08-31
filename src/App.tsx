
import React, { lazy } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { TelegramAuthProvider } from '@/context/TelegramAuthContext';
import { TelegramThemeProvider } from '@/contexts/TelegramThemeContext';
import { TutorialProvider } from '@/contexts/TutorialContext';
import { LazyRoute } from '@/components/common/LazyRoute';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import './App.css';

// Lazy load all route components for optimal bundle splitting
const Index = lazy(() => import('@/pages/Index'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const InventoryPage = lazy(() => import('@/pages/InventoryPage'));
const CatalogPage = lazy(() => import('@/pages/CatalogPage'));
const ChatPage = lazy(() => import('@/pages/ChatPage'));
const InsightsPage = lazy(() => import('@/pages/InsightsPage'));
const AnalyticsPage = lazy(() => import('@/pages/AnalyticsPage'));
const UploadPage = lazy(() => import('@/pages/UploadPage'));
const UploadSingleStonePage = lazy(() => import('@/pages/UploadSingleStonePage'));
const BulkUploadPage = lazy(() => import('@/pages/BulkUploadPage'));
const StandardizeCsvPage = lazy(() => import('@/pages/StandardizeCsvPage'));
const DiamondDetailPage = lazy(() => import('@/pages/DiamondDetailPage'));
const SecureDiamondPage = lazy(() => import('@/pages/SecureDiamondPage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
const NotificationsPage = lazy(() => import('@/pages/NotificationsPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const WishlistPage = lazy(() => import('@/pages/WishlistPage'));
const Admin = lazy(() => import('@/pages/Admin'));
const AdminAnalytics = lazy(() => import('@/pages/AdminAnalytics'));
const NotFound = lazy(() => import('@/pages/NotFound'));

// Optimized QueryClient configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: (failureCount, error) => {
        if (error instanceof Error && error.message.includes('404')) {
          return false;
        }
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    }
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TelegramThemeProvider>
          <TelegramAuthProvider>
            <TutorialProvider>
              <Router>
                <div className="App min-h-screen bg-background">
                  <Routes>
                    <Route path="/" element={
                      <LazyRoute>
                        <Index />
                      </LazyRoute>
                    } />
                    <Route path="/dashboard" element={
                      <LazyRoute>
                        <Dashboard />
                      </LazyRoute>
                    } />
                    <Route path="/inventory" element={
                      <LazyRoute>
                        <InventoryPage />
                      </LazyRoute>
                    } />
                    <Route path="/store" element={
                      <LazyRoute>
                        <CatalogPage />
                      </LazyRoute>
                    } />
                    <Route path="/catalog" element={
                      <LazyRoute>
                        <CatalogPage />
                      </LazyRoute>
                    } />
                    <Route path="/chat" element={
                      <LazyRoute>
                        <ChatPage />
                      </LazyRoute>
                    } />
                    <Route path="/insights" element={
                      <LazyRoute>
                        <InsightsPage />
                      </LazyRoute>
                    } />
                    <Route path="/analytics" element={
                      <LazyRoute>
                        <AnalyticsPage />
                      </LazyRoute>
                    } />
                    <Route path="/upload" element={
                      <LazyRoute>
                        <UploadPage />
                      </LazyRoute>
                    } />
                    <Route path="/upload-single-stone" element={
                      <LazyRoute>
                        <UploadSingleStonePage />
                      </LazyRoute>
                    } />
                    <Route path="/bulk-upload" element={
                      <LazyRoute>
                        <BulkUploadPage />
                      </LazyRoute>
                    } />
                    <Route path="/standardize-csv" element={
                      <LazyRoute>
                        <StandardizeCsvPage />
                      </LazyRoute>
                    } />
                    <Route path="/diamond/:diamondId" element={
                      <LazyRoute>
                        <DiamondDetailPage />
                      </LazyRoute>
                    } />
                    <Route path="/secure-diamond/:shareId" element={
                      <LazyRoute>
                        <SecureDiamondPage />
                      </LazyRoute>
                    } />
                    <Route path="/settings" element={
                      <LazyRoute>
                        <SettingsPage />
                      </LazyRoute>
                    } />
                    <Route path="/notifications" element={
                      <LazyRoute>
                        <NotificationsPage />
                      </LazyRoute>
                    } />
                    <Route path="/profile" element={
                      <LazyRoute>
                        <ProfilePage />
                      </LazyRoute>
                    } />
                    <Route path="/wishlist" element={
                      <LazyRoute>
                        <WishlistPage />
                      </LazyRoute>
                    } />
                    <Route path="/admin" element={
                      <LazyRoute withLayout={false}>
                        <Admin />
                      </LazyRoute>
                    } />
                    <Route path="/admin/analytics" element={
                      <LazyRoute withLayout={false}>
                        <AdminAnalytics />
                      </LazyRoute>
                    } />
                    <Route path="*" element={
                      <LazyRoute>
                        <NotFound />
                      </LazyRoute>
                    } />
                  </Routes>
                  <Toaster />
                </div>
              </Router>
            </TutorialProvider>
          </TelegramAuthProvider>
        </TelegramThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
