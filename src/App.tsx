import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { ErrorBoundary } from 'react-error-boundary';
import HomePage from '@/pages/HomePage';
import DiamondDetailsPage from '@/pages/DiamondDetailsPage';
import NotFoundPage from '@/pages/NotFoundPage';
import AccountPage from '@/pages/AccountPage';
import DiamondEditPage from '@/pages/DiamondEditPage';
import DiamondCreatePage from '@/pages/DiamondCreatePage';
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
          <ErrorBoundary>
            <EnhancedTelegramLayout>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/diamonds/:stockNumber" element={<DiamondDetailsPage />} />
                <Route path="/account" element={<AccountPage />} />
                <Route path="/diamonds/:stockNumber/edit" element={<DiamondEditPage />} />
                <Route path="/diamonds/create" element={<DiamondCreatePage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </EnhancedTelegramLayout>
          </ErrorBoundary>
        </BrowserRouter>
      </TelegramAuthProvider>
    </QueryClientProvider>
  );
}

export default App;
