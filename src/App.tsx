
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TelegramAuthProvider } from './context/TelegramAuthContext';
import { TutorialProvider } from './contexts/TutorialContext';
import { InteractiveWizardProvider } from './contexts/InteractiveWizardContext';
import { ModernTelegramLayout } from './components/layout/ModernTelegramLayout';
import telegramSDK from './lib/telegramSDK';
import { initViewport } from './lib/viewport';
import { authService } from './lib/auth';
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
  
  // Bootstrap modern Telegram SDK and viewport
  useEffect(() => {
    const initApp = async () => {
      console.log('🚀 Initializing Modern Telegram Mini-App...');
      
      // Initialize viewport fixes
      initViewport();
      
      // Initialize modern Telegram SDK
      const telegramReady = await telegramSDK.initialize();
      if (telegramReady) {
        console.log('✅ Modern Telegram SDK initialized');
        
        // Auto sign-in
        try {
          await authService.signIn();
          console.log('✅ Auto sign-in successful');
        } catch (error) {
          console.warn('⚠️ Auto sign-in failed:', error);
        }
      } else {
        console.warn('⚠️ Modern Telegram SDK not available - running in browser mode');
      }
    };
    
    initApp();
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <TelegramAuthProvider>
        <Router>
          <TutorialProvider>
            <InteractiveWizardProvider>
              <ModernTelegramLayout>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/inventory" element={<InventoryPage />} />
                  <Route path="/catalog" element={<CatalogPage />} />
                  <Route path="/store" element={<CatalogPage />} />
                  <Route path="/upload" element={<UploadPage />} />
                  <Route path="/upload/bulk" element={<BulkUploadPage />} />
                  <Route path="/upload-single-stone" element={<UploadSingleStonePage />} />
                  <Route path="/insights" element={<InsightsPage />} />
                  <Route path="/chat" element={<ChatPage />} />
                  <Route path="/notifications" element={<NotificationsPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/wishlist" element={<WishlistPage />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/admin/analytics" element={<AdminAnalytics />} />
                  <Route path="/diamond/:stockNumber" element={<DiamondDetailPage />} />
                  <Route path="/secure-diamond/:encryptedData" element={<SecureDiamondPage />} />
                  <Route path="/swipe" element={<DiamondSwipe />} />
                  <Route path="/standardize-csv" element={<StandardizeCsvPage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </ModernTelegramLayout>
            </InteractiveWizardProvider>
          </TutorialProvider>
        </Router>
      </TelegramAuthProvider>
    </QueryClientProvider>
  );
}

export default App;
