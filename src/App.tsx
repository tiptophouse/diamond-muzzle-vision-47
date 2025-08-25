
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { TelegramAuthGuard } from "@/components/auth/TelegramAuthGuard";
import { TelegramLayout } from "@/components/layout/TelegramLayout";
import { TelegramAuthProvider } from "@/context/TelegramAuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Import pages with correct names
import Dashboard from "@/pages/Dashboard";
import InventoryPage from "@/pages/InventoryPage";
import Store from "@/pages/Store";
import Chat from "@/pages/Chat";
import Insights from "@/pages/Insights";
import Settings from "@/pages/Settings";
import UploadSingleStone from "@/pages/UploadSingleStone";
import DiamondDetail from "@/pages/DiamondDetail";
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
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TelegramAuthProvider>
          <BrowserRouter>
            <TelegramAuthGuard>
              <TelegramLayout>
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/inventory" element={<InventoryPage />} />
                  <Route path="/store" element={<Store />} />
                  <Route path="/chat" element={<Chat />} />
                  <Route path="/insights" element={<Insights />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/upload-single-stone" element={<UploadSingleStone />} />
                  <Route path="/diamond/:stockNumber" element={<DiamondDetail />} />
                  <Route path="/admin" element={<Admin />} />
                </Routes>
              </TelegramLayout>
            </TelegramAuthGuard>
            <Toaster />
          </BrowserRouter>
        </TelegramAuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
