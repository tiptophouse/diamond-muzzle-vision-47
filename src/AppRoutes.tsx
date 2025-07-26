
import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { AuthGuard } from './components/auth/AuthGuard';
import Index from './pages/Index';
import Dashboard from './pages/Dashboard';
import InventoryPage from './pages/InventoryPage';
import StorePage from './pages/StorePage';
import UploadPage from './pages/UploadPage';
import UploadSingleStonePage from './pages/UploadSingleStonePage';
import BulkUploadPage from './pages/BulkUploadPage';
import NotificationsPage from './pages/NotificationsPage';
import SettingsPage from './pages/SettingsPage';
import WishlistPage from './pages/WishlistPage';
import ChatPage from './pages/ChatPage';
import InsightsPage from './pages/InsightsPage';
import Admin from './pages/Admin';
import NotFound from './pages/NotFound';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout><Outlet /></Layout>}>
        <Route index element={<Index />} />
        <Route
          path="/dashboard"
          element={
            <AuthGuard>
              <Dashboard />
            </AuthGuard>
          }
        />
        <Route
          path="/inventory"
          element={
            <AuthGuard>
              <InventoryPage />
            </AuthGuard>
          }
        />
        <Route
          path="/store"
          element={
            <AuthGuard>
              <StorePage />
            </AuthGuard>
          }
        />
        <Route
          path="/upload"
          element={
            <AuthGuard>
              <UploadPage />
            </AuthGuard>
          }
        />
        <Route
          path="/upload-single"
          element={
            <AuthGuard>
              <UploadSingleStonePage />
            </AuthGuard>
          }
        />
        <Route
          path="/bulk-upload"
          element={
            <AuthGuard>
              <BulkUploadPage />
            </AuthGuard>
          }
        />
        <Route
          path="/notifications"
          element={
            <AuthGuard>
              <NotificationsPage />
            </AuthGuard>
          }
        />
        <Route
          path="/settings"
          element={
            <AuthGuard>
              <SettingsPage />
            </AuthGuard>
          }
        />
        <Route
          path="/wishlist"
          element={
            <AuthGuard>
              <WishlistPage />
            </AuthGuard>
          }
        />
        <Route
          path="/chat"
          element={
            <AuthGuard>
              <ChatPage />
            </AuthGuard>
          }
        />
        <Route
          path="/insights"
          element={
            <AuthGuard>
              <InsightsPage />
            </AuthGuard>
          }
        />
        <Route
          path="/admin"
          element={
            <AuthGuard>
              <Admin />
            </AuthGuard>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
