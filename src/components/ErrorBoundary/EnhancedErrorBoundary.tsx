
import React from 'react';
import { AlertTriangle, RefreshCw, Home, Smartphone, Wifi } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
  retryCount: number;
  deviceInfo: {
    isIOS: boolean;
    isSafari: boolean;
    isInTelegram: boolean;
    viewportHeight: number;
    hasTouch: boolean;
  };
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
}

export class EnhancedErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private maxRetries = 3;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    
    const userAgent = typeof window !== 'undefined' ? navigator.userAgent : '';
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
    const isInTelegram = !!(window as any).Telegram?.WebApp;
    const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 0;
    const hasTouch = typeof window !== 'undefined' ? 'ontouchstart' in window : false;

    this.state = { 
      hasError: false, 
      retryCount: 0,
      deviceInfo: {
        isIOS,
        isSafari,
        isInTelegram,
        viewportHeight,
        hasTouch
      }
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🚨 Enhanced ErrorBoundary caught error:', error);
    console.error('🚨 Component stack:', errorInfo.componentStack);
    console.error('🚨 Device info:', this.state.deviceInfo);
    
    this.setState({ errorInfo });
    
    // Log to analytics for debugging iPhone-specific issues
    if (this.state.deviceInfo.isIOS) {
      console.error('🍎 iOS-specific error detected:', {
        error: error.message,
        stack: error.stack,
        deviceInfo: this.state.deviceInfo,
        viewport: {
          height: window.innerHeight,
          width: window.innerWidth,
          devicePixelRatio: window.devicePixelRatio
        }
      });
    }

    // Prevent page reload in Telegram
    if (this.state.deviceInfo.isInTelegram) {
      console.log('📱 In Telegram - preventing page reload');
    }
  }

  handleSoftRetry = () => {
    const newRetryCount = this.state.retryCount + 1;
    
    if (newRetryCount <= this.maxRetries) {
      console.log(`🔄 Soft retry attempt ${newRetryCount}/${this.maxRetries}`);
      
      // iOS-specific retry logic
      if (this.state.deviceInfo.isIOS) {
        // Force viewport recalculation on iOS
        if (window.Telegram?.WebApp) {
          try {
            window.Telegram.WebApp.expand();
            // Update viewport height
            document.documentElement.style.setProperty('--tg-viewport-height', `${window.innerHeight}px`);
          } catch (e) {
            console.warn('Failed to expand Telegram WebApp:', e);
          }
        }
      }
      
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
    
    this.setState({ 
      hasError: false, 
      error: undefined, 
      errorInfo: undefined,
      retryCount: 0
    });
    
    // Use hash navigation for single-page apps
    if (window.location.hash !== '#/' && window.location.hash !== '#/dashboard') {
      window.location.hash = '#/dashboard';
    }
  };

  handleForceRefresh = () => {
    console.log('⚠️ Force refresh requested');
    
    if (this.state.deviceInfo.isInTelegram) {
      try {
        window.Telegram?.WebApp?.close?.();
      } catch {
        window.location.reload();
      }
    } else {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      const { error, errorInfo, retryCount, deviceInfo } = this.state;
      const canRetry = retryCount < this.maxRetries;
      
      // Use custom fallback if provided
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={error!} retry={this.handleSoftRetry} />;
      }
      
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
              
              {/* Device-specific messaging */}
              <div className="flex flex-wrap gap-2 justify-center mt-4">
                {deviceInfo.isIOS && (
                  <Badge variant="outline" className="text-xs">
                    <Smartphone className="w-3 h-3 mr-1" />
                    iOS Device
                  </Badge>
                )}
                {deviceInfo.isInTelegram && (
                  <Badge variant="outline" className="text-xs">
                    📱 Telegram Mini App
                  </Badge>
                )}
                {!navigator.onLine && (
                  <Badge variant="destructive" className="text-xs">
                    <Wifi className="w-3 h-3 mr-1" />
                    Offline
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-slate-700 space-y-2">
                <p>Don't worry - this won't close your Telegram app.</p>
                
                {deviceInfo.isIOS && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-blue-800 font-medium">iOS Tips:</p>
                    <ul className="text-blue-700 text-xs mt-1 space-y-1">
                      <li>• Try rotating your device</li>
                      <li>• Check your internet connection</li>
                      <li>• Make sure Telegram is up to date</li>
                    </ul>
                  </div>
                )}
                
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
                      {'\n\n'}<strong>Device Info:</strong> {JSON.stringify(deviceInfo, null, 2)}
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
                  Go Home
                </Button>
              </div>
              
              <div className="text-xs text-slate-500 text-center">
                Error #{retryCount + 1} • 
                {deviceInfo.isInTelegram ? ' Telegram Mini App' : ' Web Browser'} • 
                {deviceInfo.isIOS ? ' iOS' : ' Other OS'}
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
