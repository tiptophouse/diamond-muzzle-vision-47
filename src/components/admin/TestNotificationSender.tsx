
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
      
      // Send enhanced welcome message test to admin
      const { data, error } = await supabase.functions.invoke('send-welcome-message', {
        body: {
          user: {
            telegram_id: 2138564172,
            first_name: "Admin",
            language_code: "he" // Test Hebrew version
          },
          isNewUser: true
        }
      });

      if (error) throw error;

      toast({
        title: "Enhanced Welcome Message Sent!",
        description: "Check your Telegram for the comprehensive welcome message with 8-button navigation.",
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
          Test Enhanced Welcome Message
        </CardTitle>
        <CardDescription>
          Send a test enhanced welcome message to yourself with comprehensive inline keyboard
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Enhanced Features:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Detailed feature explanations in both Hebrew and English</li>
            <li>• 8-button comprehensive navigation keyboard</li>
            <li>• Direct access to: Upload, Store, AI Chat, Analytics, Inventory, Dashboard, Notifications, Settings</li>
            <li>• Follow-up tutorial message with interactive guide</li>
            <li>• Professional business-focused messaging</li>
            <li>• Mobile-friendly telegram mini app integration</li>
          </ul>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Test Coverage:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Hebrew language version (default)</li>
            <li>• All 8 navigation buttons functionality</li>
            <li>• Tutorial follow-up message (3 second delay)</li>
            <li>• Professional diamond trading context</li>
          </ul>
        </div>

        <Button 
          onClick={sendTestWelcomeMessage}
          disabled={isLoading}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          <Send className="h-4 w-4 mr-2" />
          {isLoading ? 'Sending Enhanced Welcome...' : 'Test Enhanced Welcome Message'}
        </Button>
      </CardContent>
    </Card>
  );
}
