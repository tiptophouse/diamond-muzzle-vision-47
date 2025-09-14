import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const BotWebhookTester: React.FC = () => {
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const [isTestingMessage, setIsTestingMessage] = useState(false);
  const [testMessage, setTestMessage] = useState('Looking for 1ct round diamond, G color, VS1 clarity');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [testResults, setTestResults] = useState<any>(null);
  const { toast } = useToast();

  const testWebhookEndpoint = async () => {
    setIsTestingWebhook(true);
    try {
      const response = await fetch('https://uhhljqgxhdhbbhpohxll.functions.supabase.co/telegram-webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          update_id: 999999,
          message: {
            message_id: 1,
            from: {
              id: 123456789,
              first_name: "Test",
              username: "testuser"
            },
            chat: {
              id: -100123456789,
              type: "supergroup",
              title: "Test Group"
            },
            date: Math.floor(Date.now() / 1000),
            text: testMessage
          }
        })
      });

      const responseText = await response.text();
      
      setTestResults({
        status: response.status,
        statusText: response.statusText,
        body: responseText,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (response.ok) {
        toast({
          title: "Webhook Test Successful",
          description: `Status: ${response.status} - ${response.statusText}`,
        });
      } else {
        toast({
          title: "Webhook Test Failed",
          description: `Status: ${response.status} - ${response.statusText}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Webhook test error:', error);
      setTestResults({ error: error.message });
      toast({
        title: "Webhook Test Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsTestingWebhook(false);
    }
  };

  const checkBotMessages = async () => {
    setIsTestingMessage(true);
    try {
      const { data, error } = await supabase
        .from('chatbot_messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      setTestResults({
        type: 'database_check',
        messages: data,
        count: data?.length || 0
      });

      toast({
        title: "Database Check Complete",
        description: `Found ${data?.length || 0} bot messages`,
      });
    } catch (error) {
      console.error('Database check error:', error);
      toast({
        title: "Database Check Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsTestingMessage(false);
    }
  };

  const checkWebhookLogs = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('telegram-webhook', {
        body: { action: 'health_check' }
      });

      if (error) throw error;

      toast({
        title: "Function Health Check",
        description: "Webhook function is accessible",
      });
    } catch (error) {
      toast({
        title: "Function Health Check Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Bot Webhook Diagnostics</CardTitle>
          <CardDescription>
            Test and debug the Telegram webhook connection
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={testWebhookEndpoint}
              disabled={isTestingWebhook}
            >
              {isTestingWebhook ? 'Testing...' : 'Test Webhook'}
            </Button>
            
            <Button 
              onClick={checkBotMessages}
              disabled={isTestingMessage}
              variant="outline"
            >
              {isTestingMessage ? 'Checking...' : 'Check Messages'}
            </Button>
            
            <Button 
              onClick={checkWebhookLogs}
              variant="outline"
            >
              Health Check
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="test-message">Test Message</Label>
            <Textarea
              id="test-message"
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              placeholder="Enter a test message to simulate..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="webhook-url">Current Webhook URL</Label>
            <Input
              id="webhook-url"
              value="https://uhhljqgxhdhbbhpohxll.functions.supabase.co/telegram-webhook"
              readOnly
              className="bg-muted"
            />
          </div>
        </CardContent>
      </Card>

      {testResults && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-md overflow-auto text-sm">
              {JSON.stringify(testResults, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
};