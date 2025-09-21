import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { tokenManager } from '@/lib/api/tokenManager';
import { getBackendAuthToken } from '@/lib/api/auth';
import { getCurrentUserId } from '@/lib/api/config';
import { Separator } from '@/components/ui/separator';

export function AuthDiagnostics() {
  const auth = useTelegramAuth();
  const [diagnostics, setDiagnostics] = useState<any>({});
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    // Capture console logs
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    const logCapture = (level: string) => (...args: any[]) => {
      const message = `[${level.toUpperCase()}] ${new Date().toLocaleTimeString()}: ${args.join(' ')}`;
      if (message.includes('AUTH') || message.includes('telegram') || message.includes('initData') || message.includes('JWT')) {
        setLogs(prev => [...prev.slice(-19), message]);
      }
    };

    console.log = (...args) => {
      originalLog(...args);
      logCapture('log')(...args);
    };

    console.error = (...args) => {
      originalError(...args);
      logCapture('error')(...args);
    };

    console.warn = (...args) => {
      originalWarn(...args);
      logCapture('warn')(...args);
    };

    return () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  const refreshDiagnostics = () => {
    const tg = (window as any).Telegram?.WebApp;
    const metrics = tokenManager.getPerformanceMetrics();
    
    setDiagnostics({
      timestamp: new Date().toISOString(),
      environment: {
        isTelegramWebApp: !!tg,
        hasInitData: !!tg?.initData,
        initDataLength: tg?.initData?.length || 0,
        platform: tg?.platform || 'unknown',
        version: tg?.version || 'unknown',
        userAgent: navigator.userAgent
      },
      authState: {
        isAuthenticated: auth.isAuthenticated,
        isLoading: auth.isLoading,
        isTelegramEnvironment: auth.isTelegramEnvironment,
        error: auth.error,
        accessDeniedReason: auth.accessDeniedReason,
        user: auth.user ? {
          id: auth.user.id,
          first_name: auth.user.first_name,
          username: auth.user.username
        } : null
      },
      tokens: {
        hasBackendToken: !!getBackendAuthToken(),
        backendTokenLength: getBackendAuthToken()?.length || 0,
        currentUserId: getCurrentUserId(),
        tokenManagerMetrics: metrics
      },
      telegram: {
        initDataSample: tg?.initData?.substring(0, 100) + '...' || 'No initData',
        themeParams: tg?.themeParams || null,
        user: tg?.initDataUnsafe?.user || null
      }
    });
  };

  useEffect(() => {
    refreshDiagnostics();
  }, [auth]);

  const testAuth = () => {
    console.log('🔍 AUTH DIAGNOSTICS: Starting manual authentication test');
    const tg = (window as any).Telegram?.WebApp;
    
    if (!tg) {
      console.error('❌ AUTH DIAGNOSTICS: No Telegram WebApp found');
      return;
    }

    if (!tg.initData) {
      console.error('❌ AUTH DIAGNOSTICS: No initData available');
      return;
    }

    console.log('🔍 AUTH DIAGNOSTICS: InitData available, length:', tg.initData.length);
    console.log('🔍 AUTH DIAGNOSTICS: InitData sample:', tg.initData.substring(0, 200));
    
    // Force re-authentication
    window.location.reload();
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔍 Authentication Diagnostics
          <Button onClick={refreshDiagnostics} size="sm" variant="outline">
            Refresh
          </Button>
          <Button onClick={testAuth} size="sm" variant="default">
            Test Auth
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Status */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Badge variant={auth.isAuthenticated ? "default" : "destructive"}>
            {auth.isAuthenticated ? "✅ Authenticated" : "❌ Not Authenticated"}
          </Badge>
          <Badge variant={auth.isTelegramEnvironment ? "default" : "secondary"}>
            {auth.isTelegramEnvironment ? "📱 Telegram" : "🌐 Web"}
          </Badge>
          <Badge variant={auth.isLoading ? "outline" : "secondary"}>
            {auth.isLoading ? "⏳ Loading" : "✅ Ready"}
          </Badge>
          <Badge variant={!!getBackendAuthToken() ? "default" : "destructive"}>
            {!!getBackendAuthToken() ? "🔑 Has JWT" : "❌ No JWT"}
          </Badge>
        </div>

        {/* Real-time Logs */}
        <div>
          <h3 className="font-semibold mb-2">🔄 Live Auth Logs (Last 20)</h3>
          <div className="bg-gray-900 text-green-400 p-3 rounded-md text-xs font-mono h-32 overflow-y-auto">
            {logs.length === 0 ? (
              <div className="text-gray-500">No auth logs yet... Waiting for authentication activity.</div>
            ) : (
              logs.map((log, i) => (
                <div key={i} className="whitespace-pre-wrap">{log}</div>
              ))
            )}
          </div>
        </div>

        <Separator />

        {/* Detailed Diagnostics */}
        <div>
          <h3 className="font-semibold mb-2">📊 Full Diagnostics</h3>
          <pre className="bg-gray-100 p-3 rounded-md text-xs overflow-auto max-h-64">
            {JSON.stringify(diagnostics, null, 2)}
          </pre>
        </div>

        {/* Error Details */}
        {auth.error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <h3 className="font-semibold text-red-800 mb-1">❌ Authentication Error</h3>
            <p className="text-red-600 text-sm">{auth.error}</p>
          </div>
        )}

        {auth.accessDeniedReason && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
            <h3 className="font-semibold text-yellow-800 mb-1">⚠️ Access Denied</h3>
            <p className="text-yellow-600 text-sm">Reason: {auth.accessDeniedReason}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}