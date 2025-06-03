
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
  private maxRetries = 3;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🚨 ErrorBoundary caught an error:', error);
    console.error('🚨 Error info:', errorInfo);
    
    // Store error info for debugging
    this.setState({ errorInfo });
    
    // Log additional context
    console.error('🚨 Component stack:', errorInfo.componentStack);
    console.error('🚨 Error stack:', error.stack);
  }

  handleRefresh = () => {
    console.log('🔄 Refreshing application...');
    // Reset the error boundary state
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    
    // Force reload the page
    window.location.reload();
  };

  handleRetry = () => {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      console.log(`🔄 Retrying (attempt ${this.retryCount}/${this.maxRetries})`);
      
      // Reset the error boundary state to retry rendering
      this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    } else {
      console.log('❌ Max retries reached, forcing refresh');
      this.handleRefresh();
    }
  };

  handleGoHome = () => {
    console.log('🏠 Navigating to home page...');
    // Reset state and navigate to home
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      const { error, errorInfo } = this.state;
      const canRetry = this.retryCount < this.maxRetries;
      
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
                    {errorInfo?.componentStack && (
                      <>
                        {'\n\n'}<strong>Component Stack:</strong> {errorInfo.componentStack}
                      </>
                    )}
                  </pre>
                </details>
              </div>
              
              <div className="flex gap-2 flex-col sm:flex-row">
                {canRetry ? (
                  <Button 
                    onClick={this.handleRetry} 
                    className="bg-blue-500 hover:bg-blue-600 text-white flex-1"
                  >
                    <RefreshCw size={16} className="mr-2" />
                    Retry ({this.maxRetries - this.retryCount} left)
                  </Button>
                ) : (
                  <Button 
                    onClick={this.handleRefresh} 
                    className="bg-blue-500 hover:bg-blue-600 text-white flex-1"
                  >
                    <RefreshCw size={16} className="mr-2" />
                    Refresh App
                  </Button>
                )}
                
                <Button 
                  onClick={this.handleGoHome} 
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

    return this.props.children;
  }
}
