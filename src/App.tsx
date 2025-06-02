
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { TelegramAuthProvider } from "@/context/TelegramAuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Index from "./pages/Index";
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

// Check if we're in Telegram environment
const isTelegramEnv = typeof window !== 'undefined' && !!window.Telegram?.WebApp;

// Optimized React Query client for Telegram environment
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: isTelegramEnv ? 0 : 1, // No retries in Telegram to prevent loops
      retryDelay: 2000,
      staleTime: isTelegramEnv ? 10 * 60 * 1000 : 5 * 60 * 1000, // Longer stale time in Telegram
      gcTime: 15 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: isTelegramEnv ? false : true, // Disable reconnect refetch in Telegram
      networkMode: 'online', // Changed from 'offlineFirst' to prevent issues
    },
    mutations: {
      retry: 0, // No retries for mutations to prevent conflicts
      retryDelay: 2000,
      networkMode: 'online',
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
                  <Route path="/" element={<Index />} />
                  <Route path="/dashboard" element={<Dashboard />} />
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
