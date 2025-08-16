import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { TelegramAuthProvider } from "@/context/TelegramAuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { TutorialProvider } from "@/contexts/TutorialContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Lazy load components
const Index = lazy(() => import("@/pages/Index"));
const HomePage = lazy(() => import("@/pages/HomePage"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const InventoryPage = lazy(() => import("@/pages/InventoryPage"));
const UploadPage = lazy(() => import("@/pages/UploadPage"));
const UploadSingleStonePage = lazy(() => import("@/pages/UploadSingleStonePage"));
const BulkUploadPage = lazy(() => import("@/pages/BulkUploadPage"));
const CatalogPage = lazy(() => import("@/pages/CatalogPage"));
const DiamondDetailPage = lazy(() => import("@/pages/DiamondDetailPage"));
const SecureDiamondPage = lazy(() => import("@/pages/SecureDiamondPage"));
const WishlistPage = lazy(() => import("@/pages/WishlistPage"));
const ProfilePage = lazy(() => import("@/pages/ProfilePage"));
const NotificationsPage = lazy(() => import("@/pages/NotificationsPage"));
const SettingsPage = lazy(() => import("@/pages/SettingsPage"));
const SFTPSettingsPage = lazy(() => import("@/pages/SFTPSettingsPage"));
const InsightsPage = lazy(() => import("@/pages/InsightsPage"));
const ChatPage = lazy(() => import("@/pages/ChatPage"));
const DiamondSwipe = lazy(() => import("@/pages/DiamondSwipe"));
const StandardizeCsvPage = lazy(() => import("@/pages/StandardizeCsvPage"));
const Admin = lazy(() => import("@/pages/Admin"));
const AdminAnalytics = lazy(() => import("@/pages/AdminAnalytics"));
const NotFound = lazy(() => import("@/pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <ThemeProvider>
            <TelegramAuthProvider>
              <TutorialProvider>
                <BrowserRouter>
                  <div className="min-h-screen bg-background font-sans antialiased">
                    <Suspense fallback={<div>Loading...</div>}>
                      <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/home" element={<HomePage />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/inventory" element={<InventoryPage />} />
                        <Route path="/upload" element={<UploadPage />} />
                        <Route path="/upload/single" element={<UploadSingleStonePage />} />
                        <Route path="/upload/bulk" element={<BulkUploadPage />} />
                        <Route path="/catalog" element={<CatalogPage />} />
                        <Route path="/diamond/:stockNumber" element={<DiamondDetailPage />} />
                        <Route path="/secure/:shareId" element={<SecureDiamondPage />} />
                        <Route path="/wishlist" element={<WishlistPage />} />
                        <Route path="/profile" element={<ProfilePage />} />
                        <Route path="/notifications" element={<NotificationsPage />} />
                        <Route path="/settings" element={<SettingsPage />} />
                        <Route path="/settings/sftp" element={<SFTPSettingsPage />} />
                        <Route path="/insights" element={<InsightsPage />} />
                        <Route path="/chat" element={<ChatPage />} />
                        <Route path="/swipe" element={<DiamondSwipe />} />
                        <Route path="/standardize-csv" element={<StandardizeCsvPage />} />
                        <Route path="/admin" element={<Admin />} />
                        <Route path="/admin/analytics" element={<AdminAnalytics />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Suspense>
                  </div>
                  <Toaster />
                </BrowserRouter>
              </TutorialProvider>
            </TelegramAuthProvider>
          </ThemeProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
