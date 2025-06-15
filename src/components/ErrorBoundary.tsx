
import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
  retryCount: number;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private maxRetries = 2;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, retryCount: 0 };
    console.log('🛡️ ErrorBoundary initialized');
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    console.error('🛡️ ErrorBoundary caught error:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🚨 ErrorBoundary caught error:', error);
    console.error('🚨 Component stack:', errorInfo.componentStack);
    console.error('🚨 Error boundary triggered - this might explain blank screen');
    
    this.setState({ errorInfo });
    
    // Critical: Never reload the page in production Telegram environment
    if (window.Telegram?.WebApp) {
      console.log('📱 In Telegram - preventing page reload');
    }
  }

  handleSoftRetry = () => {
    const newRetryCount = this.state.retryCount + 1;
    
    if (newRetryCount <= this.maxRetries) {
      console.log(`🔄 Soft retry attempt ${newRetryCount}/${this.maxRetries}`);
      
      // Soft reset - don't reload page
      this.setState({ 
        hasError: false, 
        error: undefined, 
        errorInfo: undefined,
        retryCount: newRetryCount
      });
    } else {
      console.log('❌ Max retries reached, showing error state');
    }
  };

  handleGoHome = () => {
    console.log('🏠 Navigating to home (soft navigation)');
    
    // Soft reset without page reload
    this.setState({ 
      hasError: false, 
      error: undefined, 
      errorInfo: undefined,
      retryCount: 0
    });
    
    // Use direct navigation
    window.location.href = '/dashboard';
  };

  handleForceRefresh = () => {
    // Only use this as last resort and warn user
    console.log('⚠️ Force refresh requested - this will reload the app');
    
    if (window.Telegram?.WebApp) {
      // In Telegram, try to close the app instead of reloading
      try {
        window.Telegram.WebApp.close();
      } catch {
        // If close fails, then reload as last resort
        window.location.reload();
      }
    } else {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      const { error, errorInfo, retryCount } = this.state;
      const canRetry = retryCount < this.maxRetries;
      
      console.log('🛡️ ErrorBoundary rendering error UI');
      
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
          <Card className="w-full max-w-lg border-slate-200">
            <CardHeader className="text-center">
              <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="h-10 w-10 text-red-600" />
              </div>
              <CardTitle className="text-slate-800">Something went wrong</CardTitle>
              <CardDescription className="text-slate-600">
                The app encountered an error but is trying to recover.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-slate-700 space-y-2">
                <p>Don't worry - this won't close your Telegram app.</p>
                
                {process.env.NODE_ENV === 'development' && (
                  <details className="text-xs">
                    <summary className="cursor-pointer font-medium">Error details (dev only)</summary>
                    <pre className="mt-2 p-3 bg-slate-50 rounded text-slate-600 whitespace-pre-wrap overflow-auto max-h-40 text-xs">
                      <strong>Error:</strong> {error?.message || 'Unknown error'}
                      {error?.stack && (
                        <>
                          {'\n\n'}<strong>Stack:</strong> {error.stack.substring(0, 500)}
                        </>
                      )}
                    </pre>
                  </details>
                )}
              </div>
              
              <div className="flex gap-2 flex-col sm:flex-row">
                {canRetry ? (
                  <Button 
                    onClick={this.handleSoftRetry} 
                    className="bg-blue-500 hover:bg-blue-600 text-white flex-1"
                  >
                    <RefreshCw size={16} className="mr-2" />
                    Try Again ({this.maxRetries - retryCount} left)
                  </Button>
                ) : (
                  <Button 
                    onClick={this.handleForceRefresh} 
                    className="bg-orange-500 hover:bg-orange-600 text-white flex-1"
                  >
                    <RefreshCw size={16} className="mr-2" />
                    Restart App
                  </Button>
                )}
                
                <Button 
                  onClick={this.handleGoHome} 
                  variant="outline"
                  className="flex-1"
                >
                  <Home size={16} className="mr-2" />
                  Go to Dashboard
                </Button>
              </div>
              
              <div className="text-xs text-slate-500 text-center">
                Error #{retryCount + 1} • Telegram mini app safe mode
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    console.log('🛡️ ErrorBoundary rendering children normally');
    return this.props.children;
  }
}
