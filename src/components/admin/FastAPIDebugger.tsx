
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { API_BASE_URL, getCurrentUserId } from '@/lib/api';
import { getBackendAccessToken } from '@/lib/api/secureConfig';
import { AlertCircle, CheckCircle, RefreshCw, Wifi, WifiOff } from 'lucide-react';

interface DiagnosticResult {
  step: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: any;
}

export function FastAPIDebugger() {
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'disconnected'>('unknown');

  const runDiagnostics = async () => {
    setIsRunning(true);
    setDiagnostics([]);
    const results: DiagnosticResult[] = [];

    // Step 1: Check configuration
    results.push({
      step: 'Configuration Check',
      status: 'success',
      message: `FastAPI URL: ${API_BASE_URL}`,
      details: { url: API_BASE_URL }
    });

    // Step 2: Check user ID
    const userId = getCurrentUserId();
    results.push({
      step: 'User ID Check',
      status: userId === 2138564172 ? 'success' : 'warning',
      message: `Current User ID: ${userId} ${userId === 2138564172 ? '(Admin)' : '(Not Admin)'}`,
      details: { userId, isAdmin: userId === 2138564172 }
    });

    // Step 3: Check backend access token
    try {
      const token = await getBackendAccessToken();
      results.push({
        step: 'Backend Token Check',
        status: token ? 'success' : 'error',
        message: token ? 'Backend access token available' : 'Backend access token missing',
        details: { hasToken: !!token, tokenLength: token ? token.length : 0 }
      });
    } catch (error) {
      results.push({
        step: 'Backend Token Check',
        status: 'error',
        message: `Token retrieval failed: ${error}`,
        details: { error: error instanceof Error ? error.message : String(error) }
      });
    }

    // Step 4: Test backend connectivity
    try {
      const testUrl = `${API_BASE_URL}/`;
      const response = await fetch(testUrl, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Accept': 'application/json',
        },
      });

      results.push({
        step: 'Backend Connectivity',
        status: response.ok ? 'success' : 'error',
        message: `Backend responded with status: ${response.status}`,
        details: { 
          status: response.status, 
          statusText: response.statusText,
          url: testUrl
        }
      });

      setConnectionStatus(response.ok ? 'connected' : 'disconnected');
    } catch (error) {
      results.push({
        step: 'Backend Connectivity',
        status: 'error',
        message: `Cannot reach backend: ${error}`,
        details: { error: error instanceof Error ? error.message : String(error) }
      });
      setConnectionStatus('disconnected');
    }

    // Step 5: Test diamonds endpoint
    try {
      const token = await getBackendAccessToken();
      const diamondsUrl = `${API_BASE_URL}/api/v1/get_all_stones?user_id=${userId}`;
      
      const response = await fetch(diamondsUrl, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const diamondCount = Array.isArray(data) ? data.length : (data?.data?.length || 0);
        
        results.push({
          step: 'Diamonds Endpoint Test',
          status: diamondCount > 0 ? 'success' : 'warning',
          message: `Found ${diamondCount} diamonds in your inventory`,
          details: { 
            diamondCount, 
            dataType: typeof data,
            isArray: Array.isArray(data),
            sampleData: diamondCount > 0 ? data[0] || data.data?.[0] : null
          }
        });
      } else {
        const errorText = await response.text();
        results.push({
          step: 'Diamonds Endpoint Test',
          status: 'error',
          message: `Diamonds endpoint failed: ${response.status} - ${errorText}`,
          details: { status: response.status, error: errorText }
        });
      }
    } catch (error) {
      results.push({
        step: 'Diamonds Endpoint Test',
        status: 'error',
        message: `Diamonds endpoint error: ${error}`,
        details: { error: error instanceof Error ? error.message : String(error) }
      });
    }

    setDiagnostics(results);
    setIsRunning(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {connectionStatus === 'connected' ? (
                <Wifi className="h-5 w-5 text-green-600" />
              ) : connectionStatus === 'disconnected' ? (
                <WifiOff className="h-5 w-5 text-red-600" />
              ) : (
                <RefreshCw className="h-5 w-5 text-gray-400" />
              )}
              FastAPI Connection Diagnostics
            </CardTitle>
            <CardDescription>
              Debugging why you're seeing mock data instead of your real 500+ diamonds
            </CardDescription>
          </div>
          <Button 
            onClick={runDiagnostics} 
            disabled={isRunning}
            size="sm"
          >
            {isRunning ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            {isRunning ? 'Running...' : 'Run Diagnostics'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {diagnostics.map((result, index) => (
          <div key={index} className={`p-3 rounded-lg border ${getStatusColor(result.status)}`}>
            <div className="flex items-start gap-3">
              {getStatusIcon(result.status)}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">{result.step}</span>
                  <Badge variant={result.status === 'success' ? 'default' : result.status === 'error' ? 'destructive' : 'secondary'}>
                    {result.status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">{result.message}</p>
                {result.details && (
                  <details className="text-xs">
                    <summary className="cursor-pointer text-gray-500 hover:text-gray-700">
                      Show technical details
                    </summary>
                    <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                      {JSON.stringify(result.details, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {diagnostics.length === 0 && isRunning && (
          <div className="text-center py-4">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-500">Running diagnostics...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
