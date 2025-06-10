
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
import UploadPage from "./pages/UploadPage";
import UploadSingleStonePage from "./pages/UploadSingleStonePage";
import InsightsPage from "./pages/InsightsPage";
import ReportsPage from "./pages/ReportsPage";
import NotificationsPage from "./pages/NotificationsPage";
import Index from "./pages/Index";
import { TelegramAuthProvider } from '@/context/TelegramAuthContext';
import { AuthProvider } from '@/providers/AuthProvider';
import { AdminRoute } from '@/components/routing/AdminRoute';
import { Layout } from '@/components/layout/Layout';
import { ThemeProvider } from '@/contexts/ThemeContext';

const queryClient = new QueryClient();

function App() {
  console.log('🚀 App component rendering');
  
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TelegramAuthProvider>
          <AuthProvider>
            <Router>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/*" element={
                  <Layout>
                    <Routes>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/inventory" element={<Inventory />} />
                      <Route path="/store" element={<StorePage />} />
                      <Route path="/upload" element={<UploadPage />} />
                      <Route path="/upload-single" element={<UploadSingleStonePage />} />
                      <Route path="/chat" element={<ChatPage />} />
                      <Route path="/insights" element={<InsightsPage />} />
                      <Route path="/reports" element={<ReportsPage />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/notifications" element={<NotificationsPage />} />
                      <Route path="/admin" element={
                        <AdminRoute>
                          <Admin />
                        </AdminRoute>
                      } />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Layout>
                } />
              </Routes>
            </Router>
          </AuthProvider>
        </TelegramAuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
