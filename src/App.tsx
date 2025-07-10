
import {
  BrowserRouter as Router,
  Route,
  Routes,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/InventoryPage";
import StorePage from "./pages/StorePage";
import Settings from "./pages/SettingsPage";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import ChatPage from "./pages/ChatPage";
import UploadSingleStonePage from "./pages/UploadSingleStonePage";
import InsightsPage from "./pages/InsightsPage";
import NotificationsPage from "./pages/NotificationsPage";
import Index from "./pages/Index";
import { TelegramAuthProvider } from '@/context/TelegramAuthContext';
import { TutorialProvider } from '@/contexts/TutorialContext';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { AuthorizationGuard } from '@/components/auth/AuthorizationGuard';
import { AdminGuard } from '@/components/admin/AdminGuard';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { TelegramProvider } from '@/contexts/TelegramContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  console.log('🚀 App component rendering');
  
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TelegramProvider>
          <ThemeProvider>
            <TelegramAuthProvider>
              <TutorialProvider>
                <AuthGuard>
                  <AuthorizationGuard>
                    <Router>
                      <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/inventory" element={<Inventory />} />
                        <Route path="/store" element={<StorePage />} />
                        <Route path="/upload" element={<UploadSingleStonePage />} />
                        <Route path="/chat" element={<ChatPage />} />
                        <Route path="/insights" element={<InsightsPage />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/notifications" element={<NotificationsPage />} />
                        <Route path="/admin" element={
                          <AdminGuard>
                            <Admin />
                          </AdminGuard>
                        } />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Router>
                  </AuthorizationGuard>
                </AuthGuard>
              </TutorialProvider>
            </TelegramAuthProvider>
          </ThemeProvider>
        </TelegramProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
