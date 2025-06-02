
import {
  BrowserRouter as Router,
  Route,
  Routes,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/InventoryPage";
import Settings from "./pages/SettingsPage";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import ChatPage from "./pages/ChatPage";
import UploadPage from "./pages/UploadPage";
import InsightsPage from "./pages/InsightsPage";
import ReportsPage from "./pages/ReportsPage";
import DiamondSwipe from "./pages/DiamondSwipe";
import NotificationsPage from "./pages/NotificationsPage";
import Index from "./pages/Index";
import { TelegramAuthProvider } from '@/context/TelegramAuthContext';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { AuthorizationGuard } from '@/components/auth/AuthorizationGuard';
import { AdminGuard } from '@/components/admin/AdminGuard';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { Layout } from '@/components/layout/Layout';

const queryClient = new QueryClient();

function App() {
  console.log('🚀 App component rendering');
  
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TelegramAuthProvider>
          <AuthGuard>
            <AuthorizationGuard>
              <Router>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
                  <Route path="/inventory" element={<Layout><Inventory /></Layout>} />
                  <Route path="/upload" element={<Layout><UploadPage /></Layout>} />
                  <Route path="/chat" element={<Layout><ChatPage /></Layout>} />
                  <Route path="/insights" element={<Layout><InsightsPage /></Layout>} />
                  <Route path="/reports" element={<Layout><ReportsPage /></Layout>} />
                  <Route path="/swipe" element={<Layout><DiamondSwipe /></Layout>} />
                  <Route path="/settings" element={<Layout><Settings /></Layout>} />
                  <Route path="/notifications" element={<Layout><NotificationsPage /></Layout>} />
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
        </TelegramAuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
