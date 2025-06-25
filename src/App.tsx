import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { TelegramAuthProvider } from './context/TelegramAuthContext';
import { Toaster } from "@/components/ui/toaster"
import { QueryClient } from './context/QueryClient';
import { ErrorBoundary } from './components/ErrorBoundary';
import Dashboard from './pages/Dashboard';
import InventoryPage from './pages/InventoryPage';
import SettingsPage from './pages/SettingsPage';
import UploadPage from './pages/UploadPage';
import AdminPanel from './pages/AdminPanel';
import TutorialProvider from './context/TutorialContext';
import { OpenAccessProvider } from '@/context/OpenAccessContext';

function App() {
  return (
    <BrowserRouter>
      <TelegramAuthProvider>
        <OpenAccessProvider>
          <ThemeProvider>
            <TutorialProvider>
              <ErrorBoundary>
                <QueryClient>
                  <Toaster />
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/inventory" element={<InventoryPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/upload" element={<UploadPage />} />
                    <Route path="/admin" element={<AdminPanel />} />
                  </Routes>
                </QueryClient>
              </ErrorBoundary>
            </TutorialProvider>
          </ThemeProvider>
        </OpenAccessProvider>
      </TelegramAuthProvider>
    </BrowserRouter>
  );
}

export default App;
