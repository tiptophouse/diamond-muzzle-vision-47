import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';

// Lazy load pages
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const InventoryPage = lazy(() => import('@/pages/InventoryPage'));
const DiamondDetailPage = lazy(() => import('@/pages/DiamondDetailPage'));
const AuctionBidPage = lazy(() => import('@/pages/AuctionBidPage'));
const NotificationsPage = lazy(() => import('@/pages/NotificationsPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
  </div>
);

export function AppRoutes() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/diamond/:stockNumber" element={<DiamondDetailPage />} />
        <Route path="/auction/:auctionId" element={<AuctionBidPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
