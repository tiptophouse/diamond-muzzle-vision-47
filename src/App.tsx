
import React, { useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { TelegramAuthProvider } from "@/context/TelegramAuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { EnhancedAuthGuard } from "@/components/auth/EnhancedAuthGuard";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { handleTelegramRedirect } from "@/utils/urlHandler";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import InventoryPage from "./pages/InventoryPage";
import UploadPage from "./pages/UploadPage";
import SettingsPage from "./pages/SettingsPage";
import InsightsPage from "./pages/InsightsPage";
import ReportsPage from "./pages/ReportsPage";
import ChatPage from "./pages/ChatPage";
import NotificationsPage from "./pages/NotificationsPage";
import ProfilePage from "./pages/ProfilePage";
import NotFound from "./pages/NotFound";
import DiamondSwipe from "./pages/DiamondSwipe";
import AdminAnalytics from "./pages/AdminAnalytics";

// Check if we're in Telegram environment
const isTelegramEnv = typeof window !== 'undefined' && !!window.Telegram?.WebApp;

// Enhanced React Query client for better reliability
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry on 404s or auth errors
        if (error?.message?.includes('404') || error?.message?.includes('auth')) {
          return false;
        }
        return failureCount < (isTelegramEnv ? 1 : 2);
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: isTelegramEnv ? 10 * 60 * 1000 : 5 * 60 * 1000,
      gcTime: 15 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      networkMode: 'online',
    },
    mutations: {
      retry: 1,
      retryDelay: 2000,
      networkMode: 'online',
    },
  },
});

// Service Worker registration
const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('✅ Service Worker registered successfully:', registration.scope);
      
      // Listen for updates
      registration.addEventListener('updatefound', () => {
        console.log('🔄 Service Worker update found');
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('🎉 New Service Worker available');
              // Optionally show update notification to user
            }
          });
        }
      });
      
    } catch (error) {
      console.warn('⚠️ Service Worker registration failed:', error);
    }
  }
};

const App: React.FC = () => {
  useEffect(() => {
    // Handle URL issues early
    try {
      handleTelegramRedirect();
    } catch (error) {
      console.error('Error handling initial redirect:', error);
    }
    
    // Register service worker for offline support
    registerServiceWorker();
    
    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      // Don't prevent default to allow error reporting
    };
    
    // Handle general errors
    const handleError = (event: ErrorEvent) => {
      console.error('Global error caught:', event.error);
    };
    
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);
    
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TelegramAuthProvider>
          <ThemeProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <HashRouter>
                <EnhancedAuthGuard>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/inventory" element={<InventoryPage />} />
                    <Route path="/upload" element={<UploadPage />} />
                    <Route path="/reports" element={<ReportsPage />} />
                    <Route path="/reports/:reportId" element={<ReportsPage />} />
                    <Route path="/:reportId" element={<ReportsPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/insights" element={<InsightsPage />} />
                    <Route path="/chat" element={<ChatPage />} />
                    <Route path="/swipe" element={<DiamondSwipe />} />
                    <Route path="/notifications" element={<NotificationsPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/admin" element={<AdminAnalytics />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </EnhancedAuthGuard>
              </HashRouter>
            </TooltipProvider>
          </ThemeProvider>
        </TelegramAuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
