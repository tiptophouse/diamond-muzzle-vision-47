
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { TelegramAuthProvider } from '@/context/TelegramAuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { Toaster } from '@/components/ui/toaster';
import Index from '@/pages/Index';
import Dashboard from '@/pages/Dashboard';
import InventoryPage from '@/pages/InventoryPage';
import StorePage from '@/pages/StorePage';
import ArchivePage from '@/pages/ArchivePage';
import UploadPage from '@/pages/UploadPage';
import UploadSingleStonePage from '@/pages/UploadSingleStonePage';
import ChatPage from '@/pages/ChatPage';
import InsightsPage from '@/pages/InsightsPage';
import NotificationsPage from '@/pages/NotificationsPage';
import ReportsPage from '@/pages/ReportsPage';
import SettingsPage from '@/pages/SettingsPage';
import Admin from '@/pages/Admin';
import AdminAnalytics from '@/pages/AdminAnalytics';
import ProfilePage from '@/pages/ProfilePage';
import MCPPage from '@/pages/MCPPage';
import NotFound from '@/pages/NotFound';
import './App.css';

function App() {
  return (
    <TelegramAuthProvider>
      <ThemeProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/inventory" element={<InventoryPage />} />
              <Route path="/store" element={<StorePage />} />
              <Route path="/archive" element={<ArchivePage />} />
              <Route path="/upload" element={<UploadPage />} />
              <Route path="/upload-single" element={<UploadSingleStonePage />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/insights" element={<InsightsPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/admin/analytics" element={<AdminAnalytics />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/mcp" element={<MCPPage />} />
              <Route path="/404" element={<NotFound />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </div>
          <Toaster />
        </Router>
      </ThemeProvider>
    </TelegramAuthProvider>
  );
}

export default App;
