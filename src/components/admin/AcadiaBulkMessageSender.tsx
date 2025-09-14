import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Send, Users, MessageSquare } from 'lucide-react';
import { useUserDiamondCounts } from '@/hooks/admin/useUserDiamondCounts';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';

const DEFAULT_ACADIA_MESSAGE = `🔗 **BrilliantBot – חיבור חדש למשתמשי Acadia 💎**

מהיום, כל שינוי שתעשו במערכת Acadia – מחיקה, עדכון או הוספה – יסתנכרן אוטומטית עם BrilliantBot!
כך תוכלו לקבל התראות בזמן אמת ולעבוד בצורה חכמה ומהירה יותר. 🚀

**איך מתחברים?**
1️⃣ היכנסו ל-@diamondmazalbot
2️⃣ הקלידו: /provide_sftp או לחצו על Menu → Generate SFTP
3️⃣ הבוט ייצור עבורכם פרטי חיבור אישיים
4️⃣ העתיקו את ההודעה ושלחו אותה ל-Acadia
5️⃣ לאחר החיבור, כל פעולה ב-Acadia תופיע גם ב-BrilliantBot אוטומטית

📌 **חשוב לדעת:** השירות מיועד אך ורק למשתמשי Acadia

💼 **BrilliantBot – לא רק למסחר, אלא להפוך את העבודה שלכם ליותר חכמה**`;

export function AcadiaBulkMessageSender() {
  const { toast } = useToast();
  const { user } = useTelegramWebApp();
  const [message, setMessage] = useState(DEFAULT_ACADIA_MESSAGE);
  const [isLoading, setIsLoading] = useState(false);
  const { userCounts, stats, loading: diamondCountsLoading } = useUserDiamondCounts();

  const sendToAll = async () => {
    if (!user?.id) {
      toast({
        title: "Authentication Error",
        description: "User not authenticated",
        variant: "destructive",
      });
      return;
    }

    if (!message.trim()) {
      toast({
        title: "Message Required",
        description: "Please enter a message to send",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

      const { data, error } = await supabase.functions.invoke('send-bulk-acadia-message', {
        body: {
          message: message.trim(),
          senderName: user.first_name || 'Admin',
          senderId: user.id,
          users: userCounts,
          testMode: false
        }
      });

      if (error) throw error;

      toast({
        title: "Message Sent Successfully! 📨",
        description: `Acadia message sent to ${userCounts.length} users`,
      });

    } catch (error) {
      console.error('Error sending bulk message:', error);
      toast({
        title: "Failed to Send Message",
        description: "Could not send the bulk message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendTestMessage = async () => {
    if (!user?.id) {
      toast({
        title: "Authentication Error",
        description: "User not authenticated",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

      const testMessage = `🧪 **Test Message**

${message.trim()}

*This is a test message - would be sent to ${userCounts.length} users*`;

      const { data, error } = await supabase.functions.invoke('send-bulk-acadia-message', {
        body: {
          message: testMessage,
          senderName: user.first_name || 'Admin',
          senderId: user.id,
          users: [], // Empty for test mode
          testMode: true
        }
      });

      if (error) throw error;

      toast({
        title: "Test Message Sent! ✅",
        description: "Check your Telegram for the test message",
      });

    } catch (error) {
      console.error('Error sending test message:', error);
      toast({
        title: "Test Failed",
        description: "Failed to send test message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (diamondCountsLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span>Loading user data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Acadia Bulk Message Sender
        </CardTitle>
        <CardDescription>
          Send Acadia connection message to all registered users
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted/50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">How it works:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Edit the message content below (Hebrew/English supported)</li>
            <li>• Send test message to admin first to verify format</li>
            <li>• Send to all users when ready</li>
            <li>• Message includes SFTP connection instructions for Acadia users</li>
          </ul>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-blue-600" />
            <span className="font-medium">Target Audience</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Total Users:</span>
              <span className="ml-2 font-medium">{stats.totalUsers}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Active Users:</span>
              <span className="ml-2 font-medium text-green-600">{stats.usersWithDiamonds + stats.usersWithZeroDiamonds}</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium">Message Content</label>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter your message content here..."
            className="min-h-[300px] font-mono text-sm"
          />
          <div className="text-xs text-muted-foreground">
            Characters: {message.length} | Preview shows exactly how users will see it
          </div>
        </div>

        {message.trim() && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-4 rounded-lg border border-green-200 dark:border-green-700">
            <h4 className="font-medium mb-2 text-green-800 dark:text-green-200">
              📱 Message Preview
            </h4>
            <div className="text-sm whitespace-pre-wrap bg-white dark:bg-gray-800 p-3 rounded border">
              {message}
            </div>
          </div>
        )}

        <div className="flex gap-2 flex-wrap">
          <Button 
            onClick={sendTestMessage}
            disabled={isLoading || !message.trim()}
            variant="outline"
            className="border-blue-600 text-blue-600 hover:bg-blue-50"
          >
            <Send className="h-4 w-4 mr-2" />
            {isLoading ? 'Sending...' : 'Send Test Message'}
          </Button>
          
          <Button 
            onClick={sendToAll}
            disabled={isLoading || !message.trim()}
            className="bg-green-600 hover:bg-green-700"
          >
            <Send className="h-4 w-4 mr-2" />
            {isLoading ? 'Sending...' : `Send to All Users (${userCounts.length})`}
          </Button>
        </div>

        {userCounts.length === 0 && (
          <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <Users className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              No users found. The message cannot be sent without registered users.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}