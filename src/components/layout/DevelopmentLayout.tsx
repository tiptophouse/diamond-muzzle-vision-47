import React from 'react';
import { DevelopmentModeIndicator } from '@/components/debug/DevelopmentModeIndicator';

interface DevelopmentLayoutProps {
  children: React.ReactNode;
}

export function DevelopmentLayout({ children }: DevelopmentLayoutProps) {
  const isDevelopment = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost';
  
  if (!isDevelopment) {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      <DevelopmentModeIndicator />
    </>
  );
}