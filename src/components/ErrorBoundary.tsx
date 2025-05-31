
import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRefresh = () => {
    // Reset the error boundary state
    this.setState({ hasError: false, error: undefined });
    
    // Force reload the page
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
          <Card className="w-full max-w-md border-slate-200">
            <CardHeader className="text-center">
              <div className="mx-auto w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                <div className="text-4xl">🐥</div>
              </div>
              <CardTitle className="text-slate-800">Oops...</CardTitle>
              <CardDescription className="text-slate-600">
                Failed to load mazalbot.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-slate-700 space-y-2">
                <p>Something went wrong while loading the application.</p>
                <details className="text-xs">
                  <summary className="cursor-pointer">Error details</summary>
                  <pre className="mt-2 p-2 bg-slate-50 rounded text-slate-600 whitespace-pre-wrap overflow-auto max-h-32">
                    {this.state.error?.message || 'Unknown error'}
                  </pre>
                </details>
              </div>
              <Button 
                onClick={this.handleRefresh} 
                className="w-full bg-blue-500 hover:bg-blue-600 text-white"
              >
                <RefreshCw size={16} className="mr-2" />
                Refresh
              </Button>
              <div className="text-xs text-slate-500 text-center">
                If the problem persists, please contact support
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
