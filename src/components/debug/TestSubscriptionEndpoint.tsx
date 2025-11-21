import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export function TestSubscriptionEndpoint() {
  const [userId, setUserId] = useState('2138564172');
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const testEndpoint = async () => {
    setTesting(true);
    setResult(null);
    
    try {
      console.log('🧪 Testing subscription endpoint with user_id:', userId);
      
      const { data, error } = await supabase.functions.invoke('check-subscription-status', {
        body: { user_id: parseInt(userId) }
      });

      if (error) {
        console.error('❌ Error:', error);
        setResult({ error: error.message });
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
      } else {
        console.log('✅ Success:', data);
        setResult(data);
        toast({
          title: "Success",
          description: "Endpoint test completed"
        });
      }
    } catch (err: any) {
      console.error('❌ Exception:', err);
      setResult({ exception: err.message });
      toast({
        title: "Exception",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card className="p-6 space-y-4">
      <h3 className="text-lg font-semibold">Test Subscription Endpoint</h3>
      <p className="text-sm text-muted-foreground">
        Tests: https://api.mazalbot.com/api/v1/user/active-subscription
      </p>
      
      <div className="flex gap-2">
        <Input
          type="number"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="User ID"
          className="flex-1"
        />
        <Button 
          onClick={testEndpoint} 
          disabled={testing || !userId}
        >
          {testing ? 'Testing...' : 'Test Endpoint'}
        </Button>
      </div>

      {result && (
        <div className="mt-4">
          <h4 className="font-semibold mb-2">Result:</h4>
          <pre className="bg-muted p-4 rounded-md overflow-auto text-xs">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </Card>
  );
}
