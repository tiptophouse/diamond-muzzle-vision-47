
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TelegramAuthProvider } from '@/context/TelegramAuthContext';
import { TelegramLayout } from '@/components/layout/TelegramLayout';
import UploadPage from '@/pages/UploadPage';
import InventoryPage from '@/pages/InventoryPage';
import StorePage from '@/pages/StorePage';
import Admin from '@/pages/Admin';
import Dashboard from '@/pages/Dashboard';
import Index from '@/pages/Index';

// Create query client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TelegramAuthProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/upload" element={
                <TelegramLayout>
                  <UploadPage />
                </TelegramLayout>
              } />
              <Route path="/inventory" element={
                <TelegramLayout>
                  <InventoryPage />
                </TelegramLayout>
              } />
              <Route path="/store" element={
                <TelegramLayout>
                  <StorePage />
                </TelegramLayout>
              } />
              <Route path="/admin" element={
                <TelegramLayout>
                  <Admin />
                </TelegramLayout>
              } />
              <Route path="/dashboard" element={
                <TelegramLayout>
                  <Dashboard />
                </TelegramLayout>
              } />
              <Route path="/" element={
                <TelegramLayout>
                  <Index />
                </TelegramLayout>
              } />
            </Routes>
            <Toaster />
          </div>
        </Router>
      </TelegramAuthProvider>
    </QueryClientProvider>
  );
}

export default App;
