
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
import InventoryPage from '@/pages/InventoryPage';
import SFTPSettingsPage from '@/pages/SFTPSettingsPage';
import InsightsPage from '@/pages/InsightsPage';
import { StrictMode } from 'react';

const queryClient = new QueryClient();

function App() {
  return (
    <StrictMode>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <TelegramAuthProvider>
              <TutorialProvider>
                <Router>
                  <Routes>
                    <Route path="/" element={<AuthGuard><HomePage /></AuthGuard>} />
                    <Route path="/settings" element={<AuthGuard><SettingsPage /></AuthGuard>} />
                    <Route path="/inventory" element={<AuthGuard><InventoryPage /></AuthGuard>} />
                    <Route path="/sftp-settings" element={<AuthGuard><SFTPSettingsPage /></AuthGuard>} />
                    <Route path="/insights" element={<AuthGuard><InsightsPage /></AuthGuard>} />
                  </Routes>
                </Router>
                <Toaster />
              </TutorialProvider>
            </TelegramAuthProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </StrictMode>
  );
}

export default App;
