
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
import SecureSharePage from './pages/SecureDiamondPage';
import SecureStorePage from "./pages/SecureStorePage";

function App() {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <TelegramAuthProvider>
          <TutorialProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<StorePage />} />
                <Route path="/inventory" element={<InventoryPage />} />
                <Route path="/upload-single-stone" element={<UploadSingleStone />} />
                <Route path="/secure-diamond/:encryptedData" element={<SecureSharePage />} />
                <Route path="/secure-store/:encryptedData" element={<SecureStorePage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
            <Toaster />
          </TutorialProvider>
        </TelegramAuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
