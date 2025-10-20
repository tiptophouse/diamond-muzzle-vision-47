import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Send, AlertCircle, CheckCircle } from 'lucide-react';

export function BulkMessageSender() {
  const [isSending, setIsSending] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const sendBulkMessages = async () => {
    setIsSending(true);
    setResult(null);

    try {
      console.log('📢 Starting bulk payment reminder campaign...');
      
      const { data, error } = await supabase.functions.invoke('send-bulk-payment-reminder');

      if (error) throw error;

      console.log('✅ Campaign completed:', data);
      setResult(data);

      toast({
        title: "Campaign Sent!",
        description: `Successfully sent ${data.stats.messages_sent} messages to users`,
      });
    } catch (error) {
      console.error('❌ Campaign error:', error);
      toast({
        title: "Campaign Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          Bulk Payment Reminder
        </CardTitle>
        <CardDescription>
          Send /start payment reminder to all eligible users
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800 font-medium mb-2">📋 What will be sent:</p>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Message with /start payment link</li>
            <li>• "Pay to continue using platform" CTA</li>
            <li>• Inline button to activate payment</li>
            <li>• Contact support button</li>
            <li>• Blocked users automatically excluded</li>
          </ul>
        </div>

        <Button 
          onClick={sendBulkMessages} 
          disabled={isSending}
          className="w-full"
          size="lg"
        >
          {isSending ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
              Sending Messages...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Send to All Users
            </>
          )}
        </Button>

        {result && (
          <div className="space-y-2">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-800">Campaign Complete!</p>
                  <div className="text-xs text-green-700 mt-2 space-y-1">
                    <p>✅ Sent: {result.stats.messages_sent}</p>
                    <p>❌ Failed: {result.stats.messages_failed}</p>
                    <p>🚫 Blocked (excluded): {result.stats.blocked_users_excluded}</p>
                    <p>👥 Total users: {result.stats.total_users}</p>
                  </div>
                </div>
              </div>
            </div>

            {result.errors && result.errors.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-yellow-800">Some Errors Occurred</p>
                    <div className="text-xs text-yellow-700 mt-2 space-y-1">
                      {result.errors.slice(0, 5).map((err: string, idx: number) => (
                        <p key={idx}>• {err}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p className="text-xs text-gray-600">
                <strong>Start Link:</strong><br />
                <code className="bg-white px-2 py-1 rounded text-xs">{result.stats.start_link}</code>
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
