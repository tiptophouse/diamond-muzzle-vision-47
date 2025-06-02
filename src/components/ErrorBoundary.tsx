
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
  private maxRetries = 1; // Reduced for better stability

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, retryCount: 0 };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🚨 ErrorBoundary caught error:', error);
    console.error('🚨 Component stack:', errorInfo.componentStack);
    
    this.setState({ errorInfo });
    
    // Critical: Never reload in Telegram environment to prevent crashes
    if (window.Telegram?.WebApp) {
      console.log('📱 In Telegram - using safe recovery mode');
    }
  }

  handleSoftRetry = () => {
    const newRetryCount = this.state.retryCount + 1;
    
    if (newRetryCount <= this.maxRetries) {
      console.log(`🔄 Soft retry attempt ${newRetryCount}/${this.maxRetries}`);
      
      // Soft reset without page reload
      this.setState({ 
        hasError: false, 
        error: undefined, 
        errorInfo: undefined,
        retryCount: newRetryCount
      });
    } else {
      console.log('❌ Max retries reached');
    }
  };

  handleGoHome = () => {
    console.log('🏠 Safe navigation to home');
    
    // Reset error state
    this.setState({ 
      hasError: false, 
      error: undefined, 
      errorInfo: undefined,
      retryCount: 0
    });
    
    // Use hash navigation to prevent crashes
    window.location.hash = '#/';
  };

  handleForceRefresh = () => {
    console.log('⚠️ Emergency refresh - last resort');
    
    if (window.Telegram?.WebApp) {
      try {
        // Try to close Telegram app instead of refresh
        window.Telegram.WebApp.close();
      } catch {
        // If close fails, show warning instead of reload
        alert('Please close and reopen the app from Telegram');
      }
    } else {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      const { error, retryCount } = this.state;
      const canRetry = retryCount < this.maxRetries;
      
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
          <Card className="w-full max-w-lg border-slate-200">
            <CardHeader className="text-center">
              <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="h-10 w-10 text-red-600" />
              </div>
              <CardTitle className="text-slate-800">App Recovery Mode</CardTitle>
              <CardDescription className="text-slate-600">
                The app encountered an issue but can be recovered safely.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-slate-700 space-y-2">
                <p>✅ Telegram app will remain open</p>
                <p>🔄 Attempting automatic recovery...</p>
              </div>
              
              <div className="flex gap-2 flex-col sm:flex-row">
                {canRetry ? (
                  <Button 
                    onClick={this.handleSoftRetry} 
                    className="bg-blue-500 hover:bg-blue-600 text-white flex-1"
                  >
                    <RefreshCw size={16} className="mr-2" />
                    Recover App
                  </Button>
                ) : (
                  <Button 
                    onClick={this.handleGoHome} 
                    className="bg-green-500 hover:bg-green-600 text-white flex-1"
                  >
                    <Home size={16} className="mr-2" />
                    Go to Home
                  </Button>
                )}
                
                <Button 
                  onClick={this.handleForceRefresh} 
                  variant="outline"
                  className="flex-1"
                >
                  Emergency Reset
                </Button>
              </div>
              
              <div className="text-xs text-slate-500 text-center">
                Crash #{retryCount + 1} • Safe mode active
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
