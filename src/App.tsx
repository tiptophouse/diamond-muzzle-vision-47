
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import AppRoutes from './AppRoutes';
import { TelegramAuthProvider } from './context/TelegramAuthContext';
import { TutorialProvider } from './contexts/TutorialContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { InteractiveWizardProvider } from './contexts/InteractiveWizardContext';
import { useTelegramInit } from './hooks/useTelegramInit';
import { SecurityMonitor } from './components/auth/SecurityMonitor';
import { useUserEngagementMonitor } from './hooks/useUserEngagementMonitor';
import { useUserDataPersistence } from './hooks/useUserDataPersistence';
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

function TelegramInitComponent() {
  useTelegramInit();
  return null;
}

function UserEngagementComponent() {
  useUserEngagementMonitor();
  return null;
}

function UserDataPersistenceComponent() {
  const { user } = { user: null }; // This would come from context
  useUserDataPersistence(user, false);
  return null;
}

function AppContent() {
  const handleRefresh = async () => {
    // Implement refresh logic here
    window.location.reload();
  };

  return (
    <>
      <TelegramInitComponent />
      <SecurityMonitor />
      <UserEngagementComponent />
      <UserDataPersistenceComponent />
      <MobilePullToRefresh onRefresh={handleRefresh}>
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
