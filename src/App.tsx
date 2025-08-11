
import './App.css';
import { Toaster } from "@/components/ui/toaster";
import { TelegramAuthProvider } from "@/context/TelegramAuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthorizationGuard } from "@/components/auth/AuthorizationGuard";

// Page imports
import Index from "@/pages/Index";
import Dashboard from "@/pages/Dashboard";
import UploadPage from "@/pages/UploadPage";
import InventoryPage from "@/pages/InventoryPage";
import NotFound from "@/pages/NotFound";
import CatalogPage from "@/pages/CatalogPage";
import DiamondDetailPage from "@/pages/DiamondDetailPage";
import SecureDiamondPage from "@/pages/SecureDiamondPage";
import ChatPage from "@/pages/ChatPage";
import InsightsPage from "@/pages/InsightsPage";
import SettingsPage from "@/pages/SettingsPage";
import ProfilePage from "@/pages/ProfilePage";
import WishlistPage from "@/pages/WishlistPage";
import NotificationsPage from "@/pages/NotificationsPage";
import BulkUploadPage from "@/pages/BulkUploadPage";
import UploadSingleStonePage from "@/pages/UploadSingleStonePage";
import StandardizeCsvPage from "@/pages/StandardizeCsvPage";
import DiamondSwipe from "@/pages/DiamondSwipe";
import HomePage from "@/pages/HomePage";
import Admin from "@/pages/Admin";
import AdminLogin from "@/pages/AdminLogin";
import AdminAnalytics from "@/pages/AdminAnalytics";

// Admin Components
import { AdminGuard } from "@/components/admin/AdminGuard";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TelegramAuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/admin-login" element={<AdminLogin />} />

            {/* Protected Routes */}
            <Route path="/*" element={
              <AuthorizationGuard>
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/upload" element={<UploadPage />} />
                  <Route path="/upload-single" element={<UploadSingleStonePage />} />
                  <Route path="/bulk-upload" element={<BulkUploadPage />} />
                  <Route path="/standardize-csv" element={<StandardizeCsvPage />} />
                  <Route path="/inventory" element={<InventoryPage />} />
                  <Route path="/catalog" element={<CatalogPage />} />
                  <Route path="/diamond/:stockNumber" element={<DiamondDetailPage />} />
                  <Route path="/secure/:shareToken" element={<SecureDiamondPage />} />
                  <Route path="/chat" element={<ChatPage />} />
                  <Route path="/insights" element={<InsightsPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/wishlist" element={<WishlistPage />} />
                  <Route path="/notifications" element={<NotificationsPage />} />
                  <Route path="/swipe" element={<DiamondSwipe />} />
                  <Route path="/home" element={<HomePage />} />
                  
                  {/* Admin Routes with AdminGuard */}
                  <Route path="/admin" element={
                    <AdminGuard>
                      <Admin />
                    </AdminGuard>
                  } />
                  <Route path="/admin-analytics" element={
                    <AdminGuard>
                      <AdminAnalytics />
                    </AdminGuard>
                  } />
                  
                  {/* Fallback Routes */}
                  <Route path="/404" element={<NotFound />} />
                  <Route path="*" element={<Navigate to="/404" replace />} />
                </Routes>
              </AuthorizationGuard>
            } />
          </Routes>
          <Toaster />
        </BrowserRouter>
      </TelegramAuthProvider>
    </QueryClientProvider>
  );
}

export default App;
