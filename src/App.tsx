
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TelegramAuthProvider } from './context/TelegramAuthContext';
import { TutorialProvider } from './contexts/TutorialContext';
import { InteractiveWizardProvider } from './contexts/InteractiveWizardContext';
import { Layout } from './components/layout/Layout';
import { AuthGuard } from './components/auth/AuthGuard';
import { AdminGuard } from './components/admin/AdminGuard';
import { SessionGuard } from './components/guards/SessionGuard';
import { RoleGuard } from './components/guards/RoleGuard';
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
                <Layout>
                  <Routes>
                    {/* Public routes - no authentication required */}
                    <Route path="/" element={<Index />} />
                    
                    {/* Protected routes - require authentication and valid session */}
                    <Route 
                      path="/dashboard" 
                      element={
                        <AuthGuard>
                          <SessionGuard>
                            <Dashboard />
                          </SessionGuard>
                        </AuthGuard>
                      } 
                    />
                    
                    <Route 
                      path="/inventory" 
                      element={
                        <AuthGuard>
                          <SessionGuard requiredPermission="inventory">
                            <InventoryPage />
                          </SessionGuard>
                        </AuthGuard>
                      } 
                    />
                    
                    <Route 
                      path="/catalog" 
                      element={
                        <AuthGuard>
                          <SessionGuard>
                            <CatalogPage />
                          </SessionGuard>
                        </AuthGuard>
                      } 
                    />
                    
                    <Route 
                      path="/store" 
                      element={
                        <AuthGuard>
                          <SessionGuard>
                            <CatalogPage />
                          </SessionGuard>
                        </AuthGuard>
                      } 
                    />
                    
                    <Route 
                      path="/upload" 
                      element={
                        <AuthGuard>
                          <SessionGuard requiredPermission="upload">
                            <UploadPage />
                          </SessionGuard>
                        </AuthGuard>
                      } 
                    />
                    
                    <Route 
                      path="/upload/bulk" 
                      element={
                        <AuthGuard>
                          <SessionGuard requiredPermission="upload">
                            <BulkUploadPage />
                          </SessionGuard>
                        </AuthGuard>
                      } 
                    />
                    
                    <Route 
                      path="/upload-single-stone" 
                      element={
                        <AuthGuard>
                          <SessionGuard requiredPermission="upload">
                            <UploadSingleStonePage />
                          </SessionGuard>
                        </AuthGuard>
                      } 
                    />
                    
                    <Route 
                      path="/insights" 
                      element={
                        <AuthGuard>
                          <SessionGuard>
                            <InsightsPage />
                          </SessionGuard>
                        </AuthGuard>
                      } 
                    />
                    
                    <Route 
                      path="/chat" 
                      element={
                        <AuthGuard>
                          <SessionGuard>
                            <ChatPage />
                          </SessionGuard>
                        </AuthGuard>
                      } 
                    />
                    
                    <Route 
                      path="/notifications" 
                      element={
                        <AuthGuard>
                          <SessionGuard>
                            <NotificationsPage />
                          </SessionGuard>
                        </AuthGuard>
                      } 
                    />
                    
                    <Route 
                      path="/profile" 
                      element={
                        <AuthGuard>
                          <SessionGuard>
                            <ProfilePage />
                          </SessionGuard>
                        </AuthGuard>
                      } 
                    />
                    
                    <Route 
                      path="/settings" 
                      element={
                        <AuthGuard>
                          <SessionGuard>
                            <SettingsPage />
                          </SessionGuard>
                        </AuthGuard>
                      } 
                    />
                    
                    <Route 
                      path="/wishlist" 
                      element={
                        <AuthGuard>
                          <SessionGuard>
                            <WishlistPage />
                          </SessionGuard>
                        </AuthGuard>
                      } 
                    />
                    
                    {/* Admin routes - require admin role */}
                    <Route 
                      path="/admin" 
                      element={
                        <AuthGuard>
                          <SessionGuard>
                            <RoleGuard requiredRole="admin">
                              <AdminGuard>
                                <Admin />
                              </AdminGuard>
                            </RoleGuard>
                          </SessionGuard>
                        </AuthGuard>
                      } 
                    />
                    
                    <Route 
                      path="/admin/analytics" 
                      element={
                        <AuthGuard>
                          <SessionGuard>
                            <RoleGuard requiredRole="admin">
                              <AdminGuard>
                                <AdminAnalytics />
                              </AdminGuard>
                            </RoleGuard>
                          </SessionGuard>
                        </AuthGuard>
                      } 
                    />
                    
                    {/* Diamond detail routes - protected */}
                    <Route 
                      path="/diamond/:stockNumber" 
                      element={
                        <AuthGuard>
                          <SessionGuard>
                            <DiamondDetailPage />
                          </SessionGuard>
                        </AuthGuard>
                      } 
                    />
                    
                    <Route 
                      path="/secure-diamond/:encryptedData" 
                      element={
                        <AuthGuard>
                          <SessionGuard>
                            <SecureDiamondPage />
                          </SessionGuard>
                        </AuthGuard>
                      } 
                    />
                    
                    <Route 
                      path="/swipe" 
                      element={
                        <AuthGuard>
                          <SessionGuard>
                            <DiamondSwipe />
                          </SessionGuard>
                        </AuthGuard>
                      } 
                    />
                    
                    <Route 
                      path="/standardize-csv" 
                      element={
                        <AuthGuard>
                          <SessionGuard requiredPermission="upload">
                            <StandardizeCsvPage />
                          </SessionGuard>
                        </AuthGuard>
                      } 
                    />
                    
                    {/* 404 - Not found */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Layout>
              </div>
            </InteractiveWizardProvider>
          </TutorialProvider>
        </Router>
      </TelegramAuthProvider>
    </QueryClientProvider>
  );
}

export default App;
