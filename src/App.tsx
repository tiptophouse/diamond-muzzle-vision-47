import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from "@/components/theme-provider"
import { TelegramAuthProvider } from '@/contexts/TelegramAuth';
import { TutorialProvider } from '@/contexts/TutorialContext';
import { QueryClient } from '@tanstack/react-query';
import { StartupQualityLayout } from '@/components/layout/StartupQualityLayout';
import { ErrorBoundary } from 'react-error-boundary';
import Dashboard from '@/pages/Dashboard';
import Inventory from '@/pages/Inventory';
import Store from '@/pages/Store';
import Upload from '@/pages/Upload';
import Chat from '@/pages/Chat';
import Insights from '@/pages/Insights';
import Settings from '@/pages/Settings';
import Login from '@/pages/Login';
import SecureDiamond from '@/pages/SecureDiamond';
import UploadSingleStone from '@/pages/UploadSingleStone';
import { TutorialWizardManager } from '@/components/tutorial/TutorialWizardManager';

function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <ThemeProvider>
      <BrowserRouter>
        <TelegramAuthProvider>
          <TutorialProvider>
            <QueryClient>
              <StartupQualityLayout>
                <div className="App min-h-screen bg-background text-foreground">
                  <ErrorBoundary>
                    <Routes>
                      <Route path="/" element={<Login />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/inventory" element={<Inventory />} />
                      <Route path="/store" element={<Store />} />
                      <Route path="/upload" element={<Upload />} />
                      <Route path="/chat" element={<Chat />} />
                      <Route path="/insights" element={<Insights />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/secure-diamond/:stockNumber" element={<SecureDiamond />} />
                      <Route path="/upload-single-stone" element={<UploadSingleStone />} />
                    </Routes>
                    
                    {/* Add the tutorial wizard manager */}
                    <TutorialWizardManager />
                  </ErrorBoundary>
                </div>
              </StartupQualityLayout>
            </QueryClient>
          </TutorialProvider>
        </TelegramAuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
