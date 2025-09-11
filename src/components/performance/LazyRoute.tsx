import { Suspense, lazy, ComponentType, memo, useState, useEffect } from 'react';
import { DashboardLoading } from '@/components/dashboard/DashboardLoading';
import { telegramPerformanceMonitor } from '@/services/telegramPerformanceMonitor';

interface LazyRouteProps {
  componentImport: () => Promise<{ default: ComponentType<any> }>;
  fallback?: React.ReactNode;
  routeName?: string;
}

export const LazyRoute = memo(function LazyRoute({ 
  componentImport, 
  fallback,
  routeName 
}: LazyRouteProps) {
  const [isLoading, setIsLoading] = useState(true);
  
  // Performance monitoring for route loading
  useEffect(() => {
    if (routeName) {
      telegramPerformanceMonitor.startTimer(`route_load_${routeName}`);
    }
  }, [routeName]);

  const LazyComponent = lazy(() => {
    return componentImport().then(module => {
      if (routeName) {
        const loadTime = telegramPerformanceMonitor.endTimer(`route_load_${routeName}`);
        console.log(`📊 Route "${routeName}" loaded in ${loadTime}ms`);
      }
      setIsLoading(false);
      return module;
    });
  });
  
  return (
    <Suspense fallback={fallback || <DashboardLoading onEmergencyMode={() => {}} />}>
      <LazyComponent />
    </Suspense>
  );
});

// Enhanced lazy routes with performance monitoring and preloading
export const LazyInventory = memo(() => {
  // Preload related components
  useEffect(() => {
    const preloadTimer = setTimeout(() => {
      import('@/components/inventory/InventoryTable').catch(() => {});
      import('@/components/inventory/InventoryMobileCard').catch(() => {});
    }, 2000);

    return () => clearTimeout(preloadTimer);
  }, []);

  return (
    <LazyRoute 
      componentImport={() => import('@/pages/InventoryPage')}
      routeName="inventory"
    />
  );
});

export const LazyUpload = memo(() => (
  <LazyRoute 
    componentImport={() => import('@/pages/UploadPage')}
    routeName="upload"
  />
));

export const LazySettings = memo(() => (
  <LazyRoute 
    componentImport={() => import('@/pages/SettingsPage')}
    routeName="settings"
  />
));