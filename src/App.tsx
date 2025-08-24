
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import HomePage from '@/pages/HomePage';
import NotFound from '@/pages/NotFound';
import ProfilePage from '@/pages/ProfilePage';
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
              <Route path="*" element={<NotFound />} />
            </Routes>
          </EnhancedTelegramLayout>
        </BrowserRouter>
      </TelegramAuthProvider>
    </QueryClientProvider>
  );
}

export default App;
