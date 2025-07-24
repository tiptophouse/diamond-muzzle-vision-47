
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from "./components/ui/theme-provider"
import InventoryPage from './pages/InventoryPage';
import UploadSingleStone from './pages/UploadSingleStonePage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { TutorialProvider } from './contexts/TutorialContext';
import { TelegramAuthProvider } from './context/TelegramAuthContext';
import StorePage from './pages/StorePage';
import NotFound from './pages/NotFound';
import { AnalyticsDashboard } from './pages/AnalyticsDashboard';
import SecureSharePage from './pages/SecureDiamondPage';
import SecureStorePage from "./pages/SecureStorePage";

function App() {
  return (
    <QueryClientProvider client={new QueryClient()}>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <TelegramAuthProvider>
          <TutorialProvider>
            <Toaster />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<StorePage />} />
                <Route path="/inventory" element={<InventoryPage />} />
                <Route path="/upload-single-stone" element={<UploadSingleStone />} />
                <Route path="/analytics" element={<AnalyticsDashboard />} />
                <Route path="/secure-diamond/:encryptedData" element={<SecureSharePage />} />
                <Route path="/secure-store/:encryptedData" element={<SecureStorePage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TutorialProvider>
        </TelegramAuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
