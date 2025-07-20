import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Send, TestTube } from "lucide-react";

export function TestUploadReminder() {
  const { toast } = useToast();
  const [testing, setTesting] = useState(false);

  const sendTestReminder = async () => {
    setTesting(true);
    try {
      console.log('🧪 Sending test upload reminder to admin...');
      
      const { data, error } = await supabase.functions.invoke('test-upload-reminder', {
        body: {}
      });

      if (error) {
        throw error;
      }

      console.log('✅ Test reminder sent:', data);

      toast({
        title: "Test Sent Successfully! 🎉",
        description: "Check your Telegram for the upload reminder with the working deep link button.",
      });

    } catch (error) {
      console.error('❌ Failed to send test reminder:', error);
      toast({
        variant: "destructive",
        title: "Failed to Send Test",
        description: "There was an error sending the test notification. Check the console for details.",
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5 text-primary" />
          Test Upload Reminder
        </CardTitle>
        <CardDescription>
          Send a test upload reminder notification to yourself to verify the deep link works correctly
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-4 bg-accent/30 rounded-lg">
            <h4 className="font-medium mb-2">What this test will do:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Send notification only to admin (you)</li>
              <li>• Include the "Upload Your Diamonds" button</li>
              <li>• Test the Telegram Mini App deep link</li>
              <li>• Verify the button redirects to upload page</li>
            </ul>
          </div>
          
          <Button 
            onClick={sendTestReminder}
            disabled={testing}
            className="w-full"
          >
            <Send className="h-4 w-4 mr-2" />
            {testing ? "Sending Test..." : "Send Test Notification to Me"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}