
import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export default function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  const handleRefresh = () => {
    console.log('🔄 Refreshing application...');
    window.location.reload();
  };

  const handleGoHome = () => {
    console.log('🏠 Navigating to home page...');
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-lg border-slate-200">
        <CardHeader className="text-center">
          <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="h-10 w-10 text-red-600" />
          </div>
          <CardTitle className="text-slate-800">Something went wrong</CardTitle>
          <CardDescription className="text-slate-600">
            The application encountered an unexpected error.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-slate-700 space-y-2">
            <p>We apologize for the inconvenience. The app will try to recover automatically.</p>
            
            <details className="text-xs">
              <summary className="cursor-pointer font-medium">Error details</summary>
              <pre className="mt-2 p-3 bg-slate-50 rounded text-slate-600 whitespace-pre-wrap overflow-auto max-h-40 text-xs">
                <strong>Error:</strong> {error?.message || 'Unknown error'}
                {error?.stack && (
                  <>
                    {'\n\n'}<strong>Stack:</strong> {error.stack}
                  </>
                )}
              </pre>
            </details>
          </div>
          
          <div className="flex gap-2 flex-col sm:flex-row">
            <Button 
              onClick={resetErrorBoundary} 
              className="bg-blue-500 hover:bg-blue-600 text-white flex-1"
            >
              <RefreshCw size={16} className="mr-2" />
              Try Again
            </Button>
            
            <Button 
              onClick={handleRefresh} 
              className="bg-blue-500 hover:bg-blue-600 text-white flex-1"
            >
              <RefreshCw size={16} className="mr-2" />
              Refresh App
            </Button>
            
            <Button 
              onClick={handleGoHome} 
              variant="outline"
              className="flex-1"
            >
              <Home size={16} className="mr-2" />
              Go Home
            </Button>
          </div>
          
          <div className="text-xs text-slate-500 text-center">
            If the problem persists, please contact support with the error details above.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
