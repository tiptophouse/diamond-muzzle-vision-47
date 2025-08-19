
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TelegramAuthProvider } from '@/context/TelegramAuthContext';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { TelegramLayout } from '@/components/layout/TelegramLayout';
import { useSecureNavigation } from '@/hooks/useSecureNavigation';

// Pages
import Store from '@/pages/Store';
import Inventory from '@/pages/Inventory';
import DiamondDetail from '@/pages/DiamondDetail';
import UploadSingleStone from '@/pages/UploadSingleStone';
import Upload from '@/pages/Upload';
import StandardizeCSV from '@/pages/StandardizeCSV';
import Settings from '@/pages/Settings';
import Dashboard from '@/pages/Dashboard';
import Chat from '@/pages/Chat';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function AppContent() {
  // Initialize secure navigation for all routes
  useSecureNavigation();

  return (
    <TelegramLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/store" element={<Store />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/diamond/:id" element={<DiamondDetail />} />
        <Route path="/upload-single-stone" element={<UploadSingleStone />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/standardize-csv" element={<StandardizeCSV />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </TelegramLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TelegramAuthProvider>
        <AuthGuard>
          <Router>
            <AppContent />
            <Toaster />
          </Router>
        </AuthGuard>
      </TelegramAuthProvider>
    </QueryClientProvider>
  );
}

export default App;
