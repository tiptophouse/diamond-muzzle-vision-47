
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { signInToBackend, getBackendAuthToken } from '@/lib/api/auth';
import { getCurrentUserId } from '@/lib/api/config';
import { http } from '@/api/http';
import { apiEndpoints } from '@/lib/api/endpoints';

export function AuthFlowTest() {
  const [status, setStatus] = useState<string>('Ready to test');
  const [loading, setLoading] = useState(false);

  const testAuthFlow = async () => {
    setLoading(true);
    setStatus('Testing authentication flow...');

    try {
      // Step 1: Check if we're in Telegram
      if (!window.Telegram?.WebApp) {
        setStatus('❌ Not in Telegram WebApp environment');
        return;
      }

      const tg = window.Telegram.WebApp;
      setStatus('✅ Telegram WebApp detected');

      // Step 2: Check for initData
      if (!tg.initData) {
        setStatus('❌ No initData available');
        return;
      }

      setStatus('✅ InitData found, authenticating...');

      // Step 3: Sign in to backend
      const token = await signInToBackend(tg.initData);
      if (!token) {
        setStatus('❌ Backend authentication failed');
        return;
      }

      setStatus('✅ JWT token received');

      // Step 4: Test protected endpoint
      const userId = getCurrentUserId();
      if (!userId) {
        setStatus('❌ No user ID available');
        return;
      }

      setStatus('✅ Testing protected API call...');

      const response = await http(apiEndpoints.getAllStones(userId));
      setStatus(`✅ Authentication flow complete! Got ${Array.isArray(response) ? response.length : 'data'} from API`);

    } catch (error) {
      setStatus(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const checkCurrentAuth = () => {
    const token = getBackendAuthToken();
    const userId = getCurrentUserId();
    
    setStatus(`Current state:
    - Token: ${token ? '✅ Present' : '❌ Missing'}
    - User ID: ${userId || '❌ Missing'}
    - Telegram: ${window.Telegram?.WebApp ? '✅ Available' : '❌ Missing'}`);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>🔐 Auth Flow Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm whitespace-pre-line bg-gray-100 p-3 rounded">
          {status}
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={testAuthFlow} 
            disabled={loading}
            className="flex-1"
          >
            {loading ? 'Testing...' : 'Test Full Flow'}
          </Button>
          
          <Button 
            onClick={checkCurrentAuth}
            variant="outline"
            className="flex-1"
          >
            Check Status
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
