import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { getCurrentUserId } from '@/lib/api/config';
import { getBackendAuthToken, signInToBackend } from '@/lib/api/auth';
import { apiEndpoints } from '@/lib/api/endpoints';
import { api } from '@/lib/api/client';
import { getTelegramWebApp } from '@/utils/telegramWebApp';

export function InventoryDebugger() {
  const { user, isAuthenticated } = useTelegramAuth();
  const [status, setStatus] = useState('Ready to test');
  const [apiData, setApiData] = useState<any>(null);

  const testAuthentication = async () => {
    try {
      setStatus('🔄 Testing authentication...');
      
      const tg = getTelegramWebApp();
      const initData = tg?.initData;
      
      if (!initData) {
        setStatus('❌ No Telegram initData available');
        return;
      }

      setStatus('🔄 Signing in to FastAPI...');
      const token = await signInToBackend(initData);
      
      if (token) {
        setStatus('✅ Authentication successful!');
      } else {
        setStatus('❌ Authentication failed');
      }
    } catch (error) {
      setStatus(`❌ Auth error: ${error instanceof Error ? error.message : 'Unknown'}`);
    }
  };

  const testInventoryAPI = async () => {
    try {
      setStatus('🔄 Testing inventory API...');
      
      const userId = getCurrentUserId() || user?.id;
      if (!userId) {
        setStatus('❌ No user ID available');
        return;
      }

      const token = getBackendAuthToken();
      if (!token) {
        setStatus('❌ No auth token - run authentication first');
        return;
      }

      setStatus('🔄 Calling FastAPI inventory endpoint...');
      const endpoint = apiEndpoints.getAllStones(userId);
      console.log('🔍 DEBUGGER: Calling endpoint:', endpoint);
      
      const response = await api.get(endpoint);
      
      if (response.data) {
        setApiData(response.data);
        setStatus(`✅ Got ${Array.isArray(response.data) ? response.data.length : 'data'} from FastAPI!`);
      } else if (response.error) {
        setStatus(`❌ API error: ${response.error}`);
      } else {
        setStatus('❌ No data received');
      }
    } catch (error) {
      setStatus(`❌ API error: ${error instanceof Error ? error.message : 'Unknown'}`);
    }
  };

  const testFullFlow = async () => {
    await testAuthentication();
    setTimeout(async () => {
      await testInventoryAPI();
    }, 1000);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto mt-4">
      <CardHeader>
        <CardTitle>FastAPI Inventory Debugger</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div><strong>User:</strong> {user ? `${user.first_name} (${user.id})` : 'None'}</div>
          <div><strong>Authenticated:</strong> {isAuthenticated ? '✅' : '❌'}</div>
          <div><strong>Current User ID:</strong> {getCurrentUserId() || 'None'}</div>
          <div><strong>Auth Token:</strong> {getBackendAuthToken() ? '✅' : '❌'}</div>
        </div>
        
        <div className="p-4 bg-gray-50 rounded text-sm">
          <strong>Status:</strong> {status}
        </div>

        <div className="flex gap-2">
          <Button onClick={testAuthentication} variant="outline">
            Test Auth
          </Button>
          <Button onClick={testInventoryAPI} variant="outline">
            Test API
          </Button>
          <Button onClick={testFullFlow} className="bg-blue-600 hover:bg-blue-700">
            Test Full Flow
          </Button>
        </div>

        {apiData && (
          <div className="mt-4">
            <h4 className="font-medium mb-2">API Response:</h4>
            <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-40">
              {JSON.stringify(apiData, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}