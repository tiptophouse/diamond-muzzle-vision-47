
import { Suspense, lazy } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TelegramAuthProvider } from "@/context/TelegramAuthContext";
import { TelegramDataProvider } from "@/context/TelegramDataContext";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { TelegramOnlyGuard } from "@/components/auth/TelegramOnlyGuard";
import { AuthorizationGuard } from "@/components/auth/AuthorizationGuard";
import LoadingSpinner from "@/components/common/LoadingSpinner";

// Lazy load components
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Inventory = lazy(() => import("@/pages/Inventory"));
const UploadPage = lazy(() => import("@/pages/UploadPage"));
const UploadSingleStonePage = lazy(() => import("@/pages/UploadSingleStonePage"));
const Chat = lazy(() => import("@/pages/Chat"));
const WishlistPage = lazy(() => import("@/pages/WishlistPage"));
const StorePage = lazy(() => import("@/pages/StorePage"));
const Admin = lazy(() => import("@/pages/Admin"));
const InsightsPage = lazy(() => import("@/pages/InsightsPage"));
const ScheduleMeetingPage = lazy(() => import("@/pages/ScheduleMeetingPage"));

const queryClient = new QueryClient();

// Admin Guard Component
const AdminGuard = ({ children }: { children: React.ReactNode }) => {
  // For now, allow access - you can add admin check logic here
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TelegramAuthProvider>
      <TelegramDataProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={
                <Suspense fallback={<LoadingSpinner />}>
                  <TelegramOnlyGuard>
                    <AuthGuard>
                      <AuthorizationGuard>
                        <Dashboard />
                      </AuthorizationGuard>
                    </AuthGuard>
                  </TelegramOnlyGuard>
                </Suspense>
              } />
              <Route path="/inventory" element={
                <Suspense fallback={<LoadingSpinner />}>
                  <TelegramOnlyGuard>
                    <AuthGuard>
                      <AuthorizationGuard>
                        <Inventory />
                      </AuthorizationGuard>
                    </AuthGuard>
                  </TelegramOnlyGuard>
                </Suspense>
              } />
              <Route path="/upload" element={
                <Suspense fallback={<LoadingSpinner />}>
                  <TelegramOnlyGuard>
                    <AuthGuard>
                      <AuthorizationGuard>
                        <UploadPage />
                      </AuthorizationGuard>
                    </AuthGuard>
                  </TelegramOnlyGuard>
                </Suspense>
              } />
              <Route path="/upload-single" element={
                <Suspense fallback={<LoadingSpinner />}>
                  <TelegramOnlyGuard>
                    <AuthGuard>
                      <AuthorizationGuard>
                        <UploadSingleStonePage />
                      </AuthorizationGuard>
                    </AuthGuard>
                  </TelegramOnlyGuard>
                </Suspense>
              } />
              <Route path="/chat" element={
                <Suspense fallback={<LoadingSpinner />}>
                  <TelegramOnlyGuard>
                    <AuthGuard>
                      <AuthorizationGuard>
                        <Chat />
                      </AuthorizationGuard>
                    </AuthGuard>
                  </TelegramOnlyGuard>
                </Suspense>
              } />
              <Route path="/wishlist" element={
                <Suspense fallback={<LoadingSpinner />}>
                  <TelegramOnlyGuard>
                    <AuthGuard>
                      <AuthorizationGuard>
                        <WishlistPage />
                      </AuthorizationGuard>
                    </AuthGuard>
                  </TelegramOnlyGuard>
                </Suspense>
              } />
              <Route path="/store" element={
                <Suspense fallback={<LoadingSpinner />}>
                  <StorePage />
                </Suspense>
              } />
              <Route path="/admin" element={
                <Suspense fallback={<LoadingSpinner />}>
                  <TelegramOnlyGuard>
                    <AuthGuard>
                      <AdminGuard>
                        <Admin />
                      </AdminGuard>
                    </AuthGuard>
                  </TelegramOnlyGuard>
                </Suspense>
              } />
              <Route path="/insights" element={
                <Suspense fallback={<LoadingSpinner />}>
                  <TelegramOnlyGuard>
                    <AuthGuard>
                      <AuthorizationGuard>
                        <InsightsPage />
                      </AuthorizationGuard>
                    </AuthGuard>
                  </TelegramOnlyGuard>
                </Suspense>
              } />
              <Route path="/schedule-meeting" element={
                <Suspense fallback={<LoadingSpinner />}>
                  <TelegramOnlyGuard>
                    <AuthGuard>
                      <AuthorizationGuard>
                        <ScheduleMeetingPage />
                      </AuthorizationGuard>
                    </AuthGuard>
                  </TelegramOnlyGuard>
                </Suspense>
              } />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </TelegramDataProvider>
    </TelegramAuthProvider>
  </QueryClientProvider>
);

export default App;
