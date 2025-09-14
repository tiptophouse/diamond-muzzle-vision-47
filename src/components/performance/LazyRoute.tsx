import { Suspense, lazy, ComponentType } from 'react';
import { DashboardLoading } from '@/components/dashboard/DashboardLoading';

interface LazyRouteProps {
  componentImport: () => Promise<{ default: ComponentType<any> }>;
  fallback?: React.ReactNode;
}

export function LazyRoute({ componentImport, fallback }: LazyRouteProps) {
  const LazyComponent = lazy(componentImport);
  
  return (
    <Suspense fallback={fallback || <DashboardLoading onEmergencyMode={() => {}} />}>
      <LazyComponent />
    </Suspense>
  );
}

// Pre-configured lazy routes for common pages
export const LazyDashboard = () => <LazyRoute componentImport={() => import('@/pages/Dashboard')} />;
export const LazyInventory = () => <LazyRoute componentImport={() => import('@/pages/InventoryPage')} />;
export const LazyUpload = () => <LazyRoute componentImport={() => import('@/pages/UploadPage')} />;
export const LazySettings = () => <LazyRoute componentImport={() => import('@/pages/SettingsPage')} />;