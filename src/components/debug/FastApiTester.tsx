
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { secureApiClient } from '@/lib/api/secureClient';
import { telegramAuthService } from '@/services/telegramAuth';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { toast } from 'sonner';

interface TestResult {
  endpoint: string;
  method: string;
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export function FastApiTester() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [testing, setTesting] = useState(false);
  const { user, isAuthenticated } = useTelegramAuth();

  const addResult = (result: TestResult) => {
    setResults(prev => [...prev, { ...result, timestamp: new Date().toISOString() }]);
  };

  const clearResults = () => {
    setResults([]);
  };

  const testAuthentication = async () => {
    console.log('🧪 Testing Telegram authentication...');
    
    if (!window.Telegram?.WebApp?.initData) {
      addResult({
        endpoint: '/api/v1/sign-in/',
        method: 'POST',
        success: false,
        message: 'No Telegram InitData available',
        error: 'Not in Telegram environment'
      });
      return false;
    }

    try {
      const authResult = await telegramAuthService.authenticateWithInitData(
        window.Telegram.WebApp.initData
      );

      if (authResult.success) {
        addResult({
          endpoint: '/api/v1/sign-in/',
          method: 'POST',
          success: true,
          message: 'Authentication successful',
          data: { user_id: authResult.user.id }
        });
        return true;
      } else {
        addResult({
          endpoint: '/api/v1/sign-in/',
          method: 'POST',
          success: false,
          message: 'Authentication failed',
          error: authResult.error
        });
        return false;
      }
    } catch (error) {
      addResult({
        endpoint: '/api/v1/sign-in/',
        method: 'POST',
        success: false,
        message: 'Authentication error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    }
  };

  const testGetDiamonds = async () => {
    console.log('🧪 Testing get all diamonds...');
    
    try {
      const response = await secureApiClient.get('/api/v1/diamonds/');
      
      if (response.success) {
        const count = Array.isArray(response.data) ? response.data.length : 0;
        addResult({
          endpoint: '/api/v1/diamonds/',
          method: 'GET',
          success: true,
          message: `Retrieved ${count} diamonds`,
          data: { count, sample: response.data?.[0] }
        });
        return true;
      } else {
        addResult({
          endpoint: '/api/v1/diamonds/',
          method: 'GET',
          success: false,
          message: 'Failed to get diamonds',
          error: response.error
        });
        return false;
      }
    } catch (error) {
      addResult({
        endpoint: '/api/v1/diamonds/',
        method: 'GET',
        success: false,
        message: 'Get diamonds error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    }
  };

  const testAddDiamond = async () => {
    console.log('🧪 Testing add diamond...');
    
    const testDiamond = {
      stock: `TEST-${Date.now()}`,
      shape: "round brilliant",
      weight: 1.0,
      color: "D",
      clarity: "FL",
      lab: "GIA",
      certificate_number: Math.floor(Math.random() * 1000000),
      length: 6.5,
      width: 6.5,
      depth: 4.0,
      ratio: 1.0,
      cut: "EXCELLENT",
      polish: "EXCELLENT",
      symmetry: "EXCELLENT",
      fluorescence: "NONE",
      table: 57,
      depth_percentage: 62,
      gridle: "Medium",
      culet: "NONE",
      certificate_comment: "API Test Diamond",
      rapnet: -10,
      price_per_carat: 5000,
      picture: ""
    };

    try {
      const response = await secureApiClient.post('/api/v1/diamonds/', testDiamond);
      
      if (response.success) {
        addResult({
          endpoint: '/api/v1/diamonds/',
          method: 'POST',
          success: true,
          message: 'Diamond added successfully',
          data: { stock: testDiamond.stock, id: response.data?.id }
        });
        return response.data;
      } else {
        addResult({
          endpoint: '/api/v1/diamonds/',
          method: 'POST',
          success: false,
          message: 'Failed to add diamond',
          error: response.error
        });
        return null;
      }
    } catch (error) {
      addResult({
        endpoint: '/api/v1/diamonds/',
        method: 'POST',
        success: false,
        message: 'Add diamond error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return null;
    }
  };

  const testUpdateDiamond = async (diamondId: string) => {
    console.log('🧪 Testing update diamond...');
    
    const updateData = {
      price_per_carat: 5500,
      certificate_comment: "Updated API Test Diamond"
    };

    try {
      const response = await secureApiClient.put(`/api/v1/diamonds/${diamondId}`, updateData);
      
      if (response.success) {
        addResult({
          endpoint: `/api/v1/diamonds/${diamondId}`,
          method: 'PUT',
          success: true,
          message: 'Diamond updated successfully',
          data: { id: diamondId, updates: updateData }
        });
        return true;
      } else {
        addResult({
          endpoint: `/api/v1/diamonds/${diamondId}`,
          method: 'PUT',
          success: false,
          message: 'Failed to update diamond',
          error: response.error
        });
        return false;
      }
    } catch (error) {
      addResult({
        endpoint: `/api/v1/diamonds/${diamondId}`,
        method: 'PUT',
        success: false,
        message: 'Update diamond error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    }
  };

  const testDeleteDiamond = async (diamondId: string) => {
    console.log('🧪 Testing delete diamond...');
    
    try {
      const response = await secureApiClient.delete(`/api/v1/diamonds/${diamondId}`);
      
      if (response.success) {
        addResult({
          endpoint: `/api/v1/diamonds/${diamondId}`,
          method: 'DELETE',
          success: true,
          message: 'Diamond deleted successfully',
          data: { id: diamondId }
        });
        return true;
      } else {
        addResult({
          endpoint: `/api/v1/diamonds/${diamondId}`,
          method: 'DELETE',
          success: false,
          message: 'Failed to delete diamond',
          error: response.error
        });
        return false;
      }
    } catch (error) {
      addResult({
        endpoint: `/api/v1/diamonds/${diamondId}`,
        method: 'DELETE',
        success: false,
        message: 'Delete diamond error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    }
  };

  const runAllTests = async () => {
    setTesting(true);
    clearResults();
    
    try {
      toast.info('Running comprehensive FastAPI tests...');
      
      // Test 1: Authentication
      const authSuccess = await testAuthentication();
      if (!authSuccess) {
        toast.error('Authentication test failed - stopping tests');
        return;
      }

      // Test 2: Get diamonds
      await testGetDiamonds();

      // Test 3: Add diamond
      const newDiamond = await testAddDiamond();
      
      if (newDiamond?.id) {
        // Test 4: Update diamond
        await testUpdateDiamond(newDiamond.id);
        
        // Test 5: Delete diamond
        await testDeleteDiamond(newDiamond.id);
      }

      toast.success('All FastAPI tests completed!');
      
    } catch (error) {
      console.error('Test suite error:', error);
      toast.error('Test suite encountered an error');
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          FastAPI Integration Tester
          <Badge variant={isAuthenticated ? "default" : "destructive"}>
            {isAuthenticated ? "Authenticated" : "Not Authenticated"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={runAllTests} disabled={testing}>
            {testing ? "Running Tests..." : "🧪 Run All Tests"}
          </Button>
          <Button variant="outline" onClick={clearResults}>
            Clear Results
          </Button>
        </div>

        {user && (
          <div className="text-sm text-muted-foreground">
            Testing as: {user.first_name} {user.last_name} (ID: {user.id})
          </div>
        )}

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {results.map((result, index) => (
            <Card key={index} className={`border-l-4 ${
              result.success ? 'border-l-green-500' : 'border-l-red-500'
            }`}>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-sm">
                    {result.method} {result.endpoint}
                  </span>
                  <Badge variant={result.success ? "default" : "destructive"}>
                    {result.success ? "✅ Success" : "❌ Failed"}
                  </Badge>
                </div>
                <p className="text-sm mb-2">{result.message}</p>
                {result.error && (
                  <p className="text-sm text-red-600 font-mono bg-red-50 p-2 rounded">
                    {result.error}
                  </p>
                )}
                {result.data && (
                  <details className="text-xs">
                    <summary className="cursor-pointer text-muted-foreground">
                      View Response Data
                    </summary>
                    <pre className="mt-2 bg-gray-50 p-2 rounded overflow-x-auto">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </details>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
