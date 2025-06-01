
import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
} from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from "@/components/theme-provider"
import { TelegramAuthProvider } from '@/context/TelegramAuthContext';
import InventoryPage from '@/pages/InventoryPage';
import SettingsPage from '@/pages/SettingsPage';
import ChatPage from '@/pages/ChatPage';
import { Layout } from '@/components/layout/Layout';
import { ErrorBoundary } from 'react-error-boundary';
import ErrorFallback from '@/components/ErrorFallback';
import { TrackingProvider } from '@/context/TrackingContext';
import AnalyticsPage from '@/pages/AnalyticsPage';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TelegramAuthProvider>
        <TrackingProvider>
          <BrowserRouter>
            <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
              <ErrorBoundary FallbackComponent={ErrorFallback}>
                <Layout>
                  <Routes>
                    <Route path="/" element={<InventoryPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/chat" element={<ChatPage />} />
                    <Route path="/analytics" element={<AnalyticsPage />} />
                  </Routes>
                </Layout>
              </ErrorBoundary>
            </ThemeProvider>
          </BrowserRouter>
        </TrackingProvider>
      </TelegramAuthProvider>
    </QueryClientProvider>
  );
}

export default App;
