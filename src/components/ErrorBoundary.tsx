
import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryCount = 0;
  private maxRetries = 2; // Reduced retries to prevent loops

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    console.error('🚨 ErrorBoundary caught error:', error.name, error.message);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🚨 ErrorBoundary details:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });
    
    this.setState({ errorInfo });
  }

  handleRefresh = () => {
    console.log('🔄 Force refreshing application...');
    window.location.reload();
  };

  handleRetry = () => {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      console.log(`🔄 Retrying (${this.retryCount}/${this.maxRetries})`);
      this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    } else {
      console.log('❌ Max retries reached, forcing refresh');
      this.handleRefresh();
    }
  };

  handleGoHome = () => {
    console.log('🏠 Navigating to home...');
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    window.location.href = '#/';
  };

  render() {
    if (this.state.hasError) {
      const { error } = this.state;
      const canRetry = this.retryCount < this.maxRetries;
      
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 to-slate-900 p-4">
          <Card className="w-full max-w-lg">
            <CardHeader className="text-center">
              <div className="mx-auto w-20 h-20 bg-red-900 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="h-10 w-10 text-red-400" />
              </div>
              <CardTitle className="text-white">Application Error</CardTitle>
              <CardDescription className="text-slate-400">
                The admin panel encountered an error and needs to recover.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-slate-300 space-y-2">
                <p>Don't worry - this is temporary and can be fixed.</p>
                
                {error && (
                  <details className="text-xs">
                    <summary className="cursor-pointer font-medium text-slate-400">Error details</summary>
                    <pre className="mt-2 p-3 bg-slate-800 rounded text-slate-400 whitespace-pre-wrap overflow-auto max-h-32 text-xs">
                      {error.message}
                    </pre>
                  </details>
                )}
              </div>
              
              <div className="flex gap-2 flex-col">
                {canRetry ? (
                  <Button 
                    onClick={this.handleRetry} 
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <RefreshCw size={16} className="mr-2" />
                    Try Again ({this.maxRetries - this.retryCount} left)
                  </Button>
                ) : (
                  <Button 
                    onClick={this.handleRefresh} 
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <RefreshCw size={16} className="mr-2" />
                    Refresh App
                  </Button>
                )}
                
                <Button 
                  onClick={this.handleGoHome} 
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:bg-slate-800"
                >
                  <Home size={16} className="mr-2" />
                  Go to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
