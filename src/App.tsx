
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
            <TelegramLayout>
              <div className="App">
                <Routes>
                  <Route path="/upload" element={<UploadPage />} />
                  <Route path="/inventory" element={<InventoryPage />} />
                  <Route path="/" element={
                    <div className="container mx-auto p-4">
                      <h1 className="text-2xl font-bold mb-4">Diamond Inventory Manager</h1>
                      <p className="mb-4">Welcome to your diamond inventory management system.</p>
                      <div className="space-y-4">
                        <div className="p-4 border rounded-lg">
                          <h2 className="text-lg font-semibold mb-2">Quick Actions</h2>
                          <div className="space-x-2">
                            <button 
                              onClick={() => window.location.href = '/inventory'}
                              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                            >
                              View Inventory
                            </button>
                            <button 
                              onClick={() => window.location.href = '/upload'}
                              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                            >
                              Upload Diamonds
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  } />
                </Routes>
                <Toaster />
              </div>
            </TelegramLayout>
          </Router>
        </TelegramAuthProvider>
      </QueryClientProvider>
    </StrictMode>
  );
}

export default App;
