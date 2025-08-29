
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TelegramAuthProvider } from '@/context/TelegramAuthContext';
import { TelegramMiniAppLayout } from '@/components/layout/TelegramMiniAppLayout';
import { TelegramOnlyGuard } from '@/components/auth/TelegramOnlyGuard';
import { DashboardPage } from '@/pages/DashboardPage';
import { UploadPage } from '@/pages/UploadPage';
import { StorePage } from '@/pages/StorePage';
import { ClientsPage } from '@/pages/ClientsPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { AdminPage } from '@/pages/AdminPage';
import { UserLookupPage } from '@/pages/UserLookupPage';
import { InventoryPage } from '@/pages/InventoryPage';
import { DiamondDetailPage } from '@/pages/DiamondDetailPage';
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
    <QueryClientProvider client={queryClient}>
      <TelegramAuthProvider>
        <TelegramOnlyGuard>
          <Router>
            <TelegramMiniAppLayout>
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/upload" element={<UploadPage />} />
                <Route path="/store" element={<StorePage />} />
                <Route path="/clients" element={<ClientsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/admin/users" element={<UserLookupPage />} />
                <Route path="/inventory" element={<InventoryPage />} />
                <Route path="/inventory/:id" element={<DiamondDetailPage />} />
              </Routes>
            </TelegramMiniAppLayout>
          </Router>
        </TelegramOnlyGuard>
        <Toaster />
      </TelegramAuthProvider>
    </QueryClientProvider>
  );
}

export default App;
