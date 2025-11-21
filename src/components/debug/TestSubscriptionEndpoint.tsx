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
    <Card className="p-4 md:p-6 space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Test Subscription Endpoint</h3>
        <p className="text-xs md:text-sm text-muted-foreground mt-1">
          Tests: https://api.mazalbot.com/api/v1/user/active-subscription
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-2">
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
          className="w-full sm:w-auto"
        >
          {testing ? 'Testing...' : 'Test Endpoint'}
        </Button>
      </div>

      <div className="border rounded-lg p-4 bg-muted/50 min-h-[200px]">
        <h4 className="font-semibold mb-3 text-sm">Response:</h4>
        {testing ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : result ? (
          <pre className="bg-background p-3 rounded-md overflow-auto text-xs max-h-[400px] border">
            {JSON.stringify(result, null, 2)}
          </pre>
        ) : (
          <p className="text-sm text-muted-foreground italic">
            Click "Test Endpoint" to see the response here
          </p>
        )}
      </div>
    </Card>
  );
}
