
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Send, MessageSquare, TestTube } from 'lucide-react';

export function TelegramTestSender() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [telegramId, setTelegramId] = useState('2138564172'); // Default to admin ID
  const [testMessage, setTestMessage] = useState('🤖 Test message from BrilliantBot!\n\nThis is a test message to verify the Telegram bot API is working correctly.\n\nTimestamp: ' + new Date().toLocaleString());

  const sendTestMessage = async () => {
    if (!telegramId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a Telegram ID",
        variant: "destructive",
      });
      return;
    }

    if (!testMessage.trim()) {
      toast({
        title: "Error", 
        description: "Please enter a test message",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('🚀 Sending test message...', { telegramId, message: testMessage });
      
      const { data, error } = await supabase.functions.invoke('send-telegram-message', {
        body: {
          telegramId: parseInt(telegramId),
          message: testMessage,
          directMessage: true
        }
      });

      if (error) {
        console.error('❌ Error sending test message:', error);
        toast({
          title: "Test Failed",
          description: `Failed to send test message: ${error.message}`,
          variant: "destructive",
        });
        return;
      }

      console.log('✅ Test message sent successfully:', data);
      
      toast({
        title: "Test Successful! ✅",
        description: `Test message sent successfully to Telegram ID: ${telegramId}`,
      });

    } catch (error: any) {
      console.error('❌ Test message error:', error);
      toast({
        title: "Test Failed",
        description: `Error: ${error.message || 'Unknown error occurred'}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          Telegram Bot API Test
        </CardTitle>
        <CardDescription>
          Send a test message to verify the Telegram bot API is working correctly
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Test Details:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Uses the send-telegram-message edge function</li>
            <li>• Sends a direct message (bypasses stone data formatting)</li>
            <li>• Tests the complete Telegram bot API integration</li>
            <li>• Default recipient is admin (you can change it)</li>
          </ul>
        </div>

        <div className="space-y-2">
          <Label htmlFor="telegramId">Telegram ID</Label>
          <Input
            id="telegramId"
            type="number"
            value={telegramId}
            onChange={(e) => setTelegramId(e.target.value)}
            placeholder="Enter Telegram ID"
          />
          <p className="text-xs text-muted-foreground">
            Default is admin ID (2138564172). You can change this to test with other users.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="testMessage">Test Message</Label>
          <Textarea
            id="testMessage"
            value={testMessage}
            onChange={(e) => setTestMessage(e.target.value)}
            placeholder="Enter your test message..."
            rows={4}
          />
          <p className="text-xs text-muted-foreground">
            {testMessage.length}/1000 characters
          </p>
        </div>

        <Button 
          onClick={sendTestMessage}
          disabled={isLoading || !telegramId.trim() || !testMessage.trim()}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          <Send className="h-4 w-4 mr-2" />
          {isLoading ? 'Sending Test Message...' : 'Send Test Message'}
        </Button>

        {isLoading && (
          <div className="text-center">
            <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <MessageSquare className="h-4 w-4 animate-pulse" />
              Testing Telegram bot API...
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
