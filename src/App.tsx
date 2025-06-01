
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { TelegramAuthProvider } from "@/context/TelegramAuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Dashboard from "./pages/Dashboard";
import InventoryPage from "./pages/InventoryPage";
import UploadPage from "./pages/UploadPage";
import SettingsPage from "./pages/SettingsPage";
import InsightsPage from "./pages/InsightsPage";
import ReportsPage from "./pages/ReportsPage";
import ChatPage from "./pages/ChatPage";
import NotificationsPage from "./pages/NotificationsPage";
import ProfilePage from "./pages/ProfilePage";
import NotFound from "./pages/NotFound";
import DiamondSwipe from "./pages/DiamondSwipe";
import AdminAnalytics from "./pages/AdminAnalytics";

// Optimized React Query client for production stability
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // Reduced from 3 for production stability
      retryDelay: (attemptIndex) => Math.min(1000 * Math.pow(2, attemptIndex), 3000), // Max 3 seconds
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
      refetchOnWindowFocus: false, // Prevent unnecessary refetches in Telegram
      refetchOnReconnect: true,
      networkMode: 'offlineFirst', // Better for unstable Telegram connections
    },
    mutations: {
      retry: 1, // Reduced retries for mutations
      retryDelay: 1000,
      networkMode: 'offlineFirst',
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TelegramAuthProvider>
        <ThemeProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <HashRouter>
              <AuthGuard>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/inventory" element={<InventoryPage />} />
                  <Route path="/upload" element={<UploadPage />} />
                  <Route path="/reports" element={<ReportsPage />} />
                  <Route path="/reports/:reportId" element={<ReportsPage />} />
                  <Route path="/:reportId" element={<ReportsPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/insights" element={<InsightsPage />} />
                  <Route path="/chat" element={<ChatPage />} />
                  <Route path="/swipe" element={<DiamondSwipe />} />
                  <Route path="/notifications" element={<NotificationsPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/admin" element={<AdminAnalytics />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </AuthGuard>
            </HashRouter>
          </TooltipProvider>
        </ThemeProvider>
      </TelegramAuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
