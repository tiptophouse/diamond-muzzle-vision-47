import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      const isAndroid = /Android/i.test(navigator.userAgent);
      const isSamsung = /Samsung/i.test(navigator.userAgent);
      
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="text-center bg-card rounded-xl shadow-lg p-8 max-w-md mx-auto border">
            <div className="bg-destructive/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="h-10 w-10 text-destructive" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Application Error</h2>
            <p className="text-muted-foreground mb-6">
              Something went wrong. The application will reload to recover.
            </p>
            
            {(isAndroid || isSamsung) && (
              <div className="text-xs bg-blue-50 dark:bg-blue-950 p-4 rounded-lg mb-6 text-left border border-blue-200 dark:border-blue-800">
                <p className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  📱 {isSamsung ? 'Samsung' : 'Android'} Device Detected
                </p>
                <p className="text-blue-800 dark:text-blue-200 mb-3">
                  This crash is often caused by Android WebView cache. To fix:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-blue-800 dark:text-blue-200 mb-3">
                  <li>Settings → Apps → Show system apps</li>
                  <li>Find "Android System WebView"</li>
                  <li>Storage → Clear cache → Clear data</li>
                  <li>Update WebView in Play Store</li>
                  <li>Restart phone and try again</li>
                </ol>
                <button
                  onClick={() => window.location.href = '/diagnostic'}
                  className="w-full text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline"
                >
                  View detailed diagnostic info →
                </button>
              </div>
            )}
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="text-xs text-left bg-muted/50 p-4 rounded-lg mb-6">
                <p className="font-semibold mb-2">Error Details:</p>
                <p className="text-destructive">{this.state.error.message}</p>
              </div>
            )}
            
            <button
              onClick={this.handleReload}
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 px-6 rounded-lg transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}