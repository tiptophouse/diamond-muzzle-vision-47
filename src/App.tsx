
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TelegramAuthProvider } from '@/context/TelegramAuthContext';
import { TelegramLayout } from '@/components/layout/TelegramLayout';
import { Layout } from '@/components/layout/Layout';
import { AuthorizationGuard } from '@/components/auth/AuthorizationGuard';
import UploadPage from '@/pages/UploadPage';
import InventoryPage from '@/pages/InventoryPage';
import StorePage from '@/pages/StorePage';
import Dashboard from '@/pages/Dashboard';
import Index from '@/pages/Index';
import Admin from '@/pages/Admin';
import SettingsPage from '@/pages/SettingsPage';

// Create query client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TelegramAuthProvider>
        <Router>
          <div className="App">
            <AuthorizationGuard>
              <Routes>
                <Route path="/" element={<Index />} />
                
                <Route path="/upload" element={
                  <TelegramLayout>
                    <UploadPage />
                  </TelegramLayout>
                } />
                
                <Route path="/inventory" element={
                  <Layout>
                    <InventoryPage />
                  </Layout>
                } />
                
                <Route path="/store" element={
                  <TelegramLayout>
                    <StorePage />
                  </TelegramLayout>
                } />
                
                <Route path="/dashboard" element={<Dashboard />} />
                
                <Route path="/admin" element={
                  <Layout>
                    <Admin />
                  </Layout>
                } />
                
                <Route path="/settings" element={
                  <Layout>
                    <SettingsPage />
                  </Layout>
                } />
                
                {/* Fallback route */}
                <Route path="*" element={
                  <TelegramLayout>
                    <div className="container mx-auto p-4">
                      <h1 className="text-2xl font-bold mb-4">Diamond Inventory Manager</h1>
                      <p>Welcome to your diamond inventory management system.</p>
                    </div>
                  </TelegramLayout>
                } />
              </Routes>
            </AuthorizationGuard>
            <Toaster />
          </div>
        </Router>
      </TelegramAuthProvider>
    </QueryClientProvider>
  );
}

export default App;
