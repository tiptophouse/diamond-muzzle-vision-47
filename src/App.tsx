
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { TelegramAuthProvider } from "@/context/TelegramAuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppErrorFallback } from "@/components/AppErrorFallback";
import { Suspense, lazy } from "react";

// Lazy load pages to reduce initial bundle size
const Dashboard = lazy(() => import("./pages/Dashboard"));
const InventoryPage = lazy(() => import("./pages/InventoryPage"));
const UploadPage = lazy(() => import("./pages/UploadPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const InsightsPage = lazy(() => import("./pages/InsightsPage"));
const ReportsPage = lazy(() => import("./pages/ReportsPage"));
const ChatPage = lazy(() => import("./pages/ChatPage"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const DiamondSwipe = lazy(() => import("./pages/DiamondSwipe"));
const AdminAnalytics = lazy(() => import("./pages/AdminAnalytics"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Optimized query client for faster startup
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false, // No retries for faster startup
      staleTime: 0,
      gcTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
    <div className="text-center p-8">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
      <h3 className="text-lg font-semibold text-blue-700">Loading...</h3>
    </div>
  </div>
);

const App = () => {
  return (
    <ErrorBoundary fallback={AppErrorFallback}>
      <QueryClientProvider client={queryClient}>
        <TelegramAuthProvider>
          <ThemeProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <HashRouter>
                <AuthGuard fallback={<AppErrorFallback />}>
                  <Suspense fallback={<PageLoader />}>
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
                  </Suspense>
                </AuthGuard>
              </HashRouter>
            </TooltipProvider>
          </ThemeProvider>
        </TelegramAuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
