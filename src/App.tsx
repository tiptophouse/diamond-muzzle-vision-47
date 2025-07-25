
import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { TelegramAuthProvider } from "@/context/TelegramAuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { TutorialProvider } from "@/contexts/TutorialContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { TelegramOnlyGuard } from "@/components/auth/TelegramOnlyGuard";
import { AuthorizationGuard } from "@/components/auth/AuthorizationGuard";
import { TelegramLayout } from "@/components/layout/TelegramLayout";
import "./App.css";

// Lazy load components
const Index = lazy(() => import("./pages/Index"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const InventoryPage = lazy(() => import("./pages/InventoryPage"));
const StorePage = lazy(() => import("./pages/StorePage"));
const WishlistPage = lazy(() => import("./pages/WishlistPage"));
const UploadPage = lazy(() => import("./pages/UploadPage"));
const UploadSingleStonePage = lazy(() => import("./pages/UploadSingleStonePage"));
const BulkUploadPage = lazy(() => import("./pages/BulkUploadPage"));
const StandardizeCsvPage = lazy(() => import("./pages/StandardizeCsvPage"));
const ChatPage = lazy(() => import("./pages/ChatPage"));
const InsightsPage = lazy(() => import("./pages/InsightsPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));
const Admin = lazy(() => import("./pages/Admin"));
const AdminAnalytics = lazy(() => import("./pages/AdminAnalytics"));
const SecureDiamondPage = lazy(() => import("./pages/SecureDiamondPage"));
const DiamondDetailPage = lazy(() => import("./pages/DiamondDetailPage"));
const DiamondSwipe = lazy(() => import("./pages/DiamondSwipe"));
const NotFound = lazy(() => import("./pages/NotFound"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <ThemeProvider>
          <QueryClientProvider client={queryClient}>
            <TooltipProvider>
              <TelegramAuthProvider>
                <TutorialProvider>
                  <BrowserRouter>
                    <TelegramOnlyGuard>
                      <AuthorizationGuard>
                        <TelegramLayout>
                          <Suspense fallback={<div>Loading...</div>}>
                            <Routes>
                              <Route path="/" element={<Index />} />
                              <Route path="/dashboard" element={<Dashboard />} />
                              <Route path="/inventory" element={<InventoryPage />} />
                              <Route path="/store" element={<StorePage />} />
                              <Route path="/wishlist" element={<WishlistPage />} />
                              <Route path="/upload" element={<UploadPage />} />
                              <Route path="/upload-single-stone" element={<UploadSingleStonePage />} />
                              <Route path="/bulk-upload" element={<BulkUploadPage />} />
                              <Route path="/standardize-csv" element={<StandardizeCsvPage />} />
                              <Route path="/chat" element={<ChatPage />} />
                              <Route path="/insights" element={<InsightsPage />} />
                              <Route path="/settings" element={<SettingsPage />} />
                              <Route path="/notifications" element={<NotificationsPage />} />
                              <Route path="/admin" element={<Admin />} />
                              <Route path="/admin-analytics" element={<AdminAnalytics />} />
                              <Route path="/secure-diamond/:shareId" element={<SecureDiamondPage />} />
                              <Route path="/diamond/:stockNumber" element={<DiamondDetailPage />} />
                              <Route path="/diamond-swipe" element={<DiamondSwipe />} />
                              <Route path="/profile" element={<ProfilePage />} />
                              <Route path="*" element={<NotFound />} />
                            </Routes>
                          </Suspense>
                        </TelegramLayout>
                      </AuthorizationGuard>
                    </TelegramOnlyGuard>
                  </BrowserRouter>
                </TutorialProvider>
              </TelegramAuthProvider>
              <Toaster />
              <Sonner />
            </TooltipProvider>
          </QueryClientProvider>
        </ThemeProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;
