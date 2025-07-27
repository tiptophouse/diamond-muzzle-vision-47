
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/components/theme-provider';
import { TelegramAuthProvider } from '@/context/TelegramAuthContext';
import { Toaster } from '@/components/ui/toaster';
import { TelegramLayout } from '@/components/layout/TelegramLayout';
import { ErrorBoundary } from 'react-error-boundary';
import { TutorialWizardManager } from '@/components/tutorial/TutorialWizardManager';
import InventoryPage from '@/pages/InventoryPage';
import StorePage from '@/pages/StorePage';
import UploadPage from '@/pages/UploadPage';
import ChatPage from '@/pages/ChatPage';
import InsightsPage from '@/pages/InsightsPage';
import SettingsPage from '@/pages/SettingsPage';
import LoginPage from '@/pages/LoginPage';
import SecureDiamondPage from '@/pages/SecureDiamondPage';
import UploadSingleStonePage from '@/pages/UploadSingleStonePage';

// Create QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

function ErrorFallback({error}: {error: Error}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-red-600 mb-2">Something went wrong</h2>
        <pre className="text-sm text-gray-600 bg-gray-100 p-3 rounded">{error.message}</pre>
      </div>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
          <TelegramAuthProvider>
            <Router>
              <TelegramLayout>
                <Routes>
                  <Route path="/" element={<InventoryPage />} />
                  <Route path="/inventory" element={<InventoryPage />} />
                  <Route path="/store" element={<StorePage />} />
                  <Route path="/upload" element={<UploadPage />} />
                  <Route path="/chat" element={<ChatPage />} />
                  <Route path="/insights" element={<InsightsPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/diamond/:stockNumber" element={<SecureDiamondPage />} />
                  <Route path="/upload/single" element={<UploadSingleStonePage />} />
                </Routes>
                <TutorialWizardManager />
              </TelegramLayout>
            </Router>
            <Toaster />
          </TelegramAuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
