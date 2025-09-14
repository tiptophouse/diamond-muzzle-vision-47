import React from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { DataDrivenDashboard } from './DataDrivenDashboard';
import { Diamond } from '@/components/inventory/InventoryTable';

interface CrashProtectedDashboardProps {
  allDiamonds: Diamond[];
  loading: boolean;
  fetchData: () => void;
}

class DashboardErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    console.error('🚨 Dashboard Error Boundary caught error:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🚨 Dashboard crashed:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="text-center bg-card rounded-xl shadow-lg p-8 max-w-md mx-auto border">
            <div className="bg-destructive/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <div className="w-8 h-8 bg-destructive/20 rounded-full"></div>
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-2">Dashboard Error</h2>
            <p className="text-sm text-muted-foreground mb-4">
              The dashboard encountered an error. Please refresh the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export function CrashProtectedDashboard({ allDiamonds, loading, fetchData }: CrashProtectedDashboardProps) {
  console.log('🛡️ CrashProtectedDashboard: Rendering with protection layer');
  console.log('🛡️ Diamonds count:', allDiamonds?.length || 0);
  console.log('🛡️ Loading state:', loading);
  
  return (
    <DashboardErrorBoundary>
      <ErrorBoundary>
        <DataDrivenDashboard 
          allDiamonds={allDiamonds || []} 
          loading={loading || false}
          fetchData={fetchData || (() => {})} 
        />
      </ErrorBoundary>
    </DashboardErrorBoundary>
  );
}