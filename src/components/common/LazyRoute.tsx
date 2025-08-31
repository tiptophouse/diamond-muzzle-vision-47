
import React, { Suspense } from 'react';
import { TelegramMiniAppLayout } from '@/components/layout/TelegramMiniAppLayout';

interface LazyRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  withLayout?: boolean;
}

const DefaultFallback = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="flex items-center gap-3 text-muted-foreground">
      <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent"></div>
      <span className="text-sm font-medium">Loading...</span>
    </div>
  </div>
);

export function LazyRoute({ children, fallback = <DefaultFallback />, withLayout = true }: LazyRouteProps) {
  const content = (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );

  return withLayout ? (
    <TelegramMiniAppLayout>
      {content}
    </TelegramMiniAppLayout>
  ) : content;
}
