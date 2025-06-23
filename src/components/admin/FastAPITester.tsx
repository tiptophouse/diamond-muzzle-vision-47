import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { api, apiEndpoints, getCurrentUserId } from '@/lib/api';
import { CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface TestResult {
  endpoint: string;
  method: string;
  status: 'pending' | 'success' | 'error' | 'warning';
  message: string;
  responseTime?: number;
  statusCode?: number;
}

export function FastAPITester() {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const userId = getCurrentUserId() || 2138564172;

  const testEndpoints = async () => {
    setTesting(true);
    setResults([]);
    const testResults: TestResult[] = [];

    // Test 1: Backend Connectivity
    const connectivityTest = async (): Promise<TestResult> => {
      const startTime = Date.now();
      try {
        console.log('🔍 Testing FastAPI backend connectivity...');
        const response = await fetch('https://api.mazalbot.com/', {
          method: 'GET',
          mode: 'cors',
        });
        const responseTime = Date.now() - startTime;
        
        if (response.ok || response.status === 404) {
          return {
            endpoint: 'https://api.mazalbot.com/',
            method: 'GET',
            status: 'success',
            message: 'FastAPI backend is reachable',
            responseTime,
            statusCode: response.status
          };
        }
        
        return {
          endpoint: 'https://api.mazalbot.com/',
          method: 'GET',
          status: 'error',
          message: `Backend returned status ${response.status}`,
          responseTime,
          statusCode: response.status
        };
      } catch (error) {
        return {
          endpoint: 'https://api.mazalbot.com/',
          method: 'GET',
          status: 'error',
          message: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          responseTime: Date.now() - startTime
        };
      }
    };

    // Test 2: Get All Stones
    const getAllStonesTest = async (): Promise<TestResult> => {
      const startTime = Date.now();
      try {
        console.log('🔍 Testing GET all stones endpoint...');
        const endpoint = apiEndpoints.getAllStones(userId);
        const result = await api.get(endpoint);
        const responseTime = Date.now() - startTime;
        
        if (result.error) {
          return {
            endpoint,
            method: 'GET',
            status: 'error',
            message: `Failed: ${result.error}`,
            responseTime
          };
        }
        
        if (result.data && Array.isArray(result.data)) {
          return {
            endpoint,
            method: 'GET',
            status: 'success',
            message: `Success: Found ${result.data.length} diamonds`,
            responseTime
          };
        }
        
        return {
          endpoint,
          method: 'GET',
          status: 'warning',
          message: 'Endpoint accessible but returned unexpected data format',
          responseTime
        };
      } catch (error) {
        return {
          endpoint: apiEndpoints.getAllStones(userId),
          method: 'GET',
          status: 'error',
          message: `Request failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          responseTime: Date.now() - startTime
        };
      }
    };

    // Test 3: Add Diamond (POST)
    const addDiamondTest = async (): Promise<TestResult> => {
      const startTime = Date.now();
      try {
        console.log('🔍 Testing POST add diamond endpoint...');
        const testDiamond = {
          user_id: userId,
          stock_number: `TEST_${Date.now()}`,
          shape: 'Round',
          weight: 1.0,
          color: 'D',
          clarity: 'FL',
          cut: 'Excellent',
          price: 5000,
          price_per_carat: 5000,
          status: 'Available',
          picture: '',
          certificate_number: `TEST_CERT_${Date.now()}`,
          certificate_url: '',
          lab: 'GIA',
          store_visible: false
        };
        
        const endpoint = apiEndpoints.addDiamond(userId);
        const result = await api.post(endpoint, testDiamond);
        const responseTime = Date.now() - startTime;
        
        if (result.error) {
          return {
            endpoint,
            method: 'POST',
            status: 'error',
            message: `Failed: ${result.error}`,
            responseTime
          };
        }
        
        return {
          endpoint,
          method: 'POST',
          status: 'success',
          message: `Success: Diamond added with stock number ${testDiamond.stock_number}`,
          responseTime
        };
      } catch (error) {
        return {
          endpoint: apiEndpoints.addDiamond(userId),
          method: 'POST',
          status: 'error',
          message: `Request failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          responseTime: Date.now() - startTime
        };
      }
    };

    // Test 4: Delete Diamond (DELETE)
    const deleteDiamondTest = async (): Promise<TestResult> => {
      const startTime = Date.now();
      try {
        console.log('🔍 Testing DELETE diamond endpoint...');
        const testStockNumber = `TEST_${Date.now()}`;
        const endpoint = apiEndpoints.deleteDiamond(testStockNumber, userId);
        const result = await api.delete(endpoint);
        const responseTime = Date.now() - startTime;
        
        // For delete, we expect either success or a "not found" error
        if (result.error && !result.error.includes('not found') && !result.error.includes('404')) {
          return {
            endpoint,
            method: 'DELETE',
            status: 'error',
            message: `Failed: ${result.error}`,
            responseTime
          };
        }
        
        return {
          endpoint,
          method: 'DELETE',
          status: 'success',
          message: 'Endpoint accessible (tested with non-existent diamond)',
          responseTime
        };
      } catch (error) {
        return {
          endpoint: apiEndpoints.deleteDiamond('TEST_ID', userId),
          method: 'DELETE',
          status: 'error',
          message: `Request failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          responseTime: Date.now() - startTime
        };
      }
    };

    // Run all tests
    console.log('🧪 Starting FastAPI endpoint tests...');
    
    // Test connectivity first
    testResults.push(await connectivityTest());
    setResults([...testResults]);

    // Test GET endpoints
    testResults.push(await getAllStonesTest());
    setResults([...testResults]);

    // Test POST endpoint
    testResults.push(await addDiamondTest());
    setResults([...testResults]);

    // Test DELETE endpoint
    testResults.push(await deleteDiamondTest());
    setResults([...testResults]);

    setTesting(false);

    // Show summary toast
    const successCount = testResults.filter(r => r.status === 'success').length;
    const totalTests = testResults.length;
    
    if (successCount === totalTests) {
      toast({
        title: "✅ All Tests Passed",
        description: `FastAPI integration is working perfectly! (${successCount}/${totalTests})`,
      });
    } else {
      toast({
        variant: "destructive",
        title: "❌ Some Tests Failed",
        description: `${successCount}/${totalTests} tests passed. Check results for details.`,
      });
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-blue-500" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    const variants = {
      success: 'default',
      error: 'destructive',
      warning: 'secondary',
      pending: 'outline'
    } as const;
    
    return (
      <Badge variant={variants[status]} className="ml-2">
        {status.toUpperCase()}
      </Badge>
    );
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          FastAPI Endpoint Testing
          <Button 
            onClick={testEndpoints} 
            disabled={testing}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {testing ? 'Testing...' : 'Run Tests'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground mb-4">
            Testing connection to FastAPI backend at: <code>https://api.mazalbot.com</code>
            <br />
            User ID: <code>{userId}</code>
          </div>
          
          {results.length === 0 && !testing && (
            <div className="text-center py-8 text-muted-foreground">
              Click "Run Tests" to verify FastAPI endpoint connectivity
            </div>
          )}
          
          {testing && results.length === 0 && (
            <div className="text-center py-8">
              <Clock className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-500" />
              <p className="text-muted-foreground">Starting endpoint tests...</p>
            </div>
          )}
          
          {results.map((result, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {getStatusIcon(result.status)}
                  <span className="font-medium ml-2">{result.method}</span>
                  <code className="ml-2 text-sm bg-muted px-2 py-1 rounded">
                    {result.endpoint}
                  </code>
                  {getStatusBadge(result.status)}
                </div>
                {result.responseTime && (
                  <span className="text-sm text-muted-foreground">
                    {result.responseTime}ms
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground ml-7">
                {result.message}
                {result.statusCode && ` (Status: ${result.statusCode})`}
              </p>
            </div>
          ))}
          
          {results.length > 0 && !testing && (
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Test Summary</h4>
              <div className="text-sm space-y-1">
                <p>✅ Passed: {results.filter(r => r.status === 'success').length}</p>
                <p>❌ Failed: {results.filter(r => r.status === 'error').length}</p>
                <p>⚠️ Warnings: {results.filter(r => r.status === 'warning').length}</p>
                <p>📊 Total: {results.length}</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
