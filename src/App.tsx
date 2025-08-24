
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import HomePage from '@/pages/HomePage';
import NotFound from '@/pages/NotFound';
import ProfilePage from '@/pages/ProfilePage';
import InventoryPage from '@/pages/InventoryPage';
import UploadPage from '@/pages/UploadPage';
import StorePage from '@/pages/StorePage';
import SettingsPage from '@/pages/SettingsPage';
import ReportsPage from '@/pages/ReportsPage';
import AdminPage from '@/pages/AdminPage';
import InsightsPage from '@/pages/InsightsPage';
import ChatPage from '@/pages/ChatPage';
import WishlistPage from '@/pages/WishlistPage';
import DebugPage from '@/pages/DebugPage';
import { TelegramAuthProvider } from '@/context/TelegramAuthContext';
import { EnhancedTelegramLayout } from '@/components/layout/EnhancedTelegramLayout';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TelegramAuthProvider>
        <BrowserRouter>
          <EnhancedTelegramLayout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/inventory" element={<InventoryPage />} />
              <Route path="/upload" element={<UploadPage />} />
              <Route path="/store" element={<StorePage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/insights" element={<InsightsPage />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/wishlist" element={<WishlistPage />} />
              <Route path="/debug" element={<DebugPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </EnhancedTelegramLayout>
        </BrowserRouter>
      </TelegramAuthProvider>
    </QueryClientProvider>
  );
}

export default App;
