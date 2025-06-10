
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TelegramAuthProvider } from "@/context/TelegramAuthContext";
import { AuthProvider } from "@/providers/AuthProvider";
import { AuthorizationGuard } from "@/components/auth/AuthorizationGuard";
import { AdminRoute } from "@/components/routing/AdminRoute";
import { Layout } from "@/components/layout/Layout";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Import pages
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import InventoryPage from "./pages/InventoryPage";
import UploadPage from "./pages/UploadPage";
import ChatPage from "./pages/ChatPage";
import InsightsPage from "./pages/InsightsPage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";
import NotificationsPage from "./pages/NotificationsPage";
import Admin from "./pages/Admin";
import StorePage from "./pages/StorePage";
import AdvertisementPage from "./pages/AdvertisementPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <TelegramAuthProvider>
              <Routes>
                {/* Public advertisement page - no auth required */}
                <Route path="/advertisement" element={<AdvertisementPage />} />
                <Route path="/ad" element={<AdvertisementPage />} />
                
                {/* Protected routes */}
                <Route path="/*" element={
                  <AuthProvider>
                    <AuthorizationGuard>
                      <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/dashboard" element={
                          <Layout>
                            <Dashboard />
                          </Layout>
                        } />
                        <Route path="/inventory" element={
                          <Layout>
                            <InventoryPage />
                          </Layout>
                        } />
                        <Route path="/store" element={
                          <Layout>
                            <StorePage />
                          </Layout>
                        } />
                        <Route path="/upload" element={
                          <Layout>
                            <UploadPage />
                          </Layout>
                        } />
                        <Route path="/chat" element={
                          <Layout>
                            <ChatPage />
                          </Layout>
                        } />
                        <Route path="/insights" element={
                          <Layout>
                            <InsightsPage />
                          </Layout>
                        } />
                        <Route path="/reports" element={
                          <Layout>
                            <ReportsPage />
                          </Layout>
                        } />
                        <Route path="/settings" element={
                          <Layout>
                            <SettingsPage />
                          </Layout>
                        } />
                        <Route path="/notifications" element={
                          <Layout>
                            <NotificationsPage />
                          </Layout>
                        } />
                        <Route path="/admin" element={
                          <AdminRoute>
                            <Admin />
                          </AdminRoute>
                        } />
                      </Routes>
                    </AuthorizationGuard>
                  </AuthProvider>
                } />
              </Routes>
            </TelegramAuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
