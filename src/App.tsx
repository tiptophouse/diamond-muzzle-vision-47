import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TelegramAuthProvider } from '@/context/TelegramAuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { TutorialProvider } from '@/contexts/TutorialContext';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import HomePage from '@/pages/HomePage';
import SettingsPage from '@/pages/SettingsPage';
import PaymentsPage from '@/pages/PaymentsPage';
import AdminPage from '@/pages/AdminPage';
import InventoryPage from '@/pages/InventoryPage';
import SFTPSettingsPage from '@/pages/SFTPSettingsPage';
import ReportPage from '@/pages/ReportPage';
import MockDiamondsPage from '@/pages/MockDiamondsPage';
import { StrictMode } from 'react';

const queryClient = new QueryClient();

function App() {
  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="system" storageKey="vite-react-theme">
          <TelegramAuthProvider>
            <Router>
              <Routes>
                <Route path="/" element={<AuthGuard><HomePage /></AuthGuard>} />
                <Route path="/settings" element={<AuthGuard><SettingsPage /></AuthGuard>} />
                <Route path="/payments" element={<AuthGuard><PaymentsPage /></AuthGuard>} />
                <Route path="/admin" element={<AuthGuard><AdminPage /></AuthGuard>} />
                <Route path="/inventory" element={<AuthGuard><InventoryPage /></AuthGuard>} />
                <Route path="/sftp-settings" element={<AuthGuard><SFTPSettingsPage /></AuthGuard>} />
                <Route path="/report/:diamondId" element={<AuthGuard><ReportPage /></AuthGuard>} />
                <Route path="/mock-diamonds" element={<AuthGuard><MockDiamondsPage /></AuthGuard>} />
              </Routes>
            </Router>
            <Toaster />
          </TelegramAuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </StrictMode>
  );
}

export default App;
