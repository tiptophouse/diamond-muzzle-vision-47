
import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AppErrorFallbackProps {
  error?: Error;
  resetErrorBoundary?: () => void;
}

export function AppErrorFallback({ error, resetErrorBoundary }: AppErrorFallbackProps) {
  const handleReload = () => {
    console.log('🔄 Reloading application...');
    window.location.reload();
  };

  const handleClearStorage = () => {
    console.log('🧹 Clearing storage and reloading...');
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.warn('Failed to clear storage:', e);
    }
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 to-slate-900 p-4">
      <div className="max-w-md w-full bg-slate-800 rounded-lg p-6 border border-slate-700 text-center">
        <div className="w-16 h-16 bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="h-8 w-8 text-red-400" />
        </div>
        
        <h1 className="text-xl font-bold text-white mb-2">App Loading Error</h1>
        <p className="text-slate-300 mb-6 text-sm">
          The application encountered an error while loading. This is usually temporary.
        </p>
        
        <div className="space-y-3">
          <Button 
            onClick={resetErrorBoundary || handleReload}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
          
          <Button 
            onClick={handleClearStorage}
            variant="outline"
            className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            Clear Data & Reload
          </Button>
        </div>
        
        {error && (
          <details className="mt-4 text-left">
            <summary className="text-xs text-slate-400 cursor-pointer">Error Details</summary>
            <pre className="text-xs text-slate-500 mt-2 p-2 bg-slate-900 rounded overflow-auto">
              {error.message}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
