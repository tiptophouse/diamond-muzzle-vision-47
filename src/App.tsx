
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { TelegramAuthProvider } from "@/context/TelegramAuthContext";
import { SecureUserProvider } from "@/contexts/SecureUserContext";
import { AuthorizationGuard } from "@/components/auth/AuthorizationGuard";
import { AuthGuard } from "@/components/auth/AuthGuard";
import SecureInventoryPage from "@/pages/SecureInventoryPage";
import SecureChatPage from "@/pages/SecureChatPage";
import SimpleLogin from "@/components/auth/SimpleLogin";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TelegramAuthProvider>
        <SecureUserProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AuthGuard>
                <AuthorizationGuard>
                  <Routes>
                    <Route path="/" element={<Navigate to="/inventory" replace />} />
                    <Route path="/inventory" element={<SecureInventoryPage />} />
                    <Route path="/chat" element={<SecureChatPage />} />
                    <Route path="/login" element={<SimpleLogin />} />
                  </Routes>
                </AuthorizationGuard>
              </AuthGuard>
            </BrowserRouter>
          </TooltipProvider>
        </SecureUserProvider>
      </TelegramAuthProvider>
    </QueryClientProvider>
  );
}

export default App;
