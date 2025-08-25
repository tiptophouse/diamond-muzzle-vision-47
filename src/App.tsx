
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { TelegramAuthGuard } from "@/components/auth/TelegramAuthGuard";
import { TelegramLayout } from "@/components/layout/TelegramLayout";

// Import pages with correct names
import Dashboard from "@/pages/Dashboard";
import InventoryPage from "@/pages/InventoryPage";
import StorePage from "@/pages/Store";
import ChatPage from "@/pages/ChatPage";
import InsightsPage from "@/pages/InsightsPage";
import SettingsPage from "@/pages/SettingsPage";
import UploadSingleStonePage from "@/pages/UploadSingleStonePage";
import DiamondDetailPage from "@/pages/DiamondDetailPage";
import Admin from "@/pages/Admin";

import "./App.css";

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
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <TelegramAuthGuard>
          <TelegramLayout>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/inventory" element={<InventoryPage />} />
              <Route path="/store" element={<StorePage />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/insights" element={<InsightsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/upload-single-stone" element={<UploadSingleStonePage />} />
              <Route path="/diamond/:stockNumber" element={<DiamondDetailPage />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </TelegramLayout>
        </TelegramAuthGuard>
        <Toaster />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
