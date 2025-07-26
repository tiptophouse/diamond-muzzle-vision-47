
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import AppRoutes from './AppRoutes';
import { TelegramAuthProvider } from './context/TelegramAuthContext';
import { TutorialProvider } from './contexts/TutorialContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { InteractiveWizardProvider } from './contexts/InteractiveWizardContext';
import { TelegramInit } from './hooks/useTelegramInit';
import { SecurityMonitor } from './components/auth/SecurityMonitor';
import { UserEngagementMonitor } from './hooks/useUserEngagementMonitor';
import { UserDataPersistence } from './hooks/useUserDataPersistence';
import { MobilePullToRefresh } from './components/mobile/MobilePullToRefresh';
import { ErrorBoundary } from './components/ErrorBoundary';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

function AppContent() {
  return (
    <>
      <TelegramInit />
      <SecurityMonitor />
      <UserEngagementMonitor />
      <UserDataPersistence />
      <MobilePullToRefresh>
        <AppRoutes />
      </MobilePullToRefresh>
      <Toaster />
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ThemeProvider>
            <TelegramAuthProvider>
              <TutorialProvider>
                <InteractiveWizardProvider>
                  <AppContent />
                </InteractiveWizardProvider>
              </TutorialProvider>
            </TelegramAuthProvider>
          </ThemeProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
