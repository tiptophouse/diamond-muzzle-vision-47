
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';

// Contexts
import { TelegramAuthProvider } from "@/context/TelegramAuthContext";
import { InteractiveWizardProvider } from "@/contexts/InteractiveWizardContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

// Components
import { TelegramLayout } from "@/components/layout/TelegramLayout";
import { GamifiedWizardOverlay } from "@/components/wizard/GamifiedWizardOverlay";
import ErrorBoundary from "@/components/ErrorBoundary";

// Pages
import Index from "@/pages/Index";
import Dashboard from "@/pages/Dashboard";
import InventoryPage from "@/pages/InventoryPage";
import StorePage from "@/pages/StorePage";
import UploadPage from "@/pages/UploadPage";
import UploadSingleStonePage from "@/pages/UploadSingleStonePage";
import BulkUploadPage from "@/pages/BulkUploadPage";
import StandardizeCsvPage from "@/pages/StandardizeCsvPage";
import ChatPage from "@/pages/ChatPage";
import SettingsPage from "@/pages/SettingsPage";
import InsightsPage from "@/pages/InsightsPage";
import WishlistPage from "@/pages/WishlistPage";
import NotificationsPage from "@/pages/NotificationsPage";
import ProfilePage from "@/pages/ProfilePage";
import SecureDiamondPage from "@/pages/SecureDiamondPage";
import DiamondDetailPage from "@/pages/DiamondDetailPage";
import DiamondSwipe from "@/pages/DiamondSwipe";
import Admin from "@/pages/Admin";
import AdminAnalytics from "@/pages/AdminAnalytics";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TelegramAuthProvider>
          <InteractiveWizardProvider>
            <ThemeProvider defaultTheme="light" storageKey="app-theme">
              <TooltipProvider>
                <BrowserRouter>
                  <div className="min-h-screen bg-background font-sans antialiased">
                    <ErrorBoundary>
                      <TelegramLayout>
                        <Routes>
                          <Route path="/" element={<Index />} />
                          <Route path="/dashboard" element={<Dashboard />} />
                          <Route path="/inventory" element={<InventoryPage />} />
                          <Route path="/store" element={<StorePage />} />
                          <Route path="/upload" element={<UploadPage />} />
                          <Route path="/upload-single-stone" element={<UploadSingleStonePage />} />
                          <Route path="/bulk-upload" element={<BulkUploadPage />} />
                          <Route path="/standardize-csv" element={<StandardizeCsvPage />} />
                          <Route path="/chat" element={<ChatPage />} />
                          <Route path="/settings" element={<SettingsPage />} />
                          <Route path="/insights" element={<InsightsPage />} />
                          <Route path="/wishlist" element={<WishlistPage />} />
                          <Route path="/notifications" element={<NotificationsPage />} />
                          <Route path="/profile" element={<ProfilePage />} />
                          <Route path="/secure-diamond/:stockNumber" element={<SecureDiamondPage />} />
                          <Route path="/diamond/:stockNumber" element={<DiamondDetailPage />} />
                          <Route path="/swipe" element={<DiamondSwipe />} />
                          <Route path="/admin" element={<Admin />} />
                          <Route path="/admin/analytics" element={<AdminAnalytics />} />
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                        
                        {/* Gamified Wizard Overlay */}
                        <GamifiedWizardOverlay />
                      </TelegramLayout>
                    </ErrorBoundary>
                  </div>
                  <Toaster />
                </BrowserRouter>
              </TooltipProvider>
            </ThemeProvider>
          </InteractiveWizardProvider>
        </TelegramAuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
