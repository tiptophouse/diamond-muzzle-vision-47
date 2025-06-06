
import {
  BrowserRouter as Router,
  Route,
  Routes,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/InventoryPage";
import Settings from "./pages/SettingsPage";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import { TelegramAuthProvider } from '@/context/TelegramAuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { AuthorizationGuard } from '@/components/auth/AuthorizationGuard';
import { AdminGuard } from '@/components/admin/AdminGuard';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TelegramAuthProvider>
          <AuthGuard>
            <AuthorizationGuard>
              <Router>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/inventory" element={<Inventory />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/admin" element={
                    <AdminGuard>
                      <Admin />
                    </AdminGuard>
                  } />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Router>
            </AuthorizationGuard>
          </AuthGuard>
        </TelegramAuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
