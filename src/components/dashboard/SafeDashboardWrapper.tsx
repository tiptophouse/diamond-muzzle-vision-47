import React from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { DataDrivenDashboard } from './DataDrivenDashboard';
import { Diamond } from '@/components/inventory/InventoryTable';

interface SafeDashboardWrapperProps {
  allDiamonds: Diamond[];
  loading: boolean;
  fetchData: () => void;
}

export function SafeDashboardWrapper({ allDiamonds, loading, fetchData }: SafeDashboardWrapperProps) {
  return (
    <ErrorBoundary>
      <DataDrivenDashboard 
        allDiamonds={allDiamonds} 
        loading={loading} 
        fetchData={fetchData} 
      />
    </ErrorBoundary>
  );
}