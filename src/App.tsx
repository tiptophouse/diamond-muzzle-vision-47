
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TelegramAuthProvider } from './context/TelegramAuthContext';
import { TutorialProvider } from './contexts/TutorialContext';
import { InteractiveWizardProvider } from './contexts/InteractiveWizardContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
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
import NotFound from './pages/NotFound';
import StandardizeCsvPage from './pages/StandardizeCsvPage';
import BulkUploadPage from './pages/BulkUploadPage';

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
              <div className="min-h-screen bg-background">
                <Routes>
                  {/* Public route - login/landing page */}
                  <Route path="/" element={<Index />} />
                  
                  {/* Protected routes - require authentication */}
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/inventory" element={
                    <ProtectedRoute>
                      <InventoryPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/catalog" element={
                    <ProtectedRoute>
                      <CatalogPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/store" element={
                    <ProtectedRoute>
                      <CatalogPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/upload" element={
                    <ProtectedRoute>
                      <UploadPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/upload/bulk" element={
                    <ProtectedRoute>
                      <BulkUploadPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/upload-single-stone" element={
                    <ProtectedRoute>
                      <UploadSingleStonePage />
                    </ProtectedRoute>
                  } />
                  <Route path="/insights" element={
                    <ProtectedRoute>
                      <InsightsPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/chat" element={
                    <ProtectedRoute>
                      <ChatPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/notifications" element={
                    <ProtectedRoute>
                      <NotificationsPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  } />
                  <Route path="/settings" element={
                    <ProtectedRoute>
                      <SettingsPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/wishlist" element={
                    <ProtectedRoute>
                      <WishlistPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/swipe" element={
                    <ProtectedRoute>
                      <DiamondSwipe />
                    </ProtectedRoute>
                  } />
                  <Route path="/standardize-csv" element={
                    <ProtectedRoute>
                      <StandardizeCsvPage />
                    </ProtectedRoute>
                  } />
                  
                  {/* Admin routes - require admin privileges */}
                  <Route path="/admin" element={
                    <ProtectedRoute requireAdmin={true}>
                      <Admin />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/analytics" element={
                    <ProtectedRoute requireAdmin={true}>
                      <AdminAnalytics />
                    </ProtectedRoute>
                  } />
                  
                  {/* Diamond viewing routes - protected but allow shared access */}
                  <Route path="/diamond/:stockNumber" element={
                    <ProtectedRoute>
                      <DiamondDetailPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/secure-diamond/:encryptedData" element={
                    <ProtectedRoute>
                      <SecureDiamondPage />
                    </ProtectedRoute>
                  } />
                  
                  {/* 404 handler */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </InteractiveWizardProvider>
          </TutorialProvider>
        </Router>
      </TelegramAuthProvider>
    </QueryClientProvider>
  );
}

export default App;
