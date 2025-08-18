import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { TelegramAuthProvider } from "./context/TelegramAuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { TutorialProvider } from "./contexts/TutorialContext";
import { SecureAuthGuard } from "./components/auth/SecureAuthGuard";
import { ErrorBoundary } from "./components/ErrorBoundary";
import Admin from "./pages/Admin";
import Dashboard from "./pages/Dashboard";
import InventoryPage from "./pages/InventoryPage";
import UploadPage from "./pages/UploadPage";
import UploadSingleStonePage from "./pages/UploadSingleStonePage";
import BulkUploadPage from "./pages/BulkUploadPage";
import StandardizeCsvPage from "./pages/StandardizeCsvPage";
import CatalogPage from "./pages/CatalogPage";
import InsightsPage from "./pages/InsightsPage";
import SettingsPage from "./pages/SettingsPage";
import NotificationsPage from "./pages/NotificationsPage";
import WishlistPage from "./pages/WishlistPage";
import ProfilePage from "./pages/ProfilePage";
import ChatPage from "./pages/ChatPage";
import DiamondSwipe from "./pages/DiamondSwipe";
import AdminAnalytics from "./pages/AdminAnalytics";
import HomePage from "./pages/HomePage";
import DiamondDetailPage from "./pages/DiamondDetailPage";
import SecureDiamondPage from "./pages/SecureDiamondPage";
import NotFound from "./pages/NotFound";
import Index from "./pages/Index";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 3,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <ThemeProvider>
          <TutorialProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <ErrorBoundary>
                  <SecureAuthGuard>
                    <TelegramAuthProvider>
                      <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/admin" element={<Admin />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/inventory" element={<InventoryPage />} />
                        <Route path="/upload" element={<UploadPage />} />
                        <Route path="/upload-single" element={<UploadSingleStonePage />} />
                        <Route path="/bulk-upload" element={<BulkUploadPage />} />
                        <Route path="/standardize-csv" element={<StandardizeCsvPage />} />
                        <Route path="/catalog" element={<CatalogPage />} />
                        <Route path="/insights" element={<InsightsPage />} />
                        <Route path="/settings" element={<SettingsPage />} />
                        <Route path="/notifications" element={<NotificationsPage />} />
                        <Route path="/wishlist" element={<WishlistPage />} />
                        <Route path="/profile" element={<ProfilePage />} />
                        <Route path="/chat" element={<ChatPage />} />
                        <Route path="/swipe" element={<DiamondSwipe />} />
                        <Route path="/analytics" element={<AdminAnalytics />} />
                        <Route path="/home" element={<HomePage />} />
                        <Route path="/diamond/:stockNumber" element={<DiamondDetailPage />} />
                        <Route path="/secure/:shareId" element={<SecureDiamondPage />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </TelegramAuthProvider>
                  </SecureAuthGuard>
                </ErrorBoundary>
              </BrowserRouter>
            </TooltipProvider>
          </TutorialProvider>
        </ThemeProvider>
      </HelmetProvider>
    </QueryClientProvider>
  );
}

export default App;
