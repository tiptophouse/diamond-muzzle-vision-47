import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Send, MessageSquare } from 'lucide-react';

export function TestNotificationSender() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const sendTestNotification = async () => {
    try {
      setIsLoading(true);
      
      // Send test notification just to admin
      const { data, error } = await supabase.functions.invoke('send-upload-reminder', {
        body: {
          users: [{
            telegram_id: 2138564172,
            first_name: "Admin"
          }],
          includeAdmin: false // Don't duplicate since we're sending directly to admin
        }
      });

      if (error) throw error;

      toast({
        title: "Test Notification Sent!",
        description: "Check your Telegram for the upload reminder message with the button.",
      });

    } catch (error) {
      console.error('Error sending test notification:', error);
      toast({
        title: "Error",
        description: "Failed to send test notification. Please try again.",
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
          <MessageSquare className="h-5 w-5" />
          Test Notification
        </CardTitle>
        <CardDescription>
          Send a test upload reminder notification to yourself to verify the button works
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Test Details:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Sends notification only to you (admin)</li>
            <li>• Contains the "📤 Upload Your Diamonds" button</li>
            <li>• Button should redirect to /upload-single-stone</li>
            <li>• Perfect for testing the redirect functionality</li>
          </ul>
        </div>

        <Button 
          onClick={sendTestNotification}
          disabled={isLoading}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          <Send className="h-4 w-4 mr-2" />
          {isLoading ? 'Sending Test...' : 'Send Test Notification to Me'}
        </Button>
      </CardContent>
    </Card>
  );
}