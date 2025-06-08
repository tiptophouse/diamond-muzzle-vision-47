
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TelegramAuthProvider } from "@/context/TelegramAuthContext";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Index from "@/pages/Index";
import Dashboard from "@/pages/Dashboard";
import InventoryPage from "@/pages/InventoryPage";
import LuxuryStorePage from "@/pages/LuxuryStorePage";
import UploadPage from "@/pages/UploadPage";
import UploadSingleStonePage from "@/pages/UploadSingleStonePage";
import ChatPage from "@/pages/ChatPage";
import InsightsPage from "@/pages/InsightsPage";
import SettingsPage from "@/pages/SettingsPage";
import ProfilePage from "@/pages/ProfilePage";
import NotificationsPage from "@/pages/NotificationsPage";
import ReportsPage from "@/pages/ReportsPage";
import NotFound from "@/pages/NotFound";
import Admin from "@/pages/Admin";
import AdminAnalytics from "@/pages/AdminAnalytics";
import DiamondSwipe from "@/pages/DiamondSwipe";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TelegramAuthProvider>
          <Router>
            <div className="App">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/inventory" element={<InventoryPage />} />
                <Route path="/store" element={<LuxuryStorePage />} />
                <Route path="/upload" element={<UploadPage />} />
                <Route path="/upload-single" element={<UploadSingleStonePage />} />
                <Route path="/chat" element={<ChatPage />} />
                <Route path="/insights" element={<InsightsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/admin/analytics" element={<AdminAnalytics />} />
                <Route path="/swipe" element={<DiamondSwipe />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster />
            </div>
          </Router>
        </TelegramAuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
