
import { StrictMode } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TelegramAuthProvider } from '@/context/TelegramAuthContext';
import { TelegramLayout } from '@/components/layout/TelegramLayout';
import UploadPage from '@/pages/UploadPage';
import InventoryPage from '@/pages/InventoryPage';

// Create query client
const queryClient = new QueryClient();

function App() {
  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <TelegramAuthProvider>
          <Router>
            <div className="App">
              <Routes>
                <Route path="/upload" element={<UploadPage />} />
                <Route path="/inventory" element={<InventoryPage />} />
                <Route path="/" element={
                  <TelegramLayout>
                    <div className="container mx-auto p-4">
                      <h1 className="text-2xl font-bold mb-4">Diamond Inventory Manager</h1>
                      <p>Welcome to your diamond inventory management system.</p>
                    </div>
                  </TelegramLayout>
                } />
              </Routes>
              <Toaster />
            </div>
          </Router>
        </TelegramAuthProvider>
      </QueryClientProvider>
    </StrictMode>
  );
}

export default App;
