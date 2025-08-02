
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Send, MessageSquare } from 'lucide-react';

export function TestNotificationSender() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const sendTestWelcomeMessage = async () => {
    try {
      setIsLoading(true);
      
      // Send the actual welcome message to admin for testing
      const { data, error } = await supabase.functions.invoke('send-welcome-message', {
        body: {
          user: {
            telegram_id: 2138564172,
            first_name: "Admin",
            language_code: "he" // Hebrew for testing
          },
          isNewUser: true
        }
      });

      if (error) throw error;

      toast({
        title: "Test Welcome Message Sent!",
        description: "Check your Telegram for the updated welcome message with 4 main buttons.",
      });

    } catch (error) {
      console.error('Error sending test welcome message:', error);
      toast({
        title: "Error",
        description: "Failed to send test welcome message. Please try again.",
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
          Test Welcome Message
        </CardTitle>
        <CardDescription>
          Send the updated welcome message to yourself to test the new 4-button layout
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Test Details:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Sends the actual welcome message to you (admin)</li>
            <li>• Contains the new 4-button layout: Upload, Chat, Dashboard, Store</li>
            <li>• Hebrew language version for testing</li>
            <li>• Includes the comprehensive welcome text with features</li>
          </ul>
        </div>

        <Button 
          onClick={sendTestWelcomeMessage}
          disabled={isLoading}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          <Send className="h-4 w-4 mr-2" />
          {isLoading ? 'Sending Test Welcome...' : 'Send Test Welcome Message'}
        </Button>
      </CardContent>
    </Card>
  );
}
