import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

export function BackendAuthTester() {
  const [status, setStatus] = useState<string>('Ready to test');
  const [response, setResponse] = useState<any>(null);

  const testBackendAuth = async () => {
    try {
      setStatus('Testing backend...');
      
      // Get real Telegram initData if available
      const tg = (window as any).Telegram?.WebApp;
      const initData = tg?.initData || 'mock_init_data_for_testing';
      
      console.log('🧪 TEST: Using initData length:', initData.length);
      
      // Test 1: Backend alive check
      setStatus('Step 1/3: Testing backend health...');
      const aliveResponse = await fetch('https://api.mazalbot.com/api/v1/alive', {
        method: 'GET',
        mode: 'cors',
      });
      
      console.log('🧪 TEST: /alive status:', aliveResponse.status);
      
      if (!aliveResponse.ok) {
        throw new Error(`Backend not responding: ${aliveResponse.status}`);
      }
      
      // Test 2: Sign-in with different payload formats
      setStatus('Step 2/3: Testing sign-in endpoint...');
      
      const payloadFormats = [
        { name: 'init_data (snake_case)', payload: { init_data: initData } },
        { name: 'initData (camelCase)', payload: { initData: initData } },
        { name: 'telegram_init_data', payload: { telegram_init_data: initData } },
      ];
      
      for (const format of payloadFormats) {
        console.log(`🧪 TEST: Trying format: ${format.name}`);
        
        try {
          const signInResponse = await fetch('https://api.mazalbot.com/api/v1/sign-in/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            mode: 'cors',
            body: JSON.stringify(format.payload),
          });
          
          console.log(`🧪 TEST: ${format.name} - Status:`, signInResponse.status);
          
          const responseData = await signInResponse.json();
          console.log(`🧪 TEST: ${format.name} - Response:`, responseData);
          
          if (signInResponse.ok) {
            setStatus(`✅ SUCCESS with format: ${format.name}`);
            setResponse({
              format: format.name,
              status: signInResponse.status,
              data: responseData,
            });
            
            toast({
              title: "✅ Backend Auth Working!",
              description: `Format: ${format.name}`,
            });
            
            return; // Success!
          } else {
            console.warn(`🧪 TEST: ${format.name} failed:`, responseData);
          }
        } catch (error) {
          console.error(`🧪 TEST: ${format.name} error:`, error);
        }
      }
      
      // If we get here, all formats failed
      setStatus('❌ All payload formats failed');
      toast({
        title: "❌ Authentication Failed",
        description: "Backend not accepting any payload format",
        variant: "destructive",
      });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setStatus(`❌ Error: ${errorMessage}`);
      console.error('🧪 TEST: Fatal error:', error);
      
      toast({
        title: "❌ Test Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const testDirectFetch = async () => {
    try {
      setStatus('Testing direct backend call...');
      
      // Try the exact format we use in production
      const response = await fetch('https://api.mazalbot.com/api/v1/sign-in/', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Origin': window.location.origin,
        },
        mode: 'cors',
        credentials: 'omit',
        body: JSON.stringify({
          init_data: (window as any).Telegram?.WebApp?.initData || 'test_data'
        }),
      });
      
      console.log('🔍 Direct test status:', response.status);
      console.log('🔍 Direct test headers:', Object.fromEntries(response.headers.entries()));
      
      const text = await response.text();
      console.log('🔍 Direct test response:', text);
      
      setResponse({
        status: response.status,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries()),
        body: text,
      });
      
      setStatus(response.ok ? '✅ Success' : `❌ Failed: ${response.status}`);
      
    } catch (error) {
      console.error('🔍 Direct test error:', error);
      setStatus(`❌ Error: ${error}`);
    }
  };

  return (
    <Card className="p-6 space-y-4">
      <h2 className="text-2xl font-bold">🔍 Backend Auth Tester</h2>
      
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          Status: <strong>{status}</strong>
        </p>
        
        {response && (
          <div className="bg-muted p-4 rounded-lg overflow-auto max-h-96">
            <pre className="text-xs">
              {JSON.stringify(response, null, 2)}
            </pre>
          </div>
        )}
      </div>
      
      <div className="flex gap-2">
        <Button onClick={testBackendAuth}>
          Test All Formats
        </Button>
        
        <Button onClick={testDirectFetch} variant="outline">
          Test Direct Call
        </Button>
        
        <Button 
          onClick={() => {
            setStatus('Ready to test');
            setResponse(null);
          }}
          variant="secondary"
        >
          Clear
        </Button>
      </div>
      
      <div className="text-xs text-muted-foreground border-t pt-4">
        <p><strong>This tool tests:</strong></p>
        <ul className="list-disc list-inside space-y-1">
          <li>Backend health (/alive endpoint)</li>
          <li>Different payload formats (init_data, initData, telegram_init_data)</li>
          <li>Response structure and status codes</li>
          <li>CORS configuration</li>
        </ul>
      </div>
    </Card>
  );
}
