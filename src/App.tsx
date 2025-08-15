
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { telegramSDK } from "@/lib/telegramSDK";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import InventoryPage from "./pages/InventoryPage";
import UploadPage from "./pages/UploadPage";
import UploadSingleStonePage from "./pages/UploadSingleStonePage";
import BulkUploadPage from "./pages/BulkUploadPage";
import StandardizeCsvPage from "./pages/StandardizeCsvPage";
import CatalogPage from "./pages/CatalogPage";
import NotificationsPage from "./pages/NotificationsPage";
import SettingsPage from "./pages/SettingsPage";
import AdminAnalytics from "./pages/AdminAnalytics";
import Admin from "./pages/Admin";
import ProfilePage from "./pages/ProfilePage";
import WishlistPage from "./pages/WishlistPage";
import InsightsPage from "./pages/InsightsPage";
import DiamondDetailPage from "./pages/DiamondDetailPage";
import SecureDiamondPage from "./pages/SecureDiamondPage";
import ChatPage from "./pages/ChatPage";
import DiamondSwipe from "./pages/DiamondSwipe";
import InvestmentPage from "./pages/InvestmentPage";
import NotFound from "./pages/NotFound";
import { TelegramAuthProvider } from "./context/TelegramAuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { TutorialProvider } from "./contexts/TutorialContext";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TelegramAuthProvider>
          <TutorialProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/inventory" element={<InventoryPage />} />
                  <Route path="/upload" element={<UploadPage />} />
                  <Route path="/upload-single" element={<UploadSingleStonePage />} />
                  <Route path="/bulk-upload" element={<BulkUploadPage />} />
                  <Route path="/standardize-csv" element={<StandardizeCsvPage />} />
                  <Route path="/catalog" element={<CatalogPage />} />
                  <Route path="/notifications" element={<NotificationsPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/admin-analytics" element={<AdminAnalytics />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/wishlist" element={<WishlistPage />} />
                  <Route path="/insights" element={<InsightsPage />} />
                  <Route path="/diamond/:stockNumber" element={<DiamondDetailPage />} />
                  <Route path="/secure-diamond/:stockNumber" element={<SecureDiamondPage />} />
                  <Route path="/chat" element={<ChatPage />} />
                  <Route path="/swipe" element={<DiamondSwipe />} />
                  <Route path="/investment" element={<InvestmentPage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </TutorialProvider>
        </TelegramAuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
