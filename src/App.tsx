
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { TelegramAuthProvider } from './context/TelegramAuthContext';
import { Toaster } from "@/components/ui/toaster"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from './components/ErrorBoundary';
import Dashboard from './pages/Dashboard';
import InventoryPage from './pages/InventoryPage';
import SettingsPage from './pages/SettingsPage';
import UploadPage from './pages/UploadPage';
import AdminPanel from './pages/Admin';
import TutorialProvider from './contexts/TutorialContext';
import { OpenAccessProvider } from '@/context/OpenAccessContext';

const queryClient = new QueryClient();

function App() {
  return (
    <BrowserRouter>
      <TelegramAuthProvider>
        <OpenAccessProvider>
          <ThemeProvider>
            <TutorialProvider>
              <ErrorBoundary>
                <QueryClientProvider client={queryClient}>
                  <Toaster />
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/inventory" element={<InventoryPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/upload" element={<UploadPage />} />
                    <Route path="/admin" element={<AdminPanel />} />
                  </Routes>
                </QueryClientProvider>
              </ErrorBoundary>
            </TutorialProvider>
          </ThemeProvider>
        </OpenAccessProvider>
      </TelegramAuthProvider>
    </BrowserRouter>
  );
}

export default App;
