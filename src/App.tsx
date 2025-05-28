
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TelegramAuthProvider } from "@/context/TelegramAuthContext";
import Dashboard from "./pages/Dashboard";
import InventoryPage from "./pages/InventoryPage";
import UploadPage from "./pages/UploadPage";
import SettingsPage from "./pages/SettingsPage";
import InsightsPage from "./pages/InsightsPage";
import ReportsPage from "./pages/ReportsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TelegramAuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/insights" element={<InsightsPage />} />
            <Route path="/queries" element={<Dashboard />} />
            <Route path="/payments" element={<Dashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </TelegramAuthProvider>
  </QueryClientProvider>
);

export default App;
