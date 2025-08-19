import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SecureFastAPIAuthProvider } from '@/context/SecureFastAPIAuthContext';
import { SecureAuthGuard } from '@/components/auth/SecureAuthGuard';

const Dashboard = lazy(() => import("@/pages/Dashboard"));
const ChatPage = lazy(() => import("@/pages/ChatPage"));
const BulkUploadPage = lazy(() => import("@/pages/BulkUploadPage"));
const SettingsPage = lazy(() => import("@/pages/SettingsPage"));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));
const SecureInventoryDashboard = lazy(() => import("@/pages/SecureInventoryDashboard"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SecureFastAPIAuthProvider>
          <SecureAuthGuard>
            <Routes>
              <Route
                path="/"
                element={
                  <Suspense fallback={<div>Loading...</div>}>
                    <Dashboard />
                  </Suspense>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <Suspense fallback={<div>Loading...</div>}>
                    <Dashboard />
                  </Suspense>
                }
              />
              <Route
                path="/chat"
                element={
                  <Suspense fallback={<div>Loading...</div>}>
                    <ChatPage />
                  </Suspense>
                }
              />
              <Route
                path="/bulk-upload"
                element={
                  <Suspense fallback={<div>Loading...</div>}>
                    <BulkUploadPage />
                  </Suspense>
                }
              />
              <Route
                path="/settings"
                element={
                  <Suspense fallback={<div>Loading...</div>}>
                    <SettingsPage />
                  </Suspense>
                }
              />
              <Route
                path="*"
                element={
                  <Suspense fallback={<div>Loading...</div>}>
                    <NotFoundPage />
                  </Suspense>
                }
              />
              <Route path="/secure-inventory" element={<SecureInventoryDashboard />} />
            </Routes>
          </SecureAuthGuard>
        </SecureFastAPIAuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
