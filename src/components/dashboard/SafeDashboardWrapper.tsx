import React from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { CrashProtectedDashboard } from './CrashProtectedDashboard';
import { Diamond } from '@/components/inventory/InventoryTable';

interface SafeDashboardWrapperProps {
  allDiamonds: Diamond[];
  loading: boolean;
  fetchData: () => void;
}

export function SafeDashboardWrapper({ allDiamonds, loading, fetchData }: SafeDashboardWrapperProps) {
  console.log('🔒 SafeDashboardWrapper: Initializing with crash protection');
  console.log('🔒 Received diamonds:', allDiamonds?.length || 0);
  console.log('🔒 Loading state:', loading);
  
  return (
    <ErrorBoundary>
      <CrashProtectedDashboard 
        allDiamonds={allDiamonds || []} 
        loading={loading || false} 
        fetchData={fetchData || (() => {})} 
      />
    </ErrorBoundary>
  );
}