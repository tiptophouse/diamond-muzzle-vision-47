
import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TelegramAuthProvider } from './context/TelegramAuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { TutorialProvider } from './contexts/TutorialContext';
import { Toaster } from './components/ui/toaster';
import { ErrorBoundary } from './components/ErrorBoundary';
import { SecureAuthGuard } from './components/auth/SecureAuthGuard';

// Pages
import Index from './pages/Index';
import InventoryPage from './pages/InventoryPage';
import UploadPage from './pages/UploadPage';
import UploadSingleStonePage from './pages/UploadSingleStonePage';
import BulkUploadPage from './pages/BulkUploadPage';
import StandardizeCsvPage from './pages/StandardizeCsvPage';
import Dashboard from './pages/Dashboard';
import SettingsPage from './pages/SettingsPage';
import DiamondDetailPage from './pages/DiamondDetailPage';
import SecureDiamondPage from './pages/SecureDiamondPage';
import CatalogPage from './pages/CatalogPage';
import InsightsPage from './pages/InsightsPage';
import ProfilePage from './pages/ProfilePage';
import WishlistPage from './pages/WishlistPage';
import NotificationsPage from './pages/NotificationsPage';
import ChatPage from './pages/ChatPage';
import DiamondSwipe from './pages/DiamondSwipe';
import Admin from './pages/Admin';
import AdminAnalytics from './pages/AdminAnalytics';
import HomePage from './pages/HomePage';
import NotFound from './pages/NotFound';

import './App.css';

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
          <TutorialProvider>
            <Router>
              <TelegramAuthProvider>
                <SecureAuthGuard>
                  <div className="App" dir="rtl">
                    <Routes>
                      {/* Public routes */}
                      <Route path="/" element={<Index />} />
                      <Route path="/home" element={<HomePage />} />
                      <Route path="/store" element={<CatalogPage />} />
                      <Route path="/shared/:shareId" element={<SecureDiamondPage />} />
                      
                      {/* Protected routes */}
                      <Route path="/inventory" element={<InventoryPage />} />
                      <Route path="/upload" element={<UploadPage />} />
                      <Route path="/upload-single-stone" element={<UploadSingleStonePage />} />
                      <Route path="/bulk-upload" element={<BulkUploadPage />} />
                      <Route path="/standardize-csv" element={<StandardizeCsvPage />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/settings" element={<SettingsPage />} />
                      <Route path="/insights" element={<InsightsPage />} />
                      <Route path="/profile" element={<ProfilePage />} />
                      <Route path="/wishlist" element={<WishlistPage />} />
                      <Route path="/notifications" element={<NotificationsPage />} />
                      <Route path="/chat" element={<ChatPage />} />
                      <Route path="/swipe" element={<DiamondSwipe />} />
                      
                      {/* Diamond detail routes */}
                      <Route path="/diamond/:stockNumber" element={<DiamondDetailPage />} />
                      
                      {/* Admin routes */}
                      <Route path="/admin" element={<Admin />} />
                      <Route path="/admin/analytics" element={<AdminAnalytics />} />
                      
                      {/* 404 fallback */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </div>
                </SecureAuthGuard>
              </TelegramAuthProvider>
            </Router>
          </TutorialProvider>
        </ThemeProvider>
        <Toaster />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
