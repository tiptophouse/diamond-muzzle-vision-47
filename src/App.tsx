import {
  BrowserRouter as Router,
  Route,
  Routes,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/InventoryPage";
import StorePage from "./pages/StorePage";
import DiamondDetailPage from "./pages/DiamondDetailPage";
import SecureDiamondPage from "./pages/SecureDiamondPage";
import Settings from "./pages/SettingsPage";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import ChatPage from "./pages/ChatPage";
import UploadSingleStonePage from "./pages/UploadSingleStonePage";
import StandardizeCsvPage from "./pages/StandardizeCsvPage";
import InsightsPage from "./pages/InsightsPage";
import NotificationsPage from "./pages/NotificationsPage";
import Index from "./pages/Index";
import EngagementDashboard from '@/components/engagement/EngagementDashboard';
import SmartNotificationSystem from '@/components/engagement/SmartNotificationSystem';
import DeepLinkReports from '@/components/engagement/DeepLinkReports';
import { ProfitOptimizerDashboard } from '@/components/dashboard/ProfitOptimizerDashboard';
import { TelegramAuthProvider } from '@/context/TelegramAuthContext';
import { SimpleTutorialProvider } from '@/contexts/SimpleTutorialContext';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { AuthorizationGuard } from '@/components/auth/AuthorizationGuard';
import { AdminGuard } from '@/components/admin/AdminGuard';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { TelegramLayout } from '@/components/layout/TelegramLayout';
import { useUserEngagementMonitor } from '@/hooks/useUserEngagementMonitor';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function EngagementMonitor() {
  useUserEngagementMonitor();
  return null;
}

function App() {
  console.log('🚀 App component rendering');

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <TelegramAuthProvider>
            <SimpleTutorialProvider>
                <AuthGuard>
                <AuthorizationGuard>
                  <EngagementMonitor />
                  <Router>
                    <TelegramLayout>
                      <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/inventory" element={<Inventory />} />
                        <Route path="/store" element={<StorePage />} />
          <Route path="/diamond/:stockNumber" element={<DiamondDetailPage />} />
          <Route path="/secure-diamond/:stockNumber" element={<SecureDiamondPage />} />
                        <Route path="/upload" element={<UploadSingleStonePage />} />
                        <Route path="/upload-single-stone" element={<UploadSingleStonePage />} />
                        <Route path="/standardize-csv" element={<StandardizeCsvPage />} />
                        <Route path="/chat" element={<ChatPage />} />
                        <Route path="/insights" element={<InsightsPage />} />
                         <Route path="/settings" element={<Settings />} />
                         <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/engagement" element={<EngagementDashboard />} />
        <Route path="/engagement/notifications" element={<SmartNotificationSystem />} />
        <Route path="/engagement/reports" element={<DeepLinkReports />} />
        <Route path="/profit-optimizer" element={<ProfitOptimizerDashboard />} />
                        <Route path="/admin" element={
                          <AdminGuard>
                            <Admin />
                          </AdminGuard>
                        } />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </TelegramLayout>
                  </Router>
                </AuthorizationGuard>
              </AuthGuard>
            </SimpleTutorialProvider>
          </TelegramAuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
