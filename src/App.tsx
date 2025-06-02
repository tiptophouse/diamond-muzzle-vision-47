
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
import { TelegramAuthProvider } from '@/context/TelegramAuthContext';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { AuthorizationGuard } from '@/components/auth/AuthorizationGuard';
import { AdminGuard } from '@/components/admin/AdminGuard';
import { ThemeProvider } from '@/contexts/ThemeContext';

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
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/inventory" element={<Inventory />} />
                  <Route path="/upload" element={<UploadPage />} />
                  <Route path="/chat" element={<ChatPage />} />
                  <Route path="/insights" element={<InsightsPage />} />
                  <Route path="/reports" element={<ReportsPage />} />
                  <Route path="/swipe" element={<DiamondSwipe />} />
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
        </TelegramAuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
